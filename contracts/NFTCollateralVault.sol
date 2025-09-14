// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/INFTPriceOracle.sol";
import "./interfaces/ILiquidationEngine.sol";

/// @title NFT Collateral Vault for Line Yield Protocol
/// @notice Users deposit NFTs as collateral, borrow stablecoins, repay loans, and withdraw NFTs
/// @dev Implements advanced features like liquidation, interest accrual, and multiple NFT collections
contract NFTCollateralVault is ReentrancyGuard, AccessControl, Pausable, ERC721Holder {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using Math for uint256;

    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");
    bytes32 public constant LIQUIDATOR_ROLE = keccak256("LIQUIDATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // Core contracts
    IERC20 public immutable stablecoin; // USDT or other stablecoin
    INFTPriceOracle public priceOracle;
    ILiquidationEngine public liquidationEngine;

    // Collateral position structure
    struct CollateralPosition {
        address owner;              // Owner who deposited the NFT
        address nftContract;        // NFT contract address
        uint256 tokenId;            // NFT Token ID
        uint256 collateralValue;    // Current collateral value in stablecoin
        uint256 loanAmount;         // Amount of stablecoin borrowed
        uint256 interestAccrued;    // Interest accrued on the loan
        uint256 lastInterestUpdate; // Timestamp of last interest update
        uint256 createdAt;          // Position creation timestamp
        bool active;                // Position active or closed
        bool liquidated;            // Position liquidated
    }

    // Supported NFT collections
    struct NFTCollection {
        address contractAddress;
        bool supported;
        uint256 maxLTV;            // Maximum loan-to-value ratio (basis points)
        uint256 liquidationThreshold; // Liquidation threshold (basis points)
        uint256 interestRate;      // Annual interest rate (basis points)
        bool active;
    }

    // Global state
    mapping(bytes32 => CollateralPosition) public positions; // positionId => position
    mapping(address => NFTCollection) public supportedCollections;
    mapping(address => bytes32[]) public userPositions; // user => positionIds[]
    
    // Configuration
    uint256 public globalMaxLTV = 7000; // 70% default max LTV
    uint256 public globalLiquidationThreshold = 8000; // 80% liquidation threshold
    uint256 public globalInterestRate = 500; // 5% annual interest rate
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // Liquidity management
    uint256 public totalCollateralValue;
    uint256 public totalLoanAmount;
    uint256 public totalInterestAccrued;
    uint256 public vaultLiquidity; // Available stablecoin liquidity

    // Events
    event PositionOpened(
        bytes32 indexed positionId,
        address indexed owner,
        address indexed nftContract,
        uint256 tokenId,
        uint256 collateralValue,
        uint256 loanAmount
    );
    
    event LoanRepaid(
        bytes32 indexed positionId,
        address indexed owner,
        uint256 repayAmount,
        uint256 interestPaid
    );
    
    event PositionClosed(
        bytes32 indexed positionId,
        address indexed owner,
        address indexed nftContract,
        uint256 tokenId
    );
    
    event PositionLiquidated(
        bytes32 indexed positionId,
        address indexed owner,
        address indexed liquidator,
        uint256 liquidationAmount
    );
    
    event CollectionAdded(
        address indexed nftContract,
        uint256 maxLTV,
        uint256 liquidationThreshold,
        uint256 interestRate
    );
    
    event CollectionUpdated(
        address indexed nftContract,
        uint256 maxLTV,
        uint256 liquidationThreshold,
        uint256 interestRate
    );
    
    event LiquidityAdded(uint256 amount);
    event LiquidityRemoved(uint256 amount);
    event InterestAccrued(bytes32 indexed positionId, uint256 interestAmount);

    // Errors
    error UnsupportedNFTCollection();
    error PositionNotFound();
    error PositionNotActive();
    error InsufficientCollateral();
    error LoanAmountExceedsMaxLTV();
    error InsufficientVaultLiquidity();
    error InvalidRepayAmount();
    error PositionNotLiquidatable();
    error UnauthorizedLiquidator();
    error InvalidParameters();

    constructor(
        address _stablecoin,
        address _priceOracle,
        address _liquidationEngine
    ) {
        require(_stablecoin != address(0), "Invalid stablecoin address");
        require(_priceOracle != address(0), "Invalid price oracle address");
        
        stablecoin = IERC20(_stablecoin);
        priceOracle = INFTPriceOracle(_priceOracle);
        liquidationEngine = ILiquidationEngine(_liquidationEngine);
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(PRICE_UPDATER_ROLE, msg.sender);
        _setupRole(LIQUIDATOR_ROLE, msg.sender);
        _setupRole(EMERGENCY_ROLE, msg.sender);
    }

    /// @notice Add a new NFT collection for collateral
    function addNFTCollection(
        address nftContract,
        uint256 maxLTV,
        uint256 liquidationThreshold,
        uint256 interestRate
    ) external onlyRole(ADMIN_ROLE) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(maxLTV <= BASIS_POINTS, "Max LTV cannot exceed 100%");
        require(liquidationThreshold <= BASIS_POINTS, "Liquidation threshold cannot exceed 100%");
        require(maxLTV < liquidationThreshold, "Max LTV must be less than liquidation threshold");
        
        supportedCollections[nftContract] = NFTCollection({
            contractAddress: nftContract,
            supported: true,
            maxLTV: maxLTV,
            liquidationThreshold: liquidationThreshold,
            interestRate: interestRate,
            active: true
        });
        
        emit CollectionAdded(nftContract, maxLTV, liquidationThreshold, interestRate);
    }

    /// @notice Update NFT collection parameters
    function updateNFTCollection(
        address nftContract,
        uint256 maxLTV,
        uint256 liquidationThreshold,
        uint256 interestRate
    ) external onlyRole(ADMIN_ROLE) {
        require(supportedCollections[nftContract].supported, "Collection not supported");
        require(maxLTV <= BASIS_POINTS, "Max LTV cannot exceed 100%");
        require(liquidationThreshold <= BASIS_POINTS, "Liquidation threshold cannot exceed 100%");
        require(maxLTV < liquidationThreshold, "Max LTV must be less than liquidation threshold");
        
        supportedCollections[nftContract].maxLTV = maxLTV;
        supportedCollections[nftContract].liquidationThreshold = liquidationThreshold;
        supportedCollections[nftContract].interestRate = interestRate;
        
        emit CollectionUpdated(nftContract, maxLTV, liquidationThreshold, interestRate);
    }

    /// @notice Deposit NFT and borrow stablecoin
    function depositNFTAndBorrow(
        address nftContract,
        uint256 tokenId,
        uint256 borrowAmount
    ) external nonReentrant whenNotPaused {
        NFTCollection memory collection = supportedCollections[nftContract];
        require(collection.supported && collection.active, "Unsupported NFT collection");
        
        // Check if NFT is already used as collateral
        bytes32 positionId = keccak256(abi.encodePacked(nftContract, tokenId));
        require(!positions[positionId].active, "NFT already used as collateral");
        
        // Transfer NFT from user to vault
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Get current NFT value from oracle
        uint256 collateralValue = priceOracle.getNFTValue(nftContract, tokenId);
        require(collateralValue > 0, "NFT value not available");
        
        // Calculate maximum borrow amount
        uint256 maxBorrow = (collateralValue * collection.maxLTV) / BASIS_POINTS;
        require(borrowAmount <= maxBorrow, "Borrow amount exceeds max LTV");
        require(borrowAmount <= vaultLiquidity, "Insufficient vault liquidity");
        
        // Create position
        positions[positionId] = CollateralPosition({
            owner: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            collateralValue: collateralValue,
            loanAmount: borrowAmount,
            interestAccrued: 0,
            lastInterestUpdate: block.timestamp,
            createdAt: block.timestamp,
            active: true,
            liquidated: false
        });
        
        // Update user positions
        userPositions[msg.sender].push(positionId);
        
        // Update global state
        totalCollateralValue += collateralValue;
        totalLoanAmount += borrowAmount;
        vaultLiquidity -= borrowAmount;
        
        // Transfer stablecoin to user
        stablecoin.safeTransfer(msg.sender, borrowAmount);
        
        emit PositionOpened(positionId, msg.sender, nftContract, tokenId, collateralValue, borrowAmount);
    }

    /// @notice Repay loan partially or fully
    function repayLoan(
        bytes32 positionId,
        uint256 repayAmount
    ) external nonReentrant {
        CollateralPosition storage position = positions[positionId];
        require(position.active, "Position not active");
        require(position.owner == msg.sender, "Not position owner");
        require(repayAmount > 0, "Invalid repay amount");
        
        // Update interest before repayment
        _updateInterest(positionId);
        
        uint256 totalDebt = position.loanAmount + position.interestAccrued;
        uint256 actualRepayAmount = Math.min(repayAmount, totalDebt);
        uint256 interestPaid = Math.min(actualRepayAmount, position.interestAccrued);
        uint256 principalPaid = actualRepayAmount - interestPaid;
        
        // Transfer stablecoin from user
        stablecoin.safeTransferFrom(msg.sender, address(this), actualRepayAmount);
        
        // Update position
        position.loanAmount -= principalPaid;
        position.interestAccrued -= interestPaid;
        
        // Update global state
        totalLoanAmount -= principalPaid;
        totalInterestAccrued -= interestPaid;
        vaultLiquidity += actualRepayAmount;
        
        emit LoanRepaid(positionId, msg.sender, actualRepayAmount, interestPaid);
        
        // If fully repaid, allow NFT withdrawal
        if (position.loanAmount == 0 && position.interestAccrued == 0) {
            position.active = false;
            emit PositionClosed(positionId, msg.sender, position.nftContract, position.tokenId);
        }
    }

    /// @notice Withdraw NFT after full repayment
    function withdrawNFT(bytes32 positionId) external nonReentrant {
        CollateralPosition storage position = positions[positionId];
        require(position.active, "Position not active");
        require(position.owner == msg.sender, "Not position owner");
        require(position.loanAmount == 0 && position.interestAccrued == 0, "Loan not fully repaid");
        
        // Transfer NFT back to owner
        IERC721(position.nftContract).safeTransferFrom(address(this), position.owner, position.tokenId);
        
        // Update global state
        totalCollateralValue -= position.collateralValue;
        
        // Mark position as inactive
        position.active = false;
        
        emit PositionClosed(positionId, msg.sender, position.nftContract, position.tokenId);
    }

    /// @notice Liquidate an undercollateralized position
    function liquidatePosition(bytes32 positionId) external nonReentrant {
        CollateralPosition storage position = positions[positionId];
        require(position.active, "Position not active");
        require(!position.liquidated, "Position already liquidated");
        
        // Update interest before liquidation check
        _updateInterest(positionId);
        
        // Check if position is liquidatable
        require(_isLiquidatable(positionId), "Position not liquidatable");
        
        // Calculate liquidation amount
        uint256 totalDebt = position.loanAmount + position.interestAccrued;
        uint256 liquidationAmount = liquidationEngine.calculateLiquidationAmount(
            position.collateralValue,
            totalDebt
        );
        
        // Transfer stablecoin from liquidator
        stablecoin.safeTransferFrom(msg.sender, address(this), liquidationAmount);
        
        // Transfer NFT to liquidator
        IERC721(position.nftContract).safeTransferFrom(address(this), msg.sender, position.tokenId);
        
        // Update position
        position.active = false;
        position.liquidated = true;
        
        // Update global state
        totalCollateralValue -= position.collateralValue;
        totalLoanAmount -= position.loanAmount;
        totalInterestAccrued -= position.interestAccrued;
        vaultLiquidity += liquidationAmount;
        
        emit PositionLiquidated(positionId, position.owner, msg.sender, liquidationAmount);
    }

    /// @notice Add liquidity to the vault
    function addLiquidity(uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(amount > 0, "Invalid amount");
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        vaultLiquidity += amount;
        emit LiquidityAdded(amount);
    }

    /// @notice Remove liquidity from the vault
    function removeLiquidity(uint256 amount, address to) external onlyRole(ADMIN_ROLE) {
        require(amount > 0, "Invalid amount");
        require(to != address(0), "Invalid recipient");
        require(vaultLiquidity >= amount, "Insufficient liquidity");
        
        vaultLiquidity -= amount;
        stablecoin.safeTransfer(to, amount);
        emit LiquidityRemoved(amount);
    }

    /// @notice Update interest for a position
    function _updateInterest(bytes32 positionId) internal {
        CollateralPosition storage position = positions[positionId];
        if (!position.active || position.loanAmount == 0) return;
        
        uint256 timeElapsed = block.timestamp - position.lastInterestUpdate;
        if (timeElapsed == 0) return;
        
        NFTCollection memory collection = supportedCollections[position.nftContract];
        uint256 interestRate = collection.interestRate;
        
        // Calculate interest: (loanAmount * interestRate * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR)
        uint256 interest = (position.loanAmount * interestRate * timeElapsed) / (BASIS_POINTS * SECONDS_PER_YEAR);
        
        if (interest > 0) {
            position.interestAccrued += interest;
            totalInterestAccrued += interest;
            position.lastInterestUpdate = block.timestamp;
            
            emit InterestAccrued(positionId, interest);
        }
    }

    /// @notice Check if position is liquidatable
    function _isLiquidatable(bytes32 positionId) internal view returns (bool) {
        CollateralPosition memory position = positions[positionId];
        if (!position.active) return false;
        
        NFTCollection memory collection = supportedCollections[position.nftContract];
        uint256 totalDebt = position.loanAmount + position.interestAccrued;
        
        // Calculate current collateral ratio
        uint256 collateralRatio = (position.collateralValue * BASIS_POINTS) / totalDebt;
        
        return collateralRatio < collection.liquidationThreshold;
    }

    /// @notice Get position details
    function getPosition(bytes32 positionId) external view returns (CollateralPosition memory) {
        return positions[positionId];
    }

    /// @notice Get user positions
    function getUserPositions(address user) external view returns (bytes32[] memory) {
        return userPositions[user];
    }

    /// @notice Get vault statistics
    function getVaultStats() external view returns (
        uint256 _totalCollateralValue,
        uint256 _totalLoanAmount,
        uint256 _totalInterestAccrued,
        uint256 _vaultLiquidity
    ) {
        return (totalCollateralValue, totalLoanAmount, totalInterestAccrued, vaultLiquidity);
    }

    /// @notice Check if NFT collection is supported
    function isCollectionSupported(address nftContract) external view returns (bool) {
        return supportedCollections[nftContract].supported && supportedCollections[nftContract].active;
    }

    /// @notice Emergency pause
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    /// @notice Emergency unpause
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    /// @notice Emergency withdraw NFT
    function emergencyWithdrawNFT(bytes32 positionId, address to) external onlyRole(EMERGENCY_ROLE) {
        CollateralPosition storage position = positions[positionId];
        require(position.active, "Position not active");
        
        IERC721(position.nftContract).safeTransferFrom(address(this), to, position.tokenId);
        position.active = false;
    }
}



