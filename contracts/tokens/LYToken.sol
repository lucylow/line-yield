// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title LYToken
 * @dev LINE Yield Governance Token with voting, staking, and fee discount features
 * @author LINE Yield Team
 */
contract LYToken is ERC20, ERC20Permit, ERC20Votes, ERC20Burnable, Ownable, Pausable, ReentrancyGuard {
    using SafeMath for uint256;

    // Token configuration
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion LY
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million initial supply
    
    // Fee discount tiers
    struct DiscountTier {
        uint256 minBalance;
        uint256 discountPercent; // Basis points (100 = 1%)
        bool active;
    }
    
    // Staking information
    struct StakingInfo {
        uint256 amount;
        uint256 lockPeriod;
        uint256 stakedAt;
        uint256 unlockTime;
        bool active;
    }
    
    // State variables
    mapping(address => DiscountTier) public userDiscountTiers;
    mapping(address => StakingInfo[]) public userStakes;
    mapping(address => uint256) public totalStaked;
    
    DiscountTier[] public discountTiers;
    uint256 public totalStakedSupply;
    uint256 public stakingRewardRate; // YIELD tokens per LY per second
    
    // Events
    event TokensStaked(address indexed user, uint256 amount, uint256 lockPeriod, uint256 unlockTime);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 stakeIndex);
    event DiscountTierUpdated(address indexed user, uint256 tier, uint256 discountPercent);
    event StakingRewardRateUpdated(uint256 newRate);
    event TokensBurned(uint256 amount, string reason);
    
    // Modifiers
    modifier onlyWhenNotPaused() {
        require(!paused(), "Token operations paused");
        _;
    }
    
    constructor() ERC20("LINE Yield Token", "LY") ERC20Permit("LINE Yield Token") {
        // Mint initial supply to owner for distribution
        _mint(owner(), INITIAL_SUPPLY);
        
        // Initialize discount tiers
        _initializeDiscountTiers();
        
        // Set initial staking reward rate (0.1 YIELD per LY per day)
        stakingRewardRate = 1157407407407407; // 0.1 * 10^18 / (24 * 60 * 60)
    }
    
    /**
     * @dev Initialize discount tiers
     */
    function _initializeDiscountTiers() internal {
        discountTiers.push(DiscountTier({
            minBalance: 1000 * 10**18,      // 1,000 LY
            discountPercent: 500,            // 5%
            active: true
        }));
        
        discountTiers.push(DiscountTier({
            minBalance: 10000 * 10**18,     // 10,000 LY
            discountPercent: 1500,          // 15%
            active: true
        }));
        
        discountTiers.push(DiscountTier({
            minBalance: 50000 * 10**18,     // 50,000 LY
            discountPercent: 2500,          // 25%
            active: true
        }));
        
        discountTiers.push(DiscountTier({
            minBalance: 100000 * 10**18,    // 100,000 LY
            discountPercent: 3500,          // 35%
            active: true
        }));
        
        discountTiers.push(DiscountTier({
            minBalance: 500000 * 10**18,    // 500,000 LY
            discountPercent: 5000,          // 50%
            active: true
        }));
    }
    
    /**
     * @dev Stake LY tokens for governance power and rewards
     * @param amount Amount of LY tokens to stake
     * @param lockPeriod Lock period in seconds (30, 90, 180, 365 days)
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant onlyWhenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(_isValidLockPeriod(lockPeriod), "Invalid lock period");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Create staking info
        uint256 unlockTime = block.timestamp.add(lockPeriod);
        StakingInfo memory newStake = StakingInfo({
            amount: amount,
            lockPeriod: lockPeriod,
            stakedAt: block.timestamp,
            unlockTime: unlockTime,
            active: true
        });
        
        userStakes[msg.sender].push(newStake);
        totalStaked[msg.sender] = totalStaked[msg.sender].add(amount);
        totalStakedSupply = totalStakedSupply.add(amount);
        
        // Update discount tier
        _updateDiscountTier(msg.sender);
        
        emit TokensStaked(msg.sender, amount, lockPeriod, unlockTime);
    }
    
    /**
     * @dev Unstake LY tokens after lock period
     * @param stakeIndex Index of the stake to unstake
     */
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        StakingInfo storage stakeInfo = userStakes[msg.sender][stakeIndex];
        require(stakeInfo.active, "Stake already unstaked");
        require(block.timestamp >= stakeInfo.unlockTime, "Stake still locked");
        
        uint256 amount = stakeInfo.amount;
        
        // Mark stake as inactive
        stakeInfo.active = false;
        
        // Update totals
        totalStaked[msg.sender] = totalStaked[msg.sender].sub(amount);
        totalStakedSupply = totalStakedSupply.sub(amount);
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        // Update discount tier
        _updateDiscountTier(msg.sender);
        
        emit TokensUnstaked(msg.sender, amount, stakeIndex);
    }
    
    /**
     * @dev Get user's discount percentage based on balance and staking
     * @param user User address
     * @return Discount percentage in basis points
     */
    function getUserDiscountPercent(address user) external view returns (uint256) {
        uint256 balance = balanceOf(user).add(totalStaked[user]);
        
        for (uint256 i = discountTiers.length; i > 0; i--) {
            DiscountTier memory tier = discountTiers[i - 1];
            if (tier.active && balance >= tier.minBalance) {
                return tier.discountPercent;
            }
        }
        
        return 0;
    }
    
    /**
     * @dev Get user's voting power (balance + staked tokens with multiplier)
     * @param user User address
     * @return Voting power
     */
    function getVotingPower(address user) external view returns (uint256) {
        uint256 balance = balanceOf(user);
        uint256 staked = totalStaked[user];
        
        // Staked tokens get 1.5x voting power
        return balance.add(staked.mul(150).div(100));
    }
    
    /**
     * @dev Get user's staking rewards (YIELD tokens earned)
     * @param user User address
     * @return Total rewards earned
     */
    function getStakingRewards(address user) external view returns (uint256) {
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            StakingInfo memory stakeInfo = userStakes[user][i];
            if (stakeInfo.active) {
                uint256 stakingDuration = block.timestamp.sub(stakeInfo.stakedAt);
                uint256 rewards = stakeInfo.amount.mul(stakingDuration).mul(stakingRewardRate);
                totalRewards = totalRewards.add(rewards);
            }
        }
        
        return totalRewards;
    }
    
    /**
     * @dev Update discount tier for user
     * @param user User address
     */
    function _updateDiscountTier(address user) internal {
        uint256 balance = balanceOf(user).add(totalStaked[user]);
        uint256 currentTier = 0;
        
        for (uint256 i = 0; i < discountTiers.length; i++) {
            if (discountTiers[i].active && balance >= discountTiers[i].minBalance) {
                currentTier = i;
            }
        }
        
        userDiscountTiers[user] = DiscountTier({
            minBalance: discountTiers[currentTier].minBalance,
            discountPercent: discountTiers[currentTier].discountPercent,
            active: true
        });
        
        emit DiscountTierUpdated(user, currentTier, discountTiers[currentTier].discountPercent);
    }
    
    /**
     * @dev Check if lock period is valid
     * @param lockPeriod Lock period in seconds
     * @return True if valid
     */
    function _isValidLockPeriod(uint256 lockPeriod) internal pure returns (bool) {
        return lockPeriod == 30 days || 
               lockPeriod == 90 days || 
               lockPeriod == 180 days || 
               lockPeriod == 365 days;
    }
    
    /**
     * @dev Get user's active stakes
     * @param user User address
     * @return Array of active stakes
     */
    function getUserStakes(address user) external view returns (StakingInfo[] memory) {
        return userStakes[user];
    }
    
    /**
     * @dev Get discount tiers
     * @return Array of discount tiers
     */
    function getDiscountTiers() external view returns (DiscountTier[] memory) {
        return discountTiers;
    }
    
    /**
     * @dev Mint new tokens (only owner, up to max supply)
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply().add(amount) <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from treasury
     * @param amount Amount to burn
     * @param reason Reason for burning
     */
    function burnFromTreasury(uint256 amount, string memory reason) external onlyOwner {
        require(balanceOf(address(this)) >= amount, "Insufficient treasury balance");
        _burn(address(this), amount);
        emit TokensBurned(amount, reason);
    }
    
    /**
     * @dev Set staking reward rate
     * @param newRate New reward rate (YIELD per LY per second)
     */
    function setStakingRewardRate(uint256 newRate) external onlyOwner {
        stakingRewardRate = newRate;
        emit StakingRewardRateUpdated(newRate);
    }
    
    /**
     * @dev Pause token operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Required overrides for multiple inheritance
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
        
        // Update discount tiers for both users
        if (from != address(0)) {
            _updateDiscountTier(from);
        }
        if (to != address(0)) {
            _updateDiscountTier(to);
        }
    }
    
    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }
    
    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}

