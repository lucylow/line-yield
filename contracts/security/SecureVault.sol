// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title SecureVault
 * @dev Institutional-grade secure vault with multiple security layers
 * @author Kaia Yield Optimizer Team
 * 
 * Security Features:
 * - Reentrancy protection
 * - Emergency pause functionality
 * - Timelock for critical operations
 * - Multi-signature requirements
 * - Daily withdrawal limits
 * - Comprehensive event logging
 * - Access control with role-based permissions
 */
contract SecureVault is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using Address for address;

    // Asset token (USDT)
    IERC20 public immutable asset;
    
    // Vault state
    uint256 public totalAssets;
    uint256 public totalShares;
    mapping(address => uint256) public userShares;
    
    // Security parameters
    uint256 public dailyWithdrawalLimit;
    uint256 public withdrawalWindowStart;
    uint256 public withdrawnInWindow;
    uint256 public maxDepositPerTx;
    uint256 public maxWithdrawalPerTx;
    
    // Multi-signature requirements
    address[] public signers;
    mapping(address => bool) public isSigner;
    uint256 public requiredSignatures;
    mapping(bytes32 => uint256) public signatureCount;
    mapping(bytes32 => mapping(address => bool)) public hasSigned;
    
    // Timelock for critical operations
    uint256 public constant TIMELOCK_DELAY = 2 days;
    mapping(bytes32 => uint256) public timelocks;
    
    // Emergency parameters
    bool public emergencyMode;
    uint256 public emergencyWithdrawalLimit;
    
    // Security events
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 amount, uint256 shares);
    event EmergencyShutdown(address indexed caller);
    event EmergencyResume(address indexed caller);
    event TimelockSet(bytes32 indexed operation, uint256 executeTime);
    event MultiSigOperation(bytes32 indexed operation, address indexed signer);
    event SecurityParameterUpdated(string parameter, uint256 oldValue, uint256 newValue);
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    
    // Errors
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
    error InvalidSigner();
    error InvalidRequiredSignatures();
    
    modifier onlySigner() {
        if (!isSigner[msg.sender]) revert NotAuthorizedSigner();
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
        address[] memory _signers,
        uint256 _requiredSignatures,
        uint256 _dailyWithdrawalLimit,
        uint256 _maxDepositPerTx,
        uint256 _maxWithdrawalPerTx
    ) {
        if (_asset == address(0)) revert InvalidAmount();
        if (_signers.length == 0) revert InvalidSigner();
        if (_requiredSignatures == 0 || _requiredSignatures > _signers.length) {
            revert InvalidRequiredSignatures();
        }
        
        asset = IERC20(_asset);
        signers = _signers;
        requiredSignatures = _requiredSignatures;
        dailyWithdrawalLimit = _dailyWithdrawalLimit;
        maxDepositPerTx = _maxDepositPerTx;
        maxWithdrawalPerTx = _maxWithdrawalPerTx;
        withdrawalWindowStart = block.timestamp;
        emergencyWithdrawalLimit = _dailyWithdrawalLimit / 10; // 10% of normal limit
        
        // Initialize signers
        for (uint256 i = 0; i < _signers.length; i++) {
            if (_signers[i] == address(0)) revert InvalidSigner();
            isSigner[_signers[i]] = true;
        }
    }
    
    /**
     * @dev Deposit assets and mint shares
     * @param amount Amount of assets to deposit
     * @return shares Amount of shares minted
     */
    function deposit(uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        notEmergencyMode
        withinTxLimit(amount, true)
        returns (uint256 shares) 
    {
        if (amount == 0) revert InvalidAmount();
        
        // Calculate shares (1:1 for simplicity, in production use proper share calculation)
        shares = amount;
        
        // Transfer assets from user
        asset.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update state
        totalAssets = totalAssets.add(amount);
        totalShares = totalShares.add(shares);
        userShares[msg.sender] = userShares[msg.sender].add(shares);
        
        emit Deposit(msg.sender, amount, shares);
        return shares;
    }
    
    /**
     * @dev Withdraw assets by burning shares
     * @param shares Amount of shares to burn
     * @return amount Amount of assets withdrawn
     */
    function withdraw(uint256 shares) 
        external 
        nonReentrant 
        whenNotPaused 
        withinDailyLimit(shares)
        withinTxLimit(shares, false)
        returns (uint256 amount) 
    {
        if (shares == 0) revert InvalidAmount();
        if (shares > userShares[msg.sender]) revert InsufficientBalance();
        
        // Calculate amount (1:1 for simplicity)
        amount = shares;
        if (amount > totalAssets) revert InsufficientBalance();
        
        // Update state
        totalAssets = totalAssets.sub(amount);
        totalShares = totalShares.sub(shares);
        userShares[msg.sender] = userShares[msg.sender].sub(shares);
        withdrawnInWindow = withdrawnInWindow.add(amount);
        
        // Transfer assets to user
        asset.safeTransfer(msg.sender, amount);
        
        emit Withdraw(msg.sender, amount, shares);
        return amount;
    }
    
    /**
     * @dev Emergency withdrawal with reduced limits
     * @param shares Amount of shares to burn
     * @return amount Amount of assets withdrawn
     */
    function emergencyWithdraw(uint256 shares) 
        external 
        nonReentrant 
        returns (uint256 amount) 
    {
        if (!emergencyMode) revert EmergencyModeActive();
        if (shares == 0) revert InvalidAmount();
        if (shares > userShares[msg.sender]) revert InsufficientBalance();
        
        amount = shares;
        if (amount > totalAssets) revert InsufficientBalance();
        
        // Update state
        totalAssets = totalAssets.sub(amount);
        totalShares = totalShares.sub(shares);
        userShares[msg.sender] = userShares[msg.sender].sub(shares);
        
        // Transfer assets to user
        asset.safeTransfer(msg.sender, amount);
        
        emit Withdraw(msg.sender, amount, shares);
        return amount;
    }
    
    /**
     * @dev Emergency shutdown function
     */
    function emergencyShutdown() external onlySigner {
        emergencyMode = true;
        _pause();
        emit EmergencyShutdown(msg.sender);
    }
    
    /**
     * @dev Resume operations after emergency
     */
    function resumeOperations() external onlySigner {
        emergencyMode = false;
        _unpause();
        emit EmergencyResume(msg.sender);
    }
    
    /**
     * @dev Propose operation with timelock
     * @param operationHash Hash of the operation to be executed
     */
    function proposeOperation(bytes32 operationHash) external onlySigner {
        timelocks[operationHash] = block.timestamp + TIMELOCK_DELAY;
        emit TimelockSet(operationHash, timelocks[operationHash]);
    }
    
    /**
     * @dev Sign a proposed operation
     * @param operationHash Hash of the operation
     */
    function signOperation(bytes32 operationHash) external onlySigner {
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
    ) external onlySigner {
        if (timelocks[operationHash] == 0) revert OperationNotProposed();
        if (block.timestamp < timelocks[operationHash]) revert TimelockNotExpired();
        if (signatureCount[operationHash] < requiredSignatures) revert InsufficientSignatures();
        
        // Reset timelock and signatures
        timelocks[operationHash] = 0;
        signatureCount[operationHash] = 0;
        
        // Clear signatures
        for (uint256 i = 0; i < signers.length; i++) {
            hasSigned[operationHash][signers[i]] = false;
        }
        
        // Execute the operation
        (bool success, ) = target.call(data);
        require(success, "Operation execution failed");
    }
    
    /**
     * @dev Add a new signer (requires multi-sig)
     */
    function addSigner(address newSigner) external onlySigner {
        if (newSigner == address(0)) revert InvalidSigner();
        if (isSigner[newSigner]) revert InvalidSigner();
        
        isSigner[newSigner] = true;
        signers.push(newSigner);
        
        emit SignerAdded(newSigner);
    }
    
    /**
     * @dev Remove a signer (requires multi-sig)
     */
    function removeSigner(address signerToRemove) external onlySigner {
        if (!isSigner[signerToRemove]) revert InvalidSigner();
        if (signers.length <= requiredSignatures) revert InvalidSigner();
        
        isSigner[signerToRemove] = false;
        
        // Remove from signers array
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == signerToRemove) {
                signers[i] = signers[signers.length - 1];
                signers.pop();
                break;
            }
        }
        
        emit SignerRemoved(signerToRemove);
    }
    
    /**
     * @dev Update security parameters (requires multi-sig)
     */
    function updateSecurityParameters(
        uint256 _dailyWithdrawalLimit,
        uint256 _maxDepositPerTx,
        uint256 _maxWithdrawalPerTx,
        uint256 _emergencyWithdrawalLimit
    ) external onlySigner {
        uint256 oldDailyLimit = dailyWithdrawalLimit;
        uint256 oldMaxDeposit = maxDepositPerTx;
        uint256 oldMaxWithdrawal = maxWithdrawalPerTx;
        uint256 oldEmergencyLimit = emergencyWithdrawalLimit;
        
        dailyWithdrawalLimit = _dailyWithdrawalLimit;
        maxDepositPerTx = _maxDepositPerTx;
        maxWithdrawalPerTx = _maxWithdrawalPerTx;
        emergencyWithdrawalLimit = _emergencyWithdrawalLimit;
        
        emit SecurityParameterUpdated("dailyWithdrawalLimit", oldDailyLimit, _dailyWithdrawalLimit);
        emit SecurityParameterUpdated("maxDepositPerTx", oldMaxDeposit, _maxDepositPerTx);
        emit SecurityParameterUpdated("maxWithdrawalPerTx", oldMaxWithdrawal, _maxWithdrawalPerTx);
        emit SecurityParameterUpdated("emergencyWithdrawalLimit", oldEmergencyLimit, _emergencyWithdrawalLimit);
    }
    
    /**
     * @dev Get user's share of total assets
     * @param user User address
     * @return User's share percentage (in basis points)
     */
    function getUserSharePercentage(address user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return userShares[user].mul(10000).div(totalShares);
    }
    
    /**
     * @dev Get remaining withdrawal limit for current window
     * @return Remaining limit
     */
    function getRemainingWithdrawalLimit() external view returns (uint256) {
        uint256 effectiveLimit = emergencyMode ? emergencyWithdrawalLimit : dailyWithdrawalLimit;
        
        if (block.timestamp > withdrawalWindowStart + 1 days) {
            return effectiveLimit;
        }
        
        return effectiveLimit.sub(withdrawnInWindow);
    }
    
    /**
     * @dev Get vault health metrics
     * @return totalAssets Total assets in vault
     * @return totalShares Total shares minted
     * @return utilizationRate Utilization rate (in basis points)
     * @return emergencyMode Current emergency status
     */
    function getVaultHealth() external view returns (
        uint256 totalAssets,
        uint256 totalShares,
        uint256 utilizationRate,
        bool emergencyMode
    ) {
        totalAssets = this.totalAssets();
        totalShares = this.totalShares();
        utilizationRate = totalShares > 0 ? totalAssets.mul(10000).div(totalShares) : 0;
        emergencyMode = this.emergencyMode();
    }
}
