// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title YieldToken
 * @dev Reward token for LINE Yield platform activities
 * @author LINE Yield Team
 */
contract YieldToken is ERC20, ERC20Burnable, Ownable, Pausable, ReentrancyGuard {
    using SafeMath for uint256;

    // Token configuration
    uint256 public constant MAX_DAILY_MINT = 1_000_000 * 10**18; // 1 million YIELD per day max
    
    // Minting configuration
    struct MintingConfig {
        uint256 yieldFarmingRate;    // YIELD per USDT per day
        uint256 referralRate;        // YIELD per referral
        uint256 liquidityRate;       // YIELD per LP token per day
        uint256 stakingRate;         // YIELD per LY staked per day
        bool active;
    }
    
    // Daily minting tracking
    struct DailyMint {
        uint256 date;
        uint256 amount;
        uint256 yieldFarming;
        uint256 referrals;
        uint256 liquidity;
        uint256 staking;
        uint256 community;
    }
    
    // State variables
    MintingConfig public mintingConfig;
    mapping(uint256 => DailyMint) public dailyMints;
    mapping(address => bool) public authorizedMinters;
    
    uint256 public totalMinted;
    uint256 public totalBurned;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event MintingConfigUpdated(uint256 yieldFarmingRate, uint256 referralRate, uint256 liquidityRate, uint256 stakingRate);
    
    // Modifiers
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized minter");
        _;
    }
    
    modifier onlyWhenNotPaused() {
        require(!paused(), "Token operations paused");
        _;
    }
    
    constructor() ERC20("Yield Reward Token", "YIELD") {
        // Initialize minting configuration
        mintingConfig = MintingConfig({
            yieldFarmingRate: 1000000000000000000, // 1 YIELD per USDT per day
            referralRate: 100000000000000000000,    // 100 YIELD per referral
            liquidityRate: 500000000000000000,     // 0.5 YIELD per LP token per day
            stakingRate: 100000000000000000,       // 0.1 YIELD per LY staked per day
            active: true
        });
    }
    
    /**
     * @dev Mint YIELD tokens for yield farming rewards
     */
    function mintYieldFarmingReward(address to, uint256 usdtAmount, uint256 duration) external onlyAuthorizedMinter onlyWhenNotPaused {
        require(mintingConfig.active, "Minting not active");
        
        uint256 rewardAmount = usdtAmount.mul(duration).mul(mintingConfig.yieldFarmingRate).div(1e18);
        _mintWithLimit(to, rewardAmount, "yield_farming");
    }
    
    /**
     * @dev Mint YIELD tokens for referral rewards
     */
    function mintReferralReward(address to, uint256 referralCount) external onlyAuthorizedMinter onlyWhenNotPaused {
        require(mintingConfig.active, "Minting not active");
        
        uint256 rewardAmount = referralCount.mul(mintingConfig.referralRate);
        _mintWithLimit(to, rewardAmount, "referral");
    }
    
    /**
     * @dev Internal function to mint with daily limit check
     */
    function _mintWithLimit(address to, uint256 amount, string memory reason) internal {
        uint256 today = block.timestamp / 1 days;
        
        // Check daily mint limit
        require(dailyMints[today].amount.add(amount) <= MAX_DAILY_MINT, "Daily mint limit exceeded");
        
        _mint(to, amount);
        totalMinted = totalMinted.add(amount);
        
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev Burn YIELD tokens
     */
    function burnTokens(uint256 amount, string memory reason) external onlyWhenNotPaused {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        totalBurned = totalBurned.add(amount);
        
        emit TokensBurned(msg.sender, amount, reason);
    }
    
    /**
     * @dev Update minting configuration
     */
    function updateMintingConfig(uint256 yieldFarmingRate, uint256 referralRate, uint256 liquidityRate, uint256 stakingRate) external onlyOwner {
        mintingConfig = MintingConfig({
            yieldFarmingRate: yieldFarmingRate,
            referralRate: referralRate,
            liquidityRate: liquidityRate,
            stakingRate: stakingRate,
            active: mintingConfig.active
        });
        
        emit MintingConfigUpdated(yieldFarmingRate, referralRate, liquidityRate, stakingRate);
    }
    
    /**
     * @dev Add or remove authorized minter
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
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
}