// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title YieldToken
 * @dev LINE Yield ecosystem token deployed on Kaia blockchain
 * Features:
 * - ERC-20 compliant with burn, pause, and cap functionality
 * - Role-based access control for different ecosystem functions
 * - Anti-whale mechanisms and transfer restrictions
 * - Built-in staking rewards and governance capabilities
 */
contract YieldToken is ERC20, ERC20Burnable, ERC20Pausable, ERC20Capped, AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant STAKING_ROLE = keccak256("STAKING_ROLE");
    
    // Tokenomics parameters
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million initial supply
    
    // Anti-whale mechanisms
    uint256 public maxTransferAmount = 10_000_000 * 10**18; // 10M tokens max per transfer
    uint256 public maxWalletAmount = 50_000_000 * 10**18; // 50M tokens max per wallet
    
    // Transfer restrictions
    mapping(address => bool) public isExcludedFromLimits;
    mapping(address => bool) public isBlacklisted;
    
    // Staking and rewards
    uint256 public totalStaked;
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lastStakeTime;
    
    // Governance
    uint256 public totalVotingPower;
    mapping(address => uint256) public votingPower;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event TransferLimitsUpdated(uint256 maxTransfer, uint256 maxWallet);
    event BlacklistUpdated(address indexed account, bool isBlacklisted);
    event ExcludedFromLimitsUpdated(address indexed account, bool isExcluded);
    
    constructor() ERC20("LINE Yield Token", "YIELD") ERC20Capped(MAX_SUPPLY) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        _grantRole(STAKING_ROLE, msg.sender);
        
        // Exclude contract and owner from limits
        isExcludedFromLimits[address(this)] = true;
        isExcludedFromLimits[msg.sender] = true;
        
        // Mint initial supply
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only minters)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "YieldToken: Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Pause token transfers (only pausers)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers (only pausers)
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Stake tokens for rewards
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "YieldToken: Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "YieldToken: Insufficient balance");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update staking data
        stakedBalance[msg.sender] += amount;
        totalStaked += amount;
        lastStakeTime[msg.sender] = block.timestamp;
        
        // Update voting power (1 token = 1 vote)
        votingPower[msg.sender] += amount;
        totalVotingPower += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "YieldToken: Amount must be greater than 0");
        require(stakedBalance[msg.sender] >= amount, "YieldToken: Insufficient staked balance");
        require(block.timestamp >= lastStakeTime[msg.sender] + 7 days, "YieldToken: Minimum stake period not met");
        
        // Update staking data
        stakedBalance[msg.sender] -= amount;
        totalStaked -= amount;
        
        // Update voting power
        votingPower[msg.sender] -= amount;
        totalVotingPower -= amount;
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "YieldToken: No rewards to claim");
        
        // Mint reward tokens
        _mint(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Calculate staking rewards for a user
     */
    function calculateRewards(address user) public view returns (uint256) {
        if (stakedBalance[user] == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - lastStakeTime[user];
        uint256 annualRewardRate = 10; // 10% APY
        uint256 rewards = (stakedBalance[user] * stakingDuration * annualRewardRate) / (365 days * 100);
        
        return rewards;
    }
    
    /**
     * @dev Update transfer limits (only admin)
     */
    function updateTransferLimits(uint256 _maxTransferAmount, uint256 _maxWalletAmount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_maxTransferAmount > 0, "YieldToken: Max transfer amount must be greater than 0");
        require(_maxWalletAmount > 0, "YieldToken: Max wallet amount must be greater than 0");
        
        maxTransferAmount = _maxTransferAmount;
        maxWalletAmount = _maxWalletAmount;
        
        emit TransferLimitsUpdated(_maxTransferAmount, _maxWalletAmount);
    }
    
    /**
     * @dev Update blacklist status (only admin)
     */
    function updateBlacklist(address account, bool _isBlacklisted) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isBlacklisted[account] = _isBlacklisted;
        emit BlacklistUpdated(account, _isBlacklisted);
    }
    
    /**
     * @dev Update exclusion from limits (only admin)
     */
    function updateExcludedFromLimits(address account, bool _isExcluded) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isExcludedFromLimits[account] = _isExcluded;
        emit ExcludedFromLimitsUpdated(account, _isExcluded);
    }
    
    /**
     * @dev Override transfer to include anti-whale and blacklist checks
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
        
        // Check blacklist
        require(!isBlacklisted[from], "YieldToken: Sender is blacklisted");
        require(!isBlacklisted[to], "YieldToken: Recipient is blacklisted");
        
        // Check transfer limits (exclude minting, burning, and excluded addresses)
        if (from != address(0) && to != address(0) && !isExcludedFromLimits[from] && !isExcludedFromLimits[to]) {
            require(amount <= maxTransferAmount, "YieldToken: Transfer amount exceeds limit");
            require(balanceOf(to) + amount <= maxWalletAmount, "YieldToken: Wallet balance would exceed limit");
        }
    }
    
    /**
     * @dev Override _mint to respect cap
     */
    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Capped) {
        super._mint(to, amount);
    }
    
    /**
     * @dev Get tokenomics information
     */
    function getTokenomicsInfo() external view returns (
        uint256 _totalSupply,
        uint256 _maxSupply,
        uint256 _totalStaked,
        uint256 _totalVotingPower,
        uint256 _circulatingSupply
    ) {
        _totalSupply = totalSupply();
        _maxSupply = MAX_SUPPLY;
        _totalStaked = totalStaked;
        _totalVotingPower = totalVotingPower;
        _circulatingSupply = _totalSupply - totalStaked;
    }
    
    /**
     * @dev Get user staking information
     */
    function getUserStakingInfo(address user) external view returns (
        uint256 _stakedBalance,
        uint256 _votingPower,
        uint256 _pendingRewards,
        uint256 _lastStakeTime
    ) {
        _stakedBalance = stakedBalance[user];
        _votingPower = votingPower[user];
        _pendingRewards = calculateRewards(user);
        _lastStakeTime = lastStakeTime[user];
    }
}

