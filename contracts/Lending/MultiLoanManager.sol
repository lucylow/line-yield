// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MultiLoanManager
 * @dev Advanced loan management system supporting multiple loan types with configurable terms
 * @author LINE Yield Team
 */
contract MultiLoanManager is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant LIQUIDATOR_ROLE = keccak256("LIQUIDATOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // Tokens
    IERC20 public immutable loanToken;      // Token being lent (e.g., USDT)
    IERC20 public immutable collateralToken; // Token used as collateral (e.g., KLAY)

    // Counters
    Counters.Counter private _loanTypeCounter;
    Counters.Counter private _loanCounter;

    // Loan type configuration
    struct LoanType {
        string name;
        string description;
        uint256 maxAmount;           // Maximum loan amount
        uint256 minAmount;           // Minimum loan amount
        uint256 interestRateBps;     // Annual interest rate in basis points
        uint256 collateralRatioBps;  // Required collateral ratio (e.g., 15000 = 150%)
        uint256 durationSeconds;     // Loan duration in seconds
        uint256 liquidationThresholdBps; // Liquidation threshold (e.g., 12000 = 120%)
        uint256 penaltyRateBps;      // Penalty rate for late payments
        bool active;                 // Whether this loan type is available
        bool requiresKYC;           // Whether KYC is required for this loan type
        uint256 maxBorrowers;       // Maximum number of borrowers (0 = unlimited)
        uint256 currentBorrowers;   // Current number of active borrowers
    }

    // Individual loan
    struct Loan {
        uint256 loanTypeId;
        address borrower;
        uint256 principal;           // Original loan amount
        uint256 collateral;         // Collateral amount locked
        uint256 startTimestamp;      // Loan start time
        uint256 repaidAmount;        // Total amount repaid
        uint256 lastPaymentTimestamp; // Last payment time
        LoanStatus status;
        uint256 interestAccrued;     // Interest accrued so far
        bool isLiquidated;          // Whether loan has been liquidated
    }

    // Loan status enum
    enum LoanStatus { 
        Active, 
        Repaid, 
        Liquidated, 
        Defaulted,
        Cancelled 
    }

    // Mappings
    mapping(uint256 => LoanType) public loanTypes;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => bool) public kycVerified;
    mapping(address => uint256) public borrowerCreditScore;

    // Price oracle interface (simplified)
    mapping(address => uint256) public tokenPrices; // token => price in USD (scaled by 1e18)

    // Events
    event LoanTypeCreated(
        uint256 indexed loanTypeId,
        string name,
        uint256 maxAmount,
        uint256 minAmount,
        uint256 interestRateBps,
        uint256 collateralRatioBps,
        uint256 durationSeconds
    );

    event LoanTypeUpdated(uint256 indexed loanTypeId, bool active);

    event LoanCreated(
        uint256 indexed loanId,
        uint256 indexed loanTypeId,
        address indexed borrower,
        uint256 principal,
        uint256 collateral,
        uint256 startTimestamp
    );

    event LoanRepaid(
        uint256 indexed loanId,
        uint256 amount,
        uint256 interestPaid,
        uint256 remainingBalance
    );

    event LoanLiquidated(
        uint256 indexed loanId,
        address indexed liquidator,
        uint256 collateralSeized,
        uint256 debtAmount
    );

    event CollateralAdded(
        uint256 indexed loanId,
        uint256 additionalCollateral
    );

    event CollateralWithdrawn(
        uint256 indexed loanId,
        uint256 withdrawnAmount
    );

    event KYCCertified(address indexed user, bool verified);

    event CreditScoreUpdated(address indexed user, uint256 newScore);

    // Errors
    error InvalidLoanType();
    error LoanTypeInactive();
    error InvalidAmount();
    error InsufficientCollateral();
    error LoanNotFound();
    error UnauthorizedBorrower();
    error LoanNotActive();
    error InsufficientRepayment();
    error LoanNotLiquidatable();
    error KYCRequired();
    error MaxBorrowersReached();
    error InvalidPrice();
    error InsufficientLiquidity();

    constructor(
        IERC20 _loanToken,
        IERC20 _collateralToken,
        address _admin
    ) {
        require(address(_loanToken) != address(0), "Invalid loan token");
        require(address(_collateralToken) != address(0), "Invalid collateral token");
        require(_admin != address(0), "Invalid admin");

        loanToken = _loanToken;
        collateralToken = _collateralToken;

        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(ADMIN_ROLE, _admin);
        _setupRole(LIQUIDATOR_ROLE, _admin);
        _setupRole(ORACLE_ROLE, _admin);
    }

    /**
     * @dev Create a new loan type
     */
    function createLoanType(
        string memory name,
        string memory description,
        uint256 maxAmount,
        uint256 minAmount,
        uint256 interestRateBps,
        uint256 collateralRatioBps,
        uint256 durationSeconds,
        uint256 liquidationThresholdBps,
        uint256 penaltyRateBps,
        bool requiresKYC,
        uint256 maxBorrowers
    ) external onlyRole(ADMIN_ROLE) {
        require(maxAmount > 0 && minAmount > 0 && maxAmount >= minAmount, "Invalid amount ranges");
        require(collateralRatioBps >= 10000, "Collateral ratio must be >= 100%");
        require(liquidationThresholdBps < collateralRatioBps, "Liquidation threshold must be < collateral ratio");
        require(durationSeconds > 0, "Duration must be positive");

        uint256 loanTypeId = _loanTypeCounter.current();
        _loanTypeCounter.increment();

        loanTypes[loanTypeId] = LoanType({
            name: name,
            description: description,
            maxAmount: maxAmount,
            minAmount: minAmount,
            interestRateBps: interestRateBps,
            collateralRatioBps: collateralRatioBps,
            durationSeconds: durationSeconds,
            liquidationThresholdBps: liquidationThresholdBps,
            penaltyRateBps: penaltyRateBps,
            active: true,
            requiresKYC: requiresKYC,
            maxBorrowers: maxBorrowers,
            currentBorrowers: 0
        });

        emit LoanTypeCreated(
            loanTypeId,
            name,
            maxAmount,
            minAmount,
            interestRateBps,
            collateralRatioBps,
            durationSeconds
        );
    }

    /**
     * @dev Update loan type status
     */
    function setLoanTypeActive(uint256 loanTypeId, bool active) external onlyRole(ADMIN_ROLE) {
        if (loanTypeId >= _loanTypeCounter.current()) revert InvalidLoanType();
        loanTypes[loanTypeId].active = active;
        emit LoanTypeUpdated(loanTypeId, active);
    }

    /**
     * @dev Create a new loan
     */
    function createLoan(
        uint256 loanTypeId,
        uint256 principalRequested,
        uint256 collateralAmount
    ) external nonReentrant whenNotPaused {
        if (loanTypeId >= _loanTypeCounter.current()) revert InvalidLoanType();
        
        LoanType storage lt = loanTypes[loanTypeId];
        if (!lt.active) revert LoanTypeInactive();
        if (principalRequested < lt.minAmount || principalRequested > lt.maxAmount) revert InvalidAmount();
        if (lt.maxBorrowers > 0 && lt.currentBorrowers >= lt.maxBorrowers) revert MaxBorrowersReached();
        if (lt.requiresKYC && !kycVerified[msg.sender]) revert KYCRequired();

        // Calculate required collateral
        uint256 requiredCollateral = calculateRequiredCollateral(principalRequested, lt.collateralRatioBps);
        if (collateralAmount < requiredCollateral) revert InsufficientCollateral();

        // Check contract has enough liquidity
        if (loanToken.balanceOf(address(this)) < principalRequested) revert InsufficientLiquidity();

        // Transfer collateral from borrower
        collateralToken.safeTransferFrom(msg.sender, address(this), collateralAmount);

        // Transfer loan tokens to borrower
        loanToken.safeTransfer(msg.sender, principalRequested);

        // Create loan record
        uint256 loanId = _loanCounter.current();
        _loanCounter.increment();

        loans[loanId] = Loan({
            loanTypeId: loanTypeId,
            borrower: msg.sender,
            principal: principalRequested,
            collateral: collateralAmount,
            startTimestamp: block.timestamp,
            repaidAmount: 0,
            lastPaymentTimestamp: block.timestamp,
            status: LoanStatus.Active,
            interestAccrued: 0,
            isLiquidated: false
        });

        borrowerLoans[msg.sender].push(loanId);
        lt.currentBorrowers++;

        emit LoanCreated(
            loanId,
            loanTypeId,
            msg.sender,
            principalRequested,
            collateralAmount,
            block.timestamp
        );
    }

    /**
     * @dev Repay loan (partial or full)
     */
    function repayLoan(uint256 loanId, uint256 amount) external nonReentrant {
        Loan storage loan = loans[loanId];
        if (loan.borrower != msg.sender) revert UnauthorizedBorrower();
        if (loan.status != LoanStatus.Active) revert LoanNotActive();
        if (amount == 0) revert InvalidAmount();

        // Calculate total amount owed
        uint256 totalOwed = calculateTotalOwed(loanId);
        uint256 remainingDebt = totalOwed - loan.repaidAmount;
        
        if (amount > remainingDebt) revert InsufficientRepayment();

        // Transfer repayment from borrower
        loanToken.safeTransferFrom(msg.sender, address(this), amount);

        // Update loan
        loan.repaidAmount += amount;
        loan.lastPaymentTimestamp = block.timestamp;

        // Check if fully repaid
        if (loan.repaidAmount >= totalOwed) {
            loan.status = LoanStatus.Repaid;
            
            // Return collateral to borrower
            collateralToken.safeTransfer(loan.borrower, loan.collateral);
            loan.collateral = 0;

            // Update loan type borrower count
            loanTypes[loan.loanTypeId].currentBorrowers--;
        }

        emit LoanRepaid(loanId, amount, 0, remainingDebt - amount);
    }

    /**
     * @dev Add additional collateral to existing loan
     */
    function addCollateral(uint256 loanId, uint256 additionalAmount) external nonReentrant {
        Loan storage loan = loans[loanId];
        if (loan.borrower != msg.sender) revert UnauthorizedBorrower();
        if (loan.status != LoanStatus.Active) revert LoanNotActive();
        if (additionalAmount == 0) revert InvalidAmount();

        collateralToken.safeTransferFrom(msg.sender, address(this), additionalAmount);
        loan.collateral += additionalAmount;

        emit CollateralAdded(loanId, additionalAmount);
    }

    /**
     * @dev Withdraw excess collateral (if collateral ratio is above required)
     */
    function withdrawExcessCollateral(uint256 loanId, uint256 amount) external nonReentrant {
        Loan storage loan = loans[loanId];
        if (loan.borrower != msg.sender) revert UnauthorizedBorrower();
        if (loan.status != LoanStatus.Active) revert LoanNotActive();

        uint256 totalOwed = calculateTotalOwed(loanId);
        uint256 requiredCollateral = calculateRequiredCollateral(totalOwed, loanTypes[loan.loanTypeId].collateralRatioBps);
        
        if (loan.collateral - amount < requiredCollateral) revert InsufficientCollateral();

        loan.collateral -= amount;
        collateralToken.safeTransfer(msg.sender, amount);

        emit CollateralWithdrawn(loanId, amount);
    }

    /**
     * @dev Liquidate undercollateralized or overdue loan
     */
    function liquidateLoan(uint256 loanId) external onlyRole(LIQUIDATOR_ROLE) nonReentrant {
        Loan storage loan = loans[loanId];
        if (loan.status != LoanStatus.Active) revert LoanNotActive();

        LoanType memory lt = loanTypes[loan.loanTypeId];
        
        // Check if loan is liquidatable
        bool isLiquidatable = isLoanLiquidatable(loanId);
        if (!isLiquidatable) revert LoanNotLiquidatable();

        // Calculate liquidation amount
        uint256 totalOwed = calculateTotalOwed(loanId);
        uint256 collateralValue = calculateCollateralValue(loan.collateral);
        
        // Liquidator gets collateral, borrower's debt is cleared
        loan.status = LoanStatus.Liquidated;
        loan.isLiquidated = true;
        loan.collateral = 0;

        // Update loan type borrower count
        lt.currentBorrowers--;

        // Transfer collateral to liquidator
        collateralToken.safeTransfer(msg.sender, loan.collateral);

        emit LoanLiquidated(loanId, msg.sender, loan.collateral, totalOwed);
    }

    /**
     * @dev Set KYC verification status
     */
    function setKYCVerified(address user, bool verified) external onlyRole(ADMIN_ROLE) {
        kycVerified[user] = verified;
        emit KYCCertified(user, verified);
    }

    /**
     * @dev Update borrower credit score
     */
    function updateCreditScore(address borrower, uint256 score) external onlyRole(ADMIN_ROLE) {
        borrowerCreditScore[borrower] = score;
        emit CreditScoreUpdated(borrower, score);
    }

    /**
     * @dev Update token price (oracle function)
     */
    function updateTokenPrice(address token, uint256 price) external onlyRole(ORACLE_ROLE) {
        if (price == 0) revert InvalidPrice();
        tokenPrices[token] = price;
    }

    /**
     * @dev Calculate required collateral for a loan amount
     */
    function calculateRequiredCollateral(uint256 loanAmount, uint256 collateralRatioBps) public pure returns (uint256) {
        return (loanAmount * collateralRatioBps) / 10000;
    }

    /**
     * @dev Calculate total amount owed (principal + interest + penalties)
     */
    function calculateTotalOwed(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        LoanType memory lt = loanTypes[loan.loanTypeId];
        
        uint256 interest = calculateInterest(loanId);
        uint256 penalty = calculatePenalty(loanId);
        
        return loan.principal + interest + penalty;
    }

    /**
     * @dev Calculate interest accrued on loan
     */
    function calculateInterest(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        LoanType memory lt = loanTypes[loan.loanTypeId];
        
        uint256 timeElapsed = block.timestamp - loan.startTimestamp;
        uint256 maxDuration = lt.durationSeconds;
        
        if (timeElapsed > maxDuration) {
            timeElapsed = maxDuration;
        }
        
        // Simple interest calculation: principal * rate * time
        return (loan.principal * lt.interestRateBps * timeElapsed) / (10000 * 365 days);
    }

    /**
     * @dev Calculate penalty for overdue loans
     */
    function calculatePenalty(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        LoanType memory lt = loanTypes[loan.loanTypeId];
        
        if (block.timestamp <= loan.startTimestamp + lt.durationSeconds) {
            return 0; // Not overdue
        }
        
        uint256 overdueTime = block.timestamp - (loan.startTimestamp + lt.durationSeconds);
        return (loan.principal * lt.penaltyRateBps * overdueTime) / (10000 * 365 days);
    }

    /**
     * @dev Check if loan is liquidatable
     */
    function isLoanLiquidatable(uint256 loanId) public view returns (bool) {
        Loan memory loan = loans[loanId];
        LoanType memory lt = loanTypes[loan.loanTypeId];
        
        // Check if overdue
        bool overdue = block.timestamp > loan.startTimestamp + lt.durationSeconds;
        
        // Check collateralization ratio
        uint256 totalOwed = calculateTotalOwed(loanId);
        uint256 collateralValue = calculateCollateralValue(loan.collateral);
        uint256 currentRatio = (collateralValue * 10000) / totalOwed;
        
        bool undercollateralized = currentRatio < lt.liquidationThresholdBps;
        
        return overdue || undercollateralized;
    }

    /**
     * @dev Calculate collateral value in loan token terms
     */
    function calculateCollateralValue(uint256 collateralAmount) public view returns (uint256) {
        uint256 collateralPrice = tokenPrices[address(collateralToken)];
        uint256 loanTokenPrice = tokenPrices[address(loanToken)];
        
        if (collateralPrice == 0 || loanTokenPrice == 0) {
            // Fallback to 1:1 ratio if prices not set
            return collateralAmount;
        }
        
        return (collateralAmount * collateralPrice) / loanTokenPrice;
    }

    /**
     * @dev Get loan details
     */
    function getLoan(uint256 loanId) external view returns (
        uint256 loanTypeId,
        address borrower,
        uint256 principal,
        uint256 collateral,
        uint256 startTimestamp,
        uint256 repaidAmount,
        uint256 lastPaymentTimestamp,
        LoanStatus status,
        uint256 interestAccrued,
        bool isLiquidated
    ) {
        Loan memory loan = loans[loanId];
        return (
            loan.loanTypeId,
            loan.borrower,
            loan.principal,
            loan.collateral,
            loan.startTimestamp,
            loan.repaidAmount,
            loan.lastPaymentTimestamp,
            loan.status,
            loan.interestAccrued,
            loan.isLiquidated
        );
    }

    /**
     * @dev Get loan type details
     */
    function getLoanType(uint256 loanTypeId) external view returns (
        string memory name,
        string memory description,
        uint256 maxAmount,
        uint256 minAmount,
        uint256 interestRateBps,
        uint256 collateralRatioBps,
        uint256 durationSeconds,
        uint256 liquidationThresholdBps,
        uint256 penaltyRateBps,
        bool active,
        bool requiresKYC,
        uint256 maxBorrowers,
        uint256 currentBorrowers
    ) {
        if (loanTypeId >= _loanTypeCounter.current()) revert InvalidLoanType();
        
        LoanType memory lt = loanTypes[loanTypeId];
        return (
            lt.name,
            lt.description,
            lt.maxAmount,
            lt.minAmount,
            lt.interestRateBps,
            lt.collateralRatioBps,
            lt.durationSeconds,
            lt.liquidationThresholdBps,
            lt.penaltyRateBps,
            lt.active,
            lt.requiresKYC,
            lt.maxBorrowers,
            lt.currentBorrowers
        );
    }

    /**
     * @dev Get borrower's loans
     */
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }

    /**
     * @dev Get total number of loan types
     */
    function getLoanTypeCount() external view returns (uint256) {
        return _loanTypeCounter.current();
    }

    /**
     * @dev Get total number of loans
     */
    function getLoanCount() external view returns (uint256) {
        return _loanCounter.current();
    }

    /**
     * @dev Pause contract (emergency only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Emergency withdrawal (admin only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}


