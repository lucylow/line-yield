// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title YieldToken
 * @dev ERC20 Token for governance and rewards for LINE Yield protocol users
 * Features: Minting, burning, pausing, incentives distribution, and yield farming rewards
 */
contract YieldToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // Token distribution parameters
    uint256 public constant MAX_SUPPLY = 10_000_000 * 1e18;  // 10 million tokens max supply
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 1e18; // 1 million tokens initial supply
    
    // Distribution allocations (in basis points - 10000 = 100%)
    uint256 public constant TEAM_ALLOCATION = 2000;      // 20%
    uint256 public constant TREASURY_ALLOCATION = 1000;  // 10%
    uint256 public constant INCENTIVES_ALLOCATION = 5000; // 50%
    uint256 public constant PUBLIC_SALE_ALLOCATION = 2000; // 20%

    // Token distribution tracking
    mapping(address => uint256) public allocations;
    mapping(address => bool) public authorizedMinters;
    mapping(address => uint256) public userRewards;
    mapping(address => uint256) public lastClaimTime;
    
    // Reward pools
    uint256 public incentivesPool;
    uint256 public stakingRewardsPool;
    uint256 public referralRewardsPool;
    
    // Reward parameters
    uint256 public constant REWARD_RATE_PER_SECOND = 1e15; // 0.001 tokens per second
    uint256 public constant CLAIM_COOLDOWN = 1 days;
    
    // Events
    event IncentivesGranted(address indexed user, uint256 amount, string reason);
    event RewardsClaimed(address indexed user, uint256 amount);
    event PoolRefilled(address indexed pool, uint256 amount);
    event AuthorizedMinterUpdated(address indexed minter, bool authorized);
    event TokensMinted(address indexed to, uint256 amount, string purpose);

    constructor() ERC20("LINE Yield Token", "LYT") {
        // Mint initial allocations
        uint256 teamAllocation = (INITIAL_SUPPLY * TEAM_ALLOCATION) / 10000;
        uint256 treasuryAllocation = (INITIAL_SUPPLY * TREASURY_ALLOCATION) / 10000;
        uint256 incentivesAllocation = (INITIAL_SUPPLY * INCENTIVES_ALLOCATION) / 10000;
        uint256 publicSaleAllocation = (INITIAL_SUPPLY * PUBLIC_SALE_ALLOCATION) / 10000;

        // Mint to owner (team + treasury + public sale)
        _mint(msg.sender, teamAllocation + treasuryAllocation + publicSaleAllocation);
        
        // Mint to contract for incentives pool
        _mint(address(this), incentivesAllocation);
        
        // Track allocations
        allocations[msg.sender] = teamAllocation + treasuryAllocation + publicSaleAllocation;
        allocations[address(this)] = incentivesAllocation;
        
        // Initialize reward pools
        incentivesPool = incentivesAllocation;
        stakingRewardsPool = 0;
        referralRewardsPool = 0;
        
        // Authorize owner as minter
        authorizedMinters[msg.sender] = true;
        
        emit TokensMinted(msg.sender, teamAllocation + treasuryAllocation + publicSaleAllocation, "Initial Distribution");
        emit TokensMinted(address(this), incentivesAllocation, "Incentives Pool");
    }

    /**
     * @dev Distribute incentives tokens to a user
     * @param user The address of the user to reward
     * @param amount The amount of incentives tokens to grant
     * @param reason The reason for the reward (e.g., "deposit", "referral", "yield_farming")
     */
    function grantIncentives(
        address user, 
        uint256 amount, 
        string calldata reason
    ) external onlyAuthorizedMinter nonReentrant {
        require(user != address(0), "Cannot grant to zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(incentivesPool >= amount, "Not enough tokens in incentives pool");
        
        // Transfer from incentives pool to user
        incentivesPool = incentivesPool.sub(amount);
        _transfer(address(this), user, amount);
        
        // Update user rewards tracking
        userRewards[user] = userRewards[user].add(amount);
        
        emit IncentivesGranted(user, amount, reason);
    }

    /**
     * @dev Batch distribute incentives to multiple users
     * @param users Array of user addresses
     * @param amounts Array of amounts to distribute
     * @param reason The reason for the rewards
     */
    function batchGrantIncentives(
        address[] calldata users,
        uint256[] calldata amounts,
        string calldata reason
    ) external onlyAuthorizedMinter nonReentrant {
        require(users.length == amounts.length, "Arrays length mismatch");
        require(users.length > 0, "Empty arrays");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount = totalAmount.add(amounts[i]);
        }
        
        require(incentivesPool >= totalAmount, "Not enough tokens in incentives pool");
        
        incentivesPool = incentivesPool.sub(totalAmount);
        
        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Cannot grant to zero address");
            require(amounts[i] > 0, "Amount must be greater than zero");
            
            _transfer(address(this), users[i], amounts[i]);
            userRewards[users[i]] = userRewards[users[i]].add(amounts[i]);
            
            emit IncentivesGranted(users[i], amounts[i], reason);
        }
    }

    /**
     * @dev Calculate pending rewards for a user based on their staked amount and time
     * @param user The user address
     * @param stakedAmount The amount of tokens staked
     * @param stakingDuration The duration of staking in seconds
     * @return The calculated reward amount
     */
    function calculateStakingReward(
        address user,
        uint256 stakedAmount,
        uint256 stakingDuration
    ) public view returns (uint256) {
        if (stakingDuration == 0 || stakedAmount == 0) {
            return 0;
        }
        
        // Base reward calculation: stakedAmount * duration * rate
        uint256 baseReward = stakedAmount.mul(stakingDuration).mul(REWARD_RATE_PER_SECOND).div(1e18);
        
        // Apply multipliers based on staking duration
        uint256 multiplier = 10000; // 100% base
        
        if (stakingDuration >= 30 days) {
            multiplier = 12000; // 20% bonus for 30+ days
        } else if (stakingDuration >= 90 days) {
            multiplier = 15000; // 50% bonus for 90+ days
        } else if (stakingDuration >= 365 days) {
            multiplier = 20000; // 100% bonus for 1+ year
        }
        
        return baseReward.mul(multiplier).div(10000);
    }

    /**
     * @dev Claim staking rewards for a user
     * @param user The user address
     * @param stakedAmount The amount of tokens staked
     * @param stakingDuration The duration of staking in seconds
     */
    function claimStakingRewards(
        address user,
        uint256 stakedAmount,
        uint256 stakingDuration
    ) external onlyAuthorizedMinter nonReentrant {
        require(user != address(0), "Cannot claim for zero address");
        require(block.timestamp >= lastClaimTime[user].add(CLAIM_COOLDOWN), "Claim cooldown not met");
        
        uint256 rewardAmount = calculateStakingReward(user, stakedAmount, stakingDuration);
        require(rewardAmount > 0, "No rewards to claim");
        require(stakingRewardsPool >= rewardAmount, "Not enough tokens in staking rewards pool");
        
        // Update pools and transfer tokens
        stakingRewardsPool = stakingRewardsPool.sub(rewardAmount);
        _transfer(address(this), user, rewardAmount);
        
        // Update tracking
        userRewards[user] = userRewards[user].add(rewardAmount);
        lastClaimTime[user] = block.timestamp;
        
        emit RewardsClaimed(user, rewardAmount);
    }

    /**
     * @dev Refill reward pools (only owner)
     * @param poolType The type of pool to refill (0: incentives, 1: staking, 2: referral)
     * @param amount The amount to add to the pool
     */
    function refillPool(uint256 poolType, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(address(this)) >= amount, "Not enough tokens in contract");
        
        if (poolType == 0) {
            incentivesPool = incentivesPool.add(amount);
            emit PoolRefilled(address(this), amount);
        } else if (poolType == 1) {
            stakingRewardsPool = stakingRewardsPool.add(amount);
            emit PoolRefilled(address(this), amount);
        } else if (poolType == 2) {
            referralRewardsPool = referralRewardsPool.add(amount);
            emit PoolRefilled(address(this), amount);
        } else {
            revert("Invalid pool type");
        }
    }

    /**
     * @dev Mint additional tokens (only authorized minters)
     * @param to The address to mint tokens to
     * @param amount The amount to mint
     * @param purpose The purpose of minting
     */
    function mintTokens(
        address to,
        uint256 amount,
        string calldata purpose
    ) external onlyAuthorizedMinter {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(totalSupply().add(amount) <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, purpose);
    }

    /**
     * @dev Authorize or deauthorize a minter
     * @param minter The address to authorize/deauthorize
     * @param authorized Whether to authorize or deauthorize
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        require(minter != address(0), "Cannot set zero address");
        authorizedMinters[minter] = authorized;
        emit AuthorizedMinterUpdated(minter, authorized);
    }

    /**
     * @dev Burn tokens from incentives pool
     * @param amount The amount to burn
     */
    function burnIncentiveTokens(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(address(this)) >= amount, "Not enough tokens to burn");
        
        _burn(address(this), amount);
        
        // Reduce incentives pool if burning from it
        if (incentivesPool >= amount) {
            incentivesPool = incentivesPool.sub(amount);
        }
    }

    /**
     * @dev Pause token transfers (emergency function)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get pool balances
     * @return incentives The incentives pool balance
     * @return staking The staking rewards pool balance
     * @return referral The referral rewards pool balance
     */
    function getPoolBalances() external view returns (uint256 incentives, uint256 staking, uint256 referral) {
        return (incentivesPool, stakingRewardsPool, referralRewardsPool);
    }

    /**
     * @dev Get user reward information
     * @param user The user address
     * @return totalRewards Total rewards earned by user
     * @return lastClaim Last claim timestamp
     * @return canClaim Whether user can claim now
     */
    function getUserRewardInfo(address user) external view returns (
        uint256 totalRewards,
        uint256 lastClaim,
        bool canClaim
    ) {
        totalRewards = userRewards[user];
        lastClaim = lastClaimTime[user];
        canClaim = block.timestamp >= lastClaim.add(CLAIM_COOLDOWN);
    }

    // Modifiers
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized minter");
        _;
    }

    // Override required functions for multiple inheritance
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
}

