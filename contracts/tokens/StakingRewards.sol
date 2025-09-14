// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./YieldToken.sol";

/**
 * @title StakingRewards
 * @dev Contract for staking LYT tokens and earning rewards
 * Features: Multiple staking pools, flexible lock periods, compound rewards
 */
contract StakingRewards is Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for YieldToken;

    // Staking pool structure
    struct StakingPool {
        uint256 lockPeriod;        // Lock period in seconds
        uint256 rewardRate;        // Reward rate per second (in wei)
        uint256 totalStaked;       // Total tokens staked in this pool
        uint256 totalRewards;      // Total rewards distributed
        bool isActive;             // Whether pool is active
        uint256 minStakeAmount;    // Minimum stake amount
        uint256 maxStakeAmount;    // Maximum stake amount (0 = no limit)
    }

    // User stake information
    struct UserStake {
        uint256 amount;            // Staked amount
        uint256 poolId;            // Pool ID
        uint256 stakeTime;         // When user staked
        uint256 unlockTime;        // When stake can be unstaked
        uint256 lastClaimTime;     // Last time rewards were claimed
        uint256 pendingRewards;    // Pending rewards
        bool isActive;             // Whether stake is active
    }

    // Contract state
    YieldToken public immutable yieldToken;
    IERC20 public immutable stakingToken; // USDT or other token
    
    StakingPool[] public stakingPools;
    mapping(address => UserStake[]) public userStakes;
    mapping(address => uint256) public totalUserStaked;
    mapping(address => uint256) public totalUserRewards;
    
    // Global state
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    uint256 public constant MAX_POOLS = 10;
    
    // Events
    event PoolCreated(uint256 indexed poolId, uint256 lockPeriod, uint256 rewardRate);
    event Staked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 unlockTime);
    event Unstaked(address indexed user, uint256 indexed stakeId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 indexed stakeId, uint256 amount);
    event PoolUpdated(uint256 indexed poolId, uint256 rewardRate, bool isActive);
    event EmergencyWithdraw(address indexed user, uint256 indexed stakeId, uint256 amount);

    constructor(address _yieldToken, address _stakingToken) {
        require(_yieldToken != address(0), "Invalid yield token address");
        require(_stakingToken != address(0), "Invalid staking token address");
        
        yieldToken = YieldToken(_yieldToken);
        stakingToken = IERC20(_stakingToken);
        
        // Create default pools
        _createPool(7 days, 1e15, 100 * 1e6, 0);      // 7-day pool: 0.001 tokens/sec, min 100 USDT
        _createPool(30 days, 2e15, 500 * 1e6, 0);     // 30-day pool: 0.002 tokens/sec, min 500 USDT
        _createPool(90 days, 4e15, 1000 * 1e6, 0);    // 90-day pool: 0.004 tokens/sec, min 1000 USDT
        _createPool(365 days, 8e15, 5000 * 1e6, 0);  // 1-year pool: 0.008 tokens/sec, min 5000 USDT
    }

    /**
     * @dev Create a new staking pool
     * @param lockPeriod Lock period in seconds
     * @param rewardRate Reward rate per second
     * @param minStakeAmount Minimum stake amount
     * @param maxStakeAmount Maximum stake amount (0 = no limit)
     */
    function createPool(
        uint256 lockPeriod,
        uint256 rewardRate,
        uint256 minStakeAmount,
        uint256 maxStakeAmount
    ) external onlyOwner {
        require(stakingPools.length < MAX_POOLS, "Maximum pools reached");
        require(lockPeriod > 0, "Invalid lock period");
        require(rewardRate > 0, "Invalid reward rate");
        
        _createPool(lockPeriod, rewardRate, minStakeAmount, maxStakeAmount);
    }

    /**
     * @dev Internal function to create a pool
     */
    function _createPool(
        uint256 lockPeriod,
        uint256 rewardRate,
        uint256 minStakeAmount,
        uint256 maxStakeAmount
    ) internal {
        uint256 poolId = stakingPools.length;
        
        stakingPools.push(StakingPool({
            lockPeriod: lockPeriod,
            rewardRate: rewardRate,
            totalStaked: 0,
            totalRewards: 0,
            isActive: true,
            minStakeAmount: minStakeAmount,
            maxStakeAmount: maxStakeAmount
        }));
        
        emit PoolCreated(poolId, lockPeriod, rewardRate);
    }

    /**
     * @dev Stake tokens in a pool
     * @param poolId The pool ID to stake in
     * @param amount The amount to stake
     */
    function stake(uint256 poolId, uint256 amount) external nonReentrant whenNotPaused {
        require(poolId < stakingPools.length, "Invalid pool ID");
        require(amount > 0, "Amount must be greater than zero");
        
        StakingPool storage pool = stakingPools[poolId];
        require(pool.isActive, "Pool is not active");
        require(amount >= pool.minStakeAmount, "Amount below minimum");
        require(pool.maxStakeAmount == 0 || amount <= pool.maxStakeAmount, "Amount exceeds maximum");
        
        // Transfer staking tokens from user
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Calculate unlock time
        uint256 unlockTime = block.timestamp.add(pool.lockPeriod);
        
        // Create user stake
        userStakes[msg.sender].push(UserStake({
            amount: amount,
            poolId: poolId,
            stakeTime: block.timestamp,
            unlockTime: unlockTime,
            lastClaimTime: block.timestamp,
            pendingRewards: 0,
            isActive: true
        }));
        
        // Update pool and user totals
        pool.totalStaked = pool.totalStaked.add(amount);
        totalStaked = totalStaked.add(amount);
        totalUserStaked[msg.sender] = totalUserStaked[msg.sender].add(amount);
        
        emit Staked(msg.sender, poolId, amount, unlockTime);
    }

    /**
     * @dev Unstake tokens from a pool
     * @param stakeId The stake ID to unstake
     */
    function unstake(uint256 stakeId) external nonReentrant {
        require(stakeId < userStakes[msg.sender].length, "Invalid stake ID");
        
        UserStake storage userStake = userStakes[msg.sender][stakeId];
        require(userStake.isActive, "Stake is not active");
        require(block.timestamp >= userStake.unlockTime, "Stake is still locked");
        
        // Claim any pending rewards first
        _claimRewards(msg.sender, stakeId);
        
        uint256 amount = userStake.amount;
        
        // Update pool and user totals
        StakingPool storage pool = stakingPools[userStake.poolId];
        pool.totalStaked = pool.totalStaked.sub(amount);
        totalStaked = totalStaked.sub(amount);
        totalUserStaked[msg.sender] = totalUserStaked[msg.sender].sub(amount);
        
        // Mark stake as inactive
        userStake.isActive = false;
        
        // Transfer tokens back to user
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, stakeId, amount);
    }

    /**
     * @dev Claim rewards for a specific stake
     * @param stakeId The stake ID to claim rewards for
     */
    function claimRewards(uint256 stakeId) external nonReentrant {
        require(stakeId < userStakes[msg.sender].length, "Invalid stake ID");
        _claimRewards(msg.sender, stakeId);
    }

    /**
     * @dev Claim all pending rewards for a user
     */
    function claimAllRewards() external nonReentrant {
        uint256 totalClaimed = 0;
        
        for (uint256 i = 0; i < userStakes[msg.sender].length; i++) {
            if (userStakes[msg.sender][i].isActive) {
                totalClaimed = totalClaimed.add(_claimRewards(msg.sender, i));
            }
        }
        
        require(totalClaimed > 0, "No rewards to claim");
    }

    /**
     * @dev Internal function to claim rewards
     * @param user The user address
     * @param stakeId The stake ID
     * @return The amount of rewards claimed
     */
    function _claimRewards(address user, uint256 stakeId) internal returns (uint256) {
        UserStake storage userStake = userStakes[user][stakeId];
        require(userStake.isActive, "Stake is not active");
        
        // Calculate pending rewards
        uint256 pendingRewards = calculatePendingRewards(user, stakeId);
        require(pendingRewards > 0, "No rewards to claim");
        
        // Update stake
        userStake.pendingRewards = 0;
        userStake.lastClaimTime = block.timestamp;
        
        // Update totals
        totalRewardsDistributed = totalRewardsDistributed.add(pendingRewards);
        totalUserRewards[user] = totalUserRewards[user].add(pendingRewards);
        
        StakingPool storage pool = stakingPools[userStake.poolId];
        pool.totalRewards = pool.totalRewards.add(pendingRewards);
        
        // Transfer rewards to user
        yieldToken.safeTransfer(user, pendingRewards);
        
        emit RewardsClaimed(user, stakeId, pendingRewards);
        
        return pendingRewards;
    }

    /**
     * @dev Calculate pending rewards for a stake
     * @param user The user address
     * @param stakeId The stake ID
     * @return The pending rewards amount
     */
    function calculatePendingRewards(address user, uint256 stakeId) public view returns (uint256) {
        if (stakeId >= userStakes[user].length) {
            return 0;
        }
        
        UserStake memory userStake = userStakes[user][stakeId];
        if (!userStake.isActive) {
            return 0;
        }
        
        StakingPool memory pool = stakingPools[userStake.poolId];
        
        // Calculate time elapsed since last claim
        uint256 timeElapsed = block.timestamp.sub(userStake.lastClaimTime);
        
        // Calculate rewards: amount * time * rate
        uint256 rewards = userStake.amount.mul(timeElapsed).mul(pool.rewardRate).div(1e18);
        
        return rewards.add(userStake.pendingRewards);
    }

    /**
     * @dev Get user's total pending rewards across all stakes
     * @param user The user address
     * @return The total pending rewards
     */
    function getTotalPendingRewards(address user) external view returns (uint256) {
        uint256 totalPending = 0;
        
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            totalPending = totalPending.add(calculatePendingRewards(user, i));
        }
        
        return totalPending;
    }

    /**
     * @dev Get user's stake information
     * @param user The user address
     * @return stakes Array of user stakes
     * @return totalStaked Total amount staked by user
     * @return totalRewards Total rewards earned by user
     */
    function getUserStakeInfo(address user) external view returns (
        UserStake[] memory stakes,
        uint256 totalStaked,
        uint256 totalRewards
    ) {
        stakes = userStakes[user];
        totalStaked = totalUserStaked[user];
        totalRewards = totalUserRewards[user];
    }

    /**
     * @dev Get pool information
     * @param poolId The pool ID
     * @return pool The pool information
     */
    function getPoolInfo(uint256 poolId) external view returns (StakingPool memory pool) {
        require(poolId < stakingPools.length, "Invalid pool ID");
        return stakingPools[poolId];
    }

    /**
     * @dev Get all pools information
     * @return pools Array of all pools
     */
    function getAllPools() external view returns (StakingPool[] memory pools) {
        return stakingPools;
    }

    /**
     * @dev Update pool parameters (only owner)
     * @param poolId The pool ID to update
     * @param rewardRate New reward rate
     * @param isActive Whether pool is active
     */
    function updatePool(uint256 poolId, uint256 rewardRate, bool isActive) external onlyOwner {
        require(poolId < stakingPools.length, "Invalid pool ID");
        require(rewardRate > 0, "Invalid reward rate");
        
        StakingPool storage pool = stakingPools[poolId];
        pool.rewardRate = rewardRate;
        pool.isActive = isActive;
        
        emit PoolUpdated(poolId, rewardRate, isActive);
    }

    /**
     * @dev Emergency withdraw (only owner)
     * @param user The user address
     * @param stakeId The stake ID
     */
    function emergencyWithdraw(address user, uint256 stakeId) external onlyOwner {
        require(stakeId < userStakes[user].length, "Invalid stake ID");
        
        UserStake storage userStake = userStakes[user][stakeId];
        require(userStake.isActive, "Stake is not active");
        
        uint256 amount = userStake.amount;
        
        // Update totals
        StakingPool storage pool = stakingPools[userStake.poolId];
        pool.totalStaked = pool.totalStaked.sub(amount);
        totalStaked = totalStaked.sub(amount);
        totalUserStaked[user] = totalUserStaked[user].sub(amount);
        
        // Mark stake as inactive
        userStake.isActive = false;
        
        // Transfer tokens to user
        stakingToken.safeTransfer(user, amount);
        
        emit EmergencyWithdraw(user, stakeId, amount);
    }

    /**
     * @dev Pause contract (emergency function)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get contract statistics
     * @return totalStaked Total tokens staked across all pools
     * @return totalRewards Total rewards distributed
     * @return poolCount Number of active pools
     */
    function getContractStats() external view returns (
        uint256 totalStaked,
        uint256 totalRewards,
        uint256 poolCount
    ) {
        totalStaked = totalStaked;
        totalRewards = totalRewardsDistributed;
        poolCount = stakingPools.length;
    }
}



