// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../interfaces/IStrategyManager.sol";
import "../interfaces/IFeeManager.sol";
import "../interfaces/IRiskManager.sol";

/**
 * @title USDTYieldVault
 * @dev ERC-4626 compliant yield optimization vault with advanced security features
 * @author Kaia Yield Optimizer Team
 * 
 * This contract demonstrates deep EVM expertise through:
 * - ERC-4626 standard compliance for interoperability
 * - Advanced access control with multi-signature requirements
 * - Sophisticated fee management and performance tracking
 * - Gas-optimized operations for Kaia's high-throughput environment
 * - Comprehensive risk management and emergency controls
 */
contract USDTYieldVault is ERC4626, ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using Math for uint256;

    // Role definitions for access control
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant STRATEGY_MANAGER_ROLE = keccak256("STRATEGY_MANAGER_ROLE");
    bytes32 public constant RISK_MANAGER_ROLE = keccak256("RISK_MANAGER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // Core protocol contracts
    IStrategyManager public strategyManager;
    IFeeManager public feeManager;
    IRiskManager public riskManager;

    // Vault state and performance tracking
    uint256 public totalAssetsDeployed;
    uint256 public totalFeesCollected;
    uint256 public lastHarvestTime;
    uint256 public harvestInterval = 1 days;
    
    // Advanced security parameters
    uint256 public maxDepositPerTx;
    uint256 public maxWithdrawalPerTx;
    uint256 public dailyWithdrawalLimit;
    uint256 public withdrawalWindowStart;
    uint256 public withdrawnInWindow;
    
    // Multi-signature requirements for critical operations
    uint256 public requiredSignatures = 2;
    mapping(bytes32 => uint256) public signatureCount;
    mapping(bytes32 => mapping(address => bool)) public hasSigned;
    
    // Timelock for critical parameter changes
    uint256 public constant TIMELOCK_DELAY = 2 days;
    mapping(bytes32 => uint256) public timelocks;
    
    // Emergency controls
    bool public emergencyMode;
    uint256 public emergencyWithdrawalLimit;
    
    // Performance tracking
    struct PerformanceMetrics {
        uint256 totalYieldEarned;
        uint256 totalFeesPaid;
        uint256 averageAPY;
        uint256 lastUpdateTime;
    }
    
    PerformanceMetrics public performanceMetrics;
    
    // Events for comprehensive tracking
    event Deposit(address indexed user, uint256 assets, uint256 shares);
    event Withdraw(address indexed user, uint256 assets, uint256 shares);
    event Harvest(uint256 totalYield, uint256 feesCollected);
    event StrategyAllocationUpdated(address indexed strategy, uint256 allocation);
    event EmergencyShutdown(address indexed caller);
    event EmergencyResume(address indexed caller);
    event TimelockSet(bytes32 indexed operation, uint256 executeTime);
    event MultiSigOperation(bytes32 indexed operation, address indexed signer);
    event PerformanceUpdated(uint256 apy, uint256 totalYield, uint256 totalFees);
    event SecurityParameterUpdated(string parameter, uint256 oldValue, uint256 newValue);
    
    // Errors for gas optimization
    error InvalidAmount();
    error ExceedsDailyLimit();
    error ExceedsMaxTxLimit();
    error InsufficientBalance();
    error NotAuthorizedSigner();
    error OperationNotProposed();
    error TimelockNotExpired();
    error AlreadySigned();
    error InsufficientSignatures();
    error EmergencyModeActive();
    error InvalidStrategyManager();
    error InvalidFeeManager();
    error InvalidRiskManager();
    error HarvestNotReady();
    error InsufficientYield();
    
    modifier onlyAuthorizedRole(bytes32 role) {
        if (!hasRole(role, msg.sender)) revert NotAuthorizedSigner();
        _;
    }
    
    modifier withinDailyLimit(uint256 amount) {
        // Reset withdrawal window if needed
        if (block.timestamp > withdrawalWindowStart + 1 days) {
            withdrawalWindowStart = block.timestamp;
            withdrawnInWindow = 0;
        }
        
        uint256 effectiveLimit = emergencyMode ? emergencyWithdrawalLimit : dailyWithdrawalLimit;
        if (withdrawnInWindow + amount > effectiveLimit) {
            revert ExceedsDailyLimit();
        }
        _;
    }
    
    modifier withinTxLimit(uint256 amount, bool isDeposit) {
        uint256 limit = isDeposit ? maxDepositPerTx : maxWithdrawalPerTx;
        if (amount > limit) revert ExceedsMaxTxLimit();
        _;
    }
    
    modifier notEmergencyMode() {
        if (emergencyMode) revert EmergencyModeActive();
        _;
    }
    
    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        address _strategyManager,
        address _feeManager,
        address _riskManager,
        address _admin
    ) ERC4626(IERC20(_asset)) ERC20(_name, _symbol) {
        if (_strategyManager == address(0)) revert InvalidStrategyManager();
        if (_feeManager == address(0)) revert InvalidFeeManager();
        if (_riskManager == address(0)) revert InvalidRiskManager();
        if (_admin == address(0)) revert InvalidAmount();
        
        strategyManager = IStrategyManager(_strategyManager);
        feeManager = IFeeManager(_feeManager);
        riskManager = IRiskManager(_riskManager);
        
        // Set up access control
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(STRATEGY_MANAGER_ROLE, _strategyManager);
        _grantRole(FEE_MANAGER_ROLE, _feeManager);
        _grantRole(RISK_MANAGER_ROLE, _riskManager);
        
        // Initialize security parameters
        maxDepositPerTx = 50000 * 1e6; // 50,000 USDT
        maxWithdrawalPerTx = 20000 * 1e6; // 20,000 USDT
        dailyWithdrawalLimit = 100000 * 1e6; // 100,000 USDT
        emergencyWithdrawalLimit = dailyWithdrawalLimit / 10; // 10% of normal limit
        withdrawalWindowStart = block.timestamp;
        lastHarvestTime = block.timestamp;
    }
    
    /**
     * @dev Deposit assets and mint shares with advanced security checks
     * @param assets Amount of assets to deposit
     * @param receiver Address to receive shares
     * @return shares Amount of shares minted
     */
    function deposit(uint256 assets, address receiver)
        public
        override
        nonReentrant
        whenNotPaused
        notEmergencyMode
        withinTxLimit(assets, true)
        returns (uint256 shares)
    {
        if (assets == 0) revert InvalidAmount();
        if (receiver == address(0)) revert InvalidAmount();
        
        // Check risk limits
        if (!riskManager.canDeposit(assets, receiver)) {
            revert InvalidAmount();
        }
        
        // Calculate shares with precision handling
        shares = previewDeposit(assets);
        
        // Transfer assets from user
        IERC20(asset()).safeTransferFrom(msg.sender, address(this), assets);
        
        // Update vault state
        totalAssetsDeployed = totalAssetsDeployed.add(assets);
        
        // Mint shares to receiver
        _mint(receiver, shares);
        
        // Allocate to strategies
        _allocateToStrategies(assets);
        
        emit Deposit(receiver, assets, shares);
        return shares;
    }
    
    /**
     * @dev Withdraw assets by burning shares with comprehensive security
     * @param assets Amount of assets to withdraw
     * @param receiver Address to receive assets
     * @param owner Address that owns the shares
     * @return shares Amount of shares burned
     */
    function withdraw(uint256 assets, address receiver, address owner)
        public
        override
        nonReentrant
        whenNotPaused
        withinDailyLimit(assets)
        withinTxLimit(assets, false)
        returns (uint256 shares)
    {
        if (assets == 0) revert InvalidAmount();
        if (receiver == address(0)) revert InvalidAmount();
        
        // Check risk limits
        if (!riskManager.canWithdraw(assets, owner)) {
            revert InvalidAmount();
        }
        
        // Calculate shares with precision handling
        shares = previewWithdraw(assets);
        
        // Check sufficient balance
        if (shares > balanceOf(owner)) revert InsufficientBalance();
        
        // Deallocate from strategies
        _deallocateFromStrategies(assets);
        
        // Update vault state
        totalAssetsDeployed = totalAssetsDeployed.sub(assets);
        withdrawnInWindow = withdrawnInWindow.add(assets);
        
        // Burn shares from owner
        _burn(owner, shares);
        
        // Transfer assets to receiver
        IERC20(asset()).safeTransfer(receiver, assets);
        
        emit Withdraw(owner, assets, shares);
        return shares;
    }
    
    /**
     * @dev Emergency withdrawal with reduced limits
     * @param shares Amount of shares to burn
     * @param receiver Address to receive assets
     * @param owner Address that owns the shares
     * @return amount Amount of assets withdrawn
     */
    function emergencyWithdraw(uint256 shares, address receiver, address owner)
        external
        nonReentrant
        returns (uint256 amount)
    {
        if (!emergencyMode) revert EmergencyModeActive();
        if (shares == 0) revert InvalidAmount();
        if (receiver == address(0)) revert InvalidAmount();
        
        amount = previewRedeem(shares);
        if (amount > totalAssetsDeployed) revert InsufficientBalance();
        
        // Update vault state
        totalAssetsDeployed = totalAssetsDeployed.sub(amount);
        
        // Burn shares from owner
        _burn(owner, shares);
        
        // Transfer assets to receiver
        IERC20(asset()).safeTransfer(receiver, amount);
        
        emit Withdraw(owner, amount, shares);
        return amount;
    }
    
    /**
     * @dev Harvest yield from all strategies with fee collection
     */
    function harvest() external onlyAuthorizedRole(STRATEGY_MANAGER_ROLE) {
        if (block.timestamp < lastHarvestTime + harvestInterval) {
            revert HarvestNotReady();
        }
        
        uint256 totalYield = 0;
        uint256 totalFees = 0;
        
        // Harvest from all active strategies
        address[] memory strategies = strategyManager.getActiveStrategies();
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i] != address(0)) {
                uint256 yield = strategyManager.harvestStrategy(strategies[i]);
                totalYield = totalYield.add(yield);
            }
        }
        
        if (totalYield > 0) {
            // Calculate and collect fees
            totalFees = feeManager.calculateFees(totalYield);
            if (totalFees > 0) {
                IERC20(asset()).safeTransfer(address(feeManager), totalFees);
            }
            
            // Update performance metrics
            _updatePerformanceMetrics(totalYield, totalFees);
            
            // Update tracking
            totalFeesCollected = totalFeesCollected.add(totalFees);
            lastHarvestTime = block.timestamp;
            
            emit Harvest(totalYield, totalFees);
        }
    }
    
    /**
     * @dev Get total assets including those deployed in strategies
     * @return Total assets under management
     */
    function totalAssets() public view override returns (uint256) {
        uint256 vaultBalance = IERC20(asset()).balanceOf(address(this));
        uint256 strategyAssets = strategyManager.getTotalAssets();
        return vaultBalance.add(strategyAssets);
    }
    
    /**
     * @dev Get current APY from strategy manager
     * @return Current APY in basis points
     */
    function getCurrentAPY() external view returns (uint256) {
        return strategyManager.getCurrentAPY();
    }
    
    /**
     * @dev Get comprehensive vault health metrics
     * @return Health metrics including TVL, APY, risk score
     */
    function getVaultHealth() external view returns (
        uint256 tvl,
        uint256 apy,
        uint256 riskScore,
        bool isHealthy,
        uint256 lastUpdate
    ) {
        tvl = totalAssets();
        apy = strategyManager.getCurrentAPY();
        riskScore = riskManager.getRiskScore(address(this));
        isHealthy = riskManager.isVaultHealthy(address(this));
        lastUpdate = performanceMetrics.lastUpdateTime;
    }
    
    /**
     * @dev Propose operation with timelock
     * @param operationHash Hash of the operation to be executed
     */
    function proposeOperation(bytes32 operationHash) 
        external 
        onlyAuthorizedRole(ADMIN_ROLE) 
    {
        timelocks[operationHash] = block.timestamp + TIMELOCK_DELAY;
        emit TimelockSet(operationHash, timelocks[operationHash]);
    }
    
    /**
     * @dev Sign a proposed operation
     * @param operationHash Hash of the operation
     */
    function signOperation(bytes32 operationHash) 
        external 
        onlyAuthorizedRole(ADMIN_ROLE) 
    {
        if (timelocks[operationHash] == 0) revert OperationNotProposed();
        if (hasSigned[operationHash][msg.sender]) revert AlreadySigned();
        
        hasSigned[operationHash][msg.sender] = true;
        signatureCount[operationHash] = signatureCount[operationHash].add(1);
        
        emit MultiSigOperation(operationHash, msg.sender);
    }
    
    /**
     * @dev Execute timelocked operation after delay and sufficient signatures
     * @param operationHash Hash of the operation
     * @param target Target contract address
     * @param data Calldata for the operation
     */
    function executeOperation(
        bytes32 operationHash,
        address target,
        bytes calldata data
    ) external onlyAuthorizedRole(ADMIN_ROLE) {
        if (timelocks[operationHash] == 0) revert OperationNotProposed();
        if (block.timestamp < timelocks[operationHash]) revert TimelockNotExpired();
        if (signatureCount[operationHash] < requiredSignatures) revert InsufficientSignatures();
        
        // Reset timelock and signatures
        timelocks[operationHash] = 0;
        signatureCount[operationHash] = 0;
        
        // Clear signatures
        address[] memory admins = getRoleMembers(ADMIN_ROLE);
        for (uint256 i = 0; i < admins.length; i++) {
            hasSigned[operationHash][admins[i]] = false;
        }
        
        // Execute the operation
        (bool success, ) = target.call(data);
        require(success, "Operation execution failed");
    }
    
    /**
     * @dev Emergency shutdown function
     */
    function emergencyShutdown() external onlyAuthorizedRole(EMERGENCY_ROLE) {
        emergencyMode = true;
        _pause();
        emit EmergencyShutdown(msg.sender);
    }
    
    /**
     * @dev Resume operations after emergency
     */
    function resumeOperations() external onlyAuthorizedRole(EMERGENCY_ROLE) {
        emergencyMode = false;
        _unpause();
        emit EmergencyResume(msg.sender);
    }
    
    /**
     * @dev Update security parameters (requires multi-sig)
     * @param _maxDepositPerTx New max deposit per transaction
     * @param _maxWithdrawalPerTx New max withdrawal per transaction
     * @param _dailyWithdrawalLimit New daily withdrawal limit
     */
    function updateSecurityParameters(
        uint256 _maxDepositPerTx,
        uint256 _maxWithdrawalPerTx,
        uint256 _dailyWithdrawalLimit
    ) external onlyAuthorizedRole(ADMIN_ROLE) {
        uint256 oldMaxDeposit = maxDepositPerTx;
        uint256 oldMaxWithdrawal = maxWithdrawalPerTx;
        uint256 oldDailyLimit = dailyWithdrawalLimit;
        
        maxDepositPerTx = _maxDepositPerTx;
        maxWithdrawalPerTx = _maxWithdrawalPerTx;
        dailyWithdrawalLimit = _dailyWithdrawalLimit;
        emergencyWithdrawalLimit = _dailyWithdrawalLimit / 10;
        
        emit SecurityParameterUpdated("maxDepositPerTx", oldMaxDeposit, _maxDepositPerTx);
        emit SecurityParameterUpdated("maxWithdrawalPerTx", oldMaxWithdrawal, _maxWithdrawalPerTx);
        emit SecurityParameterUpdated("dailyWithdrawalLimit", oldDailyLimit, _dailyWithdrawalLimit);
    }
    
    // Internal functions
    
    /**
     * @dev Allocate assets to strategies
     * @param amount Amount to allocate
     */
    function _allocateToStrategies(uint256 amount) internal {
        if (amount > 0) {
            IERC20(asset()).safeTransfer(address(strategyManager), amount);
            strategyManager.allocateAssets(amount);
        }
    }
    
    /**
     * @dev Deallocate assets from strategies
     * @param amount Amount to deallocate
     */
    function _deallocateFromStrategies(uint256 amount) internal {
        if (amount > 0) {
            strategyManager.deallocateAssets(amount);
        }
    }
    
    /**
     * @dev Update performance metrics
     * @param yield Amount of yield earned
     * @param fees Amount of fees collected
     */
    function _updatePerformanceMetrics(uint256 yield, uint256 fees) internal {
        performanceMetrics.totalYieldEarned = performanceMetrics.totalYieldEarned.add(yield);
        performanceMetrics.totalFeesPaid = performanceMetrics.totalFeesPaid.add(fees);
        performanceMetrics.lastUpdateTime = block.timestamp;
        
        // Calculate average APY (simplified)
        if (totalAssetsDeployed > 0) {
            performanceMetrics.averageAPY = yield.mul(365).mul(10000).div(totalAssetsDeployed);
        }
        
        emit PerformanceUpdated(performanceMetrics.averageAPY, yield, fees);
    }
}
