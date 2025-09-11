// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./interfaces/IStrategy.sol";
import "./interfaces/IStrategyManager.sol";

/**
 * @title GaslessVault
 * @dev ERC-4626 compliant vault with gasless transaction support using Kaia's fee delegation
 * @author Kaia Yield Optimizer Team
 */
contract GaslessVault is ERC4626, ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // Strategy manager contract
    IStrategyManager public strategyManager;
    
    // Relayer address that will pay for gas fees
    address public relayer;
    
    // Nonce for each user to prevent replay attacks
    mapping(address => uint256) public nonces;
    
    // Performance tracking
    uint256 public totalYieldEarned;
    uint256 public lastHarvestTime;
    uint256 public harvestInterval = 1 days;
    
    // Fee configuration (in basis points, 10000 = 100%)
    uint256 public managementFee = 200; // 2%
    uint256 public performanceFee = 1000; // 10%
    uint256 public constant MAX_FEE = 2000; // 20%
    
    // Fee recipient
    address public feeRecipient;
    
    // Gasless transaction events
    event GaslessDeposit(address indexed user, uint256 assets, uint256 shares, uint256 nonce);
    event GaslessWithdraw(address indexed user, uint256 assets, uint256 shares, uint256 nonce);
    event GaslessMint(address indexed user, uint256 shares, uint256 assets, uint256 nonce);
    event GaslessRedeem(address indexed user, uint256 shares, uint256 assets, uint256 nonce);
    
    // Original events
    event YieldReported(uint256 yield, uint256 managementFee, uint256 performanceFee);
    event StrategyManagerUpdated(address indexed newManager);
    event FeesUpdated(uint256 managementFee, uint256 performanceFee);
    event FeeRecipientUpdated(address indexed newRecipient);
    event HarvestExecuted(uint256 totalYield, uint256 fees);
    event RelayerUpdated(address indexed newRelayer);
    
    // Errors
    error InvalidStrategyManager();
    error InvalidFeeAmount();
    error InvalidFeeRecipient();
    error InvalidRelayer();
    error HarvestNotReady();
    error InsufficientYield();
    error InvalidNonce();
    error InvalidSignature();
    error OnlyRelayer();
    
    constructor(
        IERC20 asset,
        string memory name,
        string memory symbol,
        address _strategyManager,
        address _feeRecipient,
        address _relayer
    ) ERC4626(asset) ERC20(name, symbol) {
        if (_strategyManager == address(0)) revert InvalidStrategyManager();
        if (_feeRecipient == address(0)) revert InvalidFeeRecipient();
        if (_relayer == address(0)) revert InvalidRelayer();
        
        strategyManager = IStrategyManager(_strategyManager);
        feeRecipient = _feeRecipient;
        relayer = _relayer;
        lastHarvestTime = block.timestamp;
    }
    
    /**
     * @dev Execute a gasless deposit transaction
     * @param user The user making the deposit
     * @param assets Amount of assets to deposit
     * @param receiver Address to receive shares
     * @param _nonce User's nonce for replay protection
     * @param signature User's signature of the transaction
     */
    function executeGaslessDeposit(
        address user,
        uint256 assets,
        address receiver,
        uint256 _nonce,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        if (msg.sender != relayer) revert OnlyRelayer();
        
        // Verify nonce and increment
        if (_nonce != nonces[user]) revert InvalidNonce();
        nonces[user]++;
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            address(this),
            user,
            _nonce,
            "deposit",
            assets,
            receiver
        ));
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        if (signer != user) revert InvalidSignature();
        
        // Execute deposit
        uint256 shares = super.deposit(assets, receiver);
        
        // Allocate to strategies after deposit
        _allocateToStrategies();
        
        emit GaslessDeposit(user, assets, shares, _nonce);
    }
    
    /**
     * @dev Execute a gasless withdrawal transaction
     * @param user The user making the withdrawal
     * @param assets Amount of assets to withdraw
     * @param receiver Address to receive assets
     * @param owner Address that owns the shares
     * @param _nonce User's nonce for replay protection
     * @param signature User's signature of the transaction
     */
    function executeGaslessWithdraw(
        address user,
        uint256 assets,
        address receiver,
        address owner,
        uint256 _nonce,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        if (msg.sender != relayer) revert OnlyRelayer();
        
        // Verify nonce and increment
        if (_nonce != nonces[user]) revert InvalidNonce();
        nonces[user]++;
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            address(this),
            user,
            _nonce,
            "withdraw",
            assets,
            receiver,
            owner
        ));
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        if (signer != user) revert InvalidSignature();
        
        // Deallocate from strategies before withdrawal
        _deallocateFromStrategies(assets);
        
        // Execute withdrawal
        uint256 shares = super.withdraw(assets, receiver, owner);
        
        emit GaslessWithdraw(user, assets, shares, _nonce);
    }
    
    /**
     * @dev Execute a gasless mint transaction
     * @param user The user making the mint
     * @param shares Amount of shares to mint
     * @param receiver Address to receive shares
     * @param _nonce User's nonce for replay protection
     * @param signature User's signature of the transaction
     */
    function executeGaslessMint(
        address user,
        uint256 shares,
        address receiver,
        uint256 _nonce,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        if (msg.sender != relayer) revert OnlyRelayer();
        
        // Verify nonce and increment
        if (_nonce != nonces[user]) revert InvalidNonce();
        nonces[user]++;
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            address(this),
            user,
            _nonce,
            "mint",
            shares,
            receiver
        ));
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        if (signer != user) revert InvalidSignature();
        
        // Execute mint
        uint256 assets = super.mint(shares, receiver);
        
        // Allocate to strategies after mint
        _allocateToStrategies();
        
        emit GaslessMint(user, shares, assets, _nonce);
    }
    
    /**
     * @dev Execute a gasless redeem transaction
     * @param user The user making the redeem
     * @param shares Amount of shares to redeem
     * @param receiver Address to receive assets
     * @param owner Address that owns the shares
     * @param _nonce User's nonce for replay protection
     * @param signature User's signature of the transaction
     */
    function executeGaslessRedeem(
        address user,
        uint256 shares,
        address receiver,
        address owner,
        uint256 _nonce,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        if (msg.sender != relayer) revert OnlyRelayer();
        
        // Verify nonce and increment
        if (_nonce != nonces[user]) revert InvalidNonce();
        nonces[user]++;
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            address(this),
            user,
            _nonce,
            "redeem",
            shares,
            receiver,
            owner
        ));
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        if (signer != user) revert InvalidSignature();
        
        uint256 assets = previewRedeem(shares);
        
        // Deallocate from strategies before redemption
        _deallocateFromStrategies(assets);
        
        // Execute redeem
        assets = super.redeem(shares, receiver, owner);
        
        emit GaslessRedeem(user, shares, assets, _nonce);
    }
    
    // Standard ERC-4626 functions (for non-gasless transactions)
    
    /**
     * @dev Deposit assets and mint shares
     * @param assets Amount of assets to deposit
     * @param receiver Address to receive shares
     * @return shares Amount of shares minted
     */
    function deposit(uint256 assets, address receiver)
        public
        override
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        require(assets > 0, "Invalid amount");
        require(receiver != address(0), "Invalid receiver");
        
        shares = super.deposit(assets, receiver);
        
        // Allocate to strategies after deposit
        _allocateToStrategies();
        
        return shares;
    }
    
    /**
     * @dev Mint shares for assets
     * @param shares Amount of shares to mint
     * @param receiver Address to receive shares
     * @return assets Amount of assets deposited
     */
    function mint(uint256 shares, address receiver)
        public
        override
        nonReentrant
        whenNotPaused
        returns (uint256 assets)
    {
        require(shares > 0, "Invalid shares");
        require(receiver != address(0), "Invalid receiver");
        
        assets = super.mint(shares, receiver);
        
        // Allocate to strategies after mint
        _allocateToStrategies();
        
        return assets;
    }
    
    /**
     * @dev Withdraw assets by burning shares
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
        returns (uint256 shares)
    {
        require(assets > 0, "Invalid amount");
        require(receiver != address(0), "Invalid receiver");
        
        // Deallocate from strategies before withdrawal
        _deallocateFromStrategies(assets);
        
        shares = super.withdraw(assets, receiver, owner);
        
        return shares;
    }
    
    /**
     * @dev Redeem shares for assets
     * @param shares Amount of shares to redeem
     * @param receiver Address to receive assets
     * @param owner Address that owns the shares
     * @return assets Amount of assets withdrawn
     */
    function redeem(uint256 shares, address receiver, address owner)
        public
        override
        nonReentrant
        whenNotPaused
        returns (uint256 assets)
    {
        require(shares > 0, "Invalid shares");
        require(receiver != address(0), "Invalid receiver");
        
        assets = previewRedeem(shares);
        
        // Deallocate from strategies before redemption
        _deallocateFromStrategies(assets);
        
        assets = super.redeem(shares, receiver, owner);
        
        return assets;
    }
    
    /**
     * @dev Harvest yield from all strategies
     */
    function harvest() external nonReentrant whenNotPaused {
        if (block.timestamp < lastHarvestTime + harvestInterval) {
            revert HarvestNotReady();
        }
        
        uint256 totalYield = 0;
        uint256 totalFees = 0;
        
        // Harvest from all active strategies
        address[] memory strategies = strategyManager.getActiveStrategies();
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i] != address(0)) {
                uint256 yield = IStrategy(strategies[i]).harvest();
                totalYield += yield;
            }
        }
        
        if (totalYield > 0) {
            // Calculate fees
            uint256 managementFeeAmount = (totalYield * managementFee) / 10000;
            uint256 performanceFeeAmount = (totalYield * performanceFee) / 10000;
            totalFees = managementFeeAmount + performanceFeeAmount;
            
            // Transfer fees to recipient
            if (totalFees > 0) {
                IERC20(asset()).safeTransfer(feeRecipient, totalFees);
            }
            
            // Update tracking
            totalYieldEarned += totalYield;
            lastHarvestTime = block.timestamp;
            
            emit HarvestExecuted(totalYield, totalFees);
            emit YieldReported(totalYield, managementFeeAmount, performanceFeeAmount);
        }
    }
    
    /**
     * @dev Allocate available assets to strategies
     */
    function _allocateToStrategies() internal {
        uint256 availableAssets = IERC20(asset()).balanceOf(address(this));
        if (availableAssets > 0) {
            strategyManager.allocateAssets(availableAssets);
        }
    }
    
    /**
     * @dev Deallocate assets from strategies
     * @param amount Amount to deallocate
     */
    function _deallocateFromStrategies(uint256 amount) internal {
        strategyManager.deallocateAssets(amount);
    }
    
    /**
     * @dev Get total assets under management
     * @return Total assets including those in strategies
     */
    function totalAssets() public view override returns (uint256) {
        uint256 vaultBalance = IERC20(asset()).balanceOf(address(this));
        uint256 strategyAssets = strategyManager.getTotalAssets();
        return vaultBalance + strategyAssets;
    }
    
    /**
     * @dev Get current APY (Annual Percentage Yield)
     * @return APY in basis points
     */
    function getCurrentAPY() external view returns (uint256) {
        return strategyManager.getCurrentAPY();
    }
    
    /**
     * @dev Get strategy allocations
     * @return strategies Array of strategy addresses
     * @return allocations Array of allocation amounts
     */
    function getStrategyAllocations() external view returns (address[] memory strategies, uint256[] memory allocations) {
        return strategyManager.getStrategyAllocations();
    }
    
    // Admin functions
    
    /**
     * @dev Update relayer address
     * @param _relayer New relayer address
     */
    function setRelayer(address _relayer) external onlyOwner {
        if (_relayer == address(0)) revert InvalidRelayer();
        relayer = _relayer;
        emit RelayerUpdated(_relayer);
    }
    
    /**
     * @dev Update strategy manager
     * @param _strategyManager New strategy manager address
     */
    function setStrategyManager(address _strategyManager) external onlyOwner {
        if (_strategyManager == address(0)) revert InvalidStrategyManager();
        strategyManager = IStrategyManager(_strategyManager);
        emit StrategyManagerUpdated(_strategyManager);
    }
    
    /**
     * @dev Update fee configuration
     * @param _managementFee New management fee in basis points
     * @param _performanceFee New performance fee in basis points
     */
    function setFees(uint256 _managementFee, uint256 _performanceFee) external onlyOwner {
        if (_managementFee > MAX_FEE || _performanceFee > MAX_FEE) {
            revert InvalidFeeAmount();
        }
        managementFee = _managementFee;
        performanceFee = _performanceFee;
        emit FeesUpdated(_managementFee, _performanceFee);
    }
    
    /**
     * @dev Update fee recipient
     * @param _feeRecipient New fee recipient address
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        if (_feeRecipient == address(0)) revert InvalidFeeRecipient();
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }
    
    /**
     * @dev Update harvest interval
     * @param _interval New harvest interval in seconds
     */
    function setHarvestInterval(uint256 _interval) external onlyOwner {
        harvestInterval = _interval;
    }
    
    /**
     * @dev Pause the vault
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the vault
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal of all assets
     */
    function emergencyWithdraw() external onlyOwner {
        _pause();
        strategyManager.emergencyWithdrawAll();
    }
}
