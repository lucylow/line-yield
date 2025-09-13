// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title OnchainCreditScore
 * @dev Advanced onchain credit scoring system for LINE Yield
 * Tracks user behavior, repayment history, and provides lending capabilities
 */
contract OnchainCreditScore is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Credit score structure
    struct CreditProfile {
        uint256 score;              // 0-1000 credit score
        uint256 totalBorrowed;      // Total amount borrowed
        uint256 totalRepaid;        // Total amount repaid
        uint256 activeLoans;        // Number of active loans
        uint256 completedLoans;     // Number of completed loans
        uint256 latePayments;       // Number of late payments
        uint256 onTimePayments;     // Number of on-time payments
        uint256 lastActivity;       // Timestamp of last activity
        bool isActive;              // Whether profile is active
    }

    // Loan structure
    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 startTime;
        uint256 dueDate;
        uint256 amountRepaid;
        bool isActive;
        bool isDefaulted;
        string purpose;
    }

    // Constants
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant MIN_SCORE = 0;
    uint256 public constant BASE_SCORE = 500;
    uint256 public constant SCORE_DECAY_PERIOD = 30 days;
    uint256 public constant SCORE_DECAY_AMOUNT = 10;

    // State variables
    Counters.Counter private _loanIdCounter;
    mapping(address => CreditProfile) public creditProfiles;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    
    // Credit score factors
    uint256 public onTimePaymentBonus = 20;
    uint256 public latePaymentPenalty = 50;
    uint256 public defaultPenalty = 200;
    uint256 public completionBonus = 30;
    uint256 public activityBonus = 5;

    // Events
    event CreditScoreUpdated(address indexed user, uint256 newScore, string reason);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 interestRate);
    event LoanRepaid(uint256 indexed loanId, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId);
    event CreditProfileCreated(address indexed user);
    event ScoreDecayApplied(address indexed user, uint256 oldScore, uint256 newScore);

    // Modifiers
    modifier onlyValidUser(address user) {
        require(user != address(0), "Invalid user address");
        _;
    }

    modifier onlyActiveProfile(address user) {
        require(creditProfiles[user].isActive, "User profile not active");
        _;
    }

    modifier onlyValidLoan(uint256 loanId) {
        require(loans[loanId].id != 0, "Loan does not exist");
        _;
    }

    constructor() {}

    /**
     * @dev Create or activate a credit profile for a user
     * @param user Address of the user
     */
    function createCreditProfile(address user) external onlyOwner onlyValidUser(user) {
        require(!creditProfiles[user].isActive, "Profile already exists");
        
        creditProfiles[user] = CreditProfile({
            score: BASE_SCORE,
            totalBorrowed: 0,
            totalRepaid: 0,
            activeLoans: 0,
            completedLoans: 0,
            latePayments: 0,
            onTimePayments: 0,
            lastActivity: block.timestamp,
            isActive: true
        });

        emit CreditProfileCreated(user);
        emit CreditScoreUpdated(user, BASE_SCORE, "Profile created");
    }

    /**
     * @dev Get credit score of a user
     * @param user Address to check
     * @return score Current credit score
     */
    function getCreditScore(address user) external view returns (uint256 score) {
        score = creditProfiles[user].score;
    }

    /**
     * @dev Get complete credit profile of a user
     * @param user Address to check
     * @return profile Complete credit profile
     */
    function getCreditProfile(address user) external view returns (CreditProfile memory profile) {
        profile = creditProfiles[user];
    }

    /**
     * @dev Calculate interest rate based on credit score
     * @param user Address to check
     * @return rate Interest rate (in basis points, e.g., 500 = 5%)
     */
    function calculateInterestRate(address user) external view returns (uint256 rate) {
        uint256 score = creditProfiles[user].score;
        
        if (score >= 800) {
            rate = 300; // 3% for excellent credit
        } else if (score >= 700) {
            rate = 500; // 5% for good credit
        } else if (score >= 600) {
            rate = 700; // 7% for fair credit
        } else if (score >= 500) {
            rate = 1000; // 10% for poor credit
        } else {
            rate = 1500; // 15% for very poor credit
        }
    }

    /**
     * @dev Create a new loan
     * @param borrower Address of the borrower
     * @param amount Amount to borrow
     * @param duration Loan duration in seconds
     * @param purpose Purpose of the loan
     * @return loanId ID of the created loan
     */
    function createLoan(
        address borrower,
        uint256 amount,
        uint256 duration,
        string memory purpose
    ) external onlyOwner onlyValidUser(borrower) onlyActiveProfile(borrower) returns (uint256 loanId) {
        require(amount > 0, "Amount must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");

        uint256 interestRate = this.calculateInterestRate(borrower);
        
        _loanIdCounter.increment();
        loanId = _loanIdCounter.current();

        loans[loanId] = Loan({
            id: loanId,
            borrower: borrower,
            amount: amount,
            interestRate: interestRate,
            duration: duration,
            startTime: block.timestamp,
            dueDate: block.timestamp + duration,
            amountRepaid: 0,
            isActive: true,
            isDefaulted: false,
            purpose: purpose
        });

        userLoans[borrower].push(loanId);

        // Update credit profile
        CreditProfile storage profile = creditProfiles[borrower];
        profile.totalBorrowed += amount;
        profile.activeLoans += 1;
        profile.lastActivity = block.timestamp;

        emit LoanCreated(loanId, borrower, amount, interestRate);
    }

    /**
     * @dev Record a loan repayment
     * @param loanId ID of the loan
     * @param amount Amount repaid
     */
    function recordRepayment(uint256 loanId, uint256 amount) external onlyOwner onlyValidLoan(loanId) {
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan is not active");
        require(amount > 0, "Amount must be greater than 0");

        loan.amountRepaid += amount;
        
        CreditProfile storage profile = creditProfiles[loan.borrower];
        profile.totalRepaid += amount;
        profile.lastActivity = block.timestamp;

        // Check if loan is fully repaid
        uint256 totalOwed = loan.amount + (loan.amount * loan.interestRate / 10000);
        if (loan.amountRepaid >= totalOwed) {
            loan.isActive = false;
            profile.activeLoans -= 1;
            profile.completedLoans += 1;
            
            // Apply completion bonus
            _updateScore(loan.borrower, completionBonus, "Loan completed");
        }

        // Check if payment is on time
        if (block.timestamp <= loan.dueDate) {
            profile.onTimePayments += 1;
            _updateScore(loan.borrower, onTimePaymentBonus, "On-time payment");
        } else {
            profile.latePayments += 1;
            _updateScore(loan.borrower, latePaymentPenalty, "Late payment");
        }

        emit LoanRepaid(loanId, amount);
    }

    /**
     * @dev Record a loan default
     * @param loanId ID of the loan
     */
    function recordDefault(uint256 loanId) external onlyOwner onlyValidLoan(loanId) {
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan is not active");

        loan.isActive = false;
        loan.isDefaulted = true;

        CreditProfile storage profile = creditProfiles[loan.borrower];
        profile.activeLoans -= 1;

        // Apply default penalty
        _updateScore(loan.borrower, defaultPenalty, "Loan defaulted");

        emit LoanDefaulted(loanId);
    }

    /**
     * @dev Apply score decay for inactive users
     * @param user Address of the user
     */
    function applyScoreDecay(address user) external onlyOwner onlyValidUser(user) onlyActiveProfile(user) {
        CreditProfile storage profile = creditProfiles[user];
        
        if (block.timestamp - profile.lastActivity > SCORE_DECAY_PERIOD) {
            uint256 oldScore = profile.score;
            uint256 newScore = oldScore > SCORE_DECAY_AMOUNT ? oldScore - SCORE_DECAY_AMOUNT : MIN_SCORE;
            
            profile.score = newScore;
            profile.lastActivity = block.timestamp;

            emit ScoreDecayApplied(user, oldScore, newScore);
            emit CreditScoreUpdated(user, newScore, "Score decay applied");
        }
    }

    /**
     * @dev Update credit score manually (admin only)
     * @param user Address of the user
     * @param newScore New credit score
     * @param reason Reason for the update
     */
    function updateScore(address user, uint256 newScore, string memory reason) external onlyOwner onlyValidUser(user) {
        require(newScore <= MAX_SCORE, "Score exceeds maximum");
        
        creditProfiles[user].score = newScore;
        creditProfiles[user].lastActivity = block.timestamp;

        emit CreditScoreUpdated(user, newScore, reason);
    }

    /**
     * @dev Get user's loan history
     * @param user Address of the user
     * @return loanIds Array of loan IDs
     */
    function getUserLoans(address user) external view returns (uint256[] memory loanIds) {
        loanIds = userLoans[user];
    }

    /**
     * @dev Get loan details
     * @param loanId ID of the loan
     * @return loan Loan details
     */
    function getLoan(uint256 loanId) external view onlyValidLoan(loanId) returns (Loan memory loan) {
        loan = loans[loanId];
    }

    /**
     * @dev Check if user is eligible for a loan
     * @param user Address of the user
     * @param amount Amount requested
     * @return eligible Whether user is eligible
     */
    function isEligibleForLoan(address user, uint256 amount) external view returns (bool eligible) {
        CreditProfile memory profile = creditProfiles[user];
        
        if (!profile.isActive) {
            return false;
        }

        // Check minimum score requirement
        if (profile.score < 400) {
            return false;
        }

        // Check debt-to-income ratio (simplified)
        uint256 maxBorrowing = profile.totalRepaid * 2; // Can borrow up to 2x total repaid
        if (profile.totalBorrowed + amount > maxBorrowing) {
            return false;
        }

        return true;
    }

    /**
     * @dev Internal function to update credit score
     * @param user Address of the user
     * @param amount Amount to add/subtract
     * @param reason Reason for the update
     */
    function _updateScore(address user, uint256 amount, string memory reason) internal {
        CreditProfile storage profile = creditProfiles[user];
        uint256 oldScore = profile.score;
        uint256 newScore;

        if (amount > 0) {
            // Increase score
            newScore = oldScore + amount;
            if (newScore > MAX_SCORE) {
                newScore = MAX_SCORE;
            }
        } else {
            // Decrease score
            uint256 decreaseAmount = uint256(-int256(amount));
            if (decreaseAmount > oldScore) {
                newScore = MIN_SCORE;
            } else {
                newScore = oldScore - decreaseAmount;
            }
        }

        profile.score = newScore;
        emit CreditScoreUpdated(user, newScore, reason);
    }

    /**
     * @dev Update credit score factors (admin only)
     * @param _onTimePaymentBonus Bonus for on-time payments
     * @param _latePaymentPenalty Penalty for late payments
     * @param _defaultPenalty Penalty for defaults
     * @param _completionBonus Bonus for loan completion
     * @param _activityBonus Bonus for activity
     */
    function updateScoreFactors(
        uint256 _onTimePaymentBonus,
        uint256 _latePaymentPenalty,
        uint256 _defaultPenalty,
        uint256 _completionBonus,
        uint256 _activityBonus
    ) external onlyOwner {
        onTimePaymentBonus = _onTimePaymentBonus;
        latePaymentPenalty = _latePaymentPenalty;
        defaultPenalty = _defaultPenalty;
        completionBonus = _completionBonus;
        activityBonus = _activityBonus;
    }

    /**
     * @dev Get total number of loans
     * @return count Total number of loans
     */
    function getTotalLoans() external view returns (uint256 count) {
        count = _loanIdCounter.current();
    }

    /**
     * @dev Get loan statistics
     * @return totalLoans Total number of loans
     * @return activeLoans Number of active loans
     * @return totalBorrowed Total amount borrowed
     * @return totalRepaid Total amount repaid
     */
    function getLoanStatistics() external view returns (
        uint256 totalLoans,
        uint256 activeLoans,
        uint256 totalBorrowed,
        uint256 totalRepaid
    ) {
        totalLoans = _loanIdCounter.current();
        
        for (uint256 i = 1; i <= totalLoans; i++) {
            Loan memory loan = loans[i];
            if (loan.isActive) {
                activeLoans++;
            }
            totalBorrowed += loan.amount;
            totalRepaid += loan.amountRepaid;
        }
    }
}


