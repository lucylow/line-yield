// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PaymentProcessor
 * @dev Handles payment processing integration with LINE NEXT and 3rd party processors
 * @author LINE Yield Team
 */
contract PaymentProcessor is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Payment request structure
    struct PaymentRequest {
        uint256 requestId;
        address user;
        uint256 amount;
        string currency;
        string paymentMethod;
        string description;
        uint256 timestamp;
        PaymentStatus status;
        string lineNextTransactionId;
        string processorTransactionId;
        uint256 fees;
        string metadata;
    }

    // Payment status enum
    enum PaymentStatus {
        Pending,
        Approved,
        Processing,
        Completed,
        Failed,
        Cancelled,
        Refunded
    }

    // Settlement request structure
    struct SettlementRequest {
        uint256 settlementId;
        uint256 paymentRequestId;
        address user;
        uint256 usdtAmount;
        uint256 timestamp;
        SettlementStatus status;
        string otcTransactionId;
        string settlementHash;
    }

    // Settlement status enum
    enum SettlementStatus {
        Pending,
        Processing,
        Completed,
        Failed
    }

    // State variables
    mapping(uint256 => PaymentRequest) public paymentRequests;
    mapping(uint256 => SettlementRequest) public settlementRequests;
    mapping(address => uint256[]) public userPaymentRequests;
    mapping(address => uint256[]) public userSettlementRequests;
    
    uint256 public paymentRequestCounter;
    uint256 public settlementRequestCounter;
    
    // Fee configuration
    struct FeeConfig {
        uint256 lineNextFee;        // Basis points (50 = 0.5%)
        uint256 processorFee;       // Basis points (250 = 2.5%)
        uint256 platformFee;        // Basis points (30 = 0.3%)
        uint256 settlementFee;      // Basis points (10 = 0.1%)
    }
    
    FeeConfig public feeConfig;
    
    // Authorized addresses
    mapping(address => bool) public authorizedCallers;
    mapping(address => bool) public otcPartners;
    
    // USDT token address
    IERC20 public usdtToken;
    
    // Events
    event PaymentRequestCreated(uint256 indexed requestId, address indexed user, uint256 amount, string currency);
    event PaymentApproved(uint256 indexed requestId, string lineNextTransactionId);
    event PaymentProcessing(uint256 indexed requestId, string processorTransactionId);
    event PaymentCompleted(uint256 indexed requestId, uint256 fees);
    event PaymentFailed(uint256 indexed requestId, string reason);
    event SettlementRequestCreated(uint256 indexed settlementId, uint256 indexed paymentRequestId, address indexed user);
    event SettlementCompleted(uint256 indexed settlementId, uint256 usdtAmount);
    event FeeConfigUpdated(uint256 lineNextFee, uint256 processorFee, uint256 platformFee, uint256 settlementFee);
    event AuthorizedCallerUpdated(address indexed caller, bool authorized);
    event OTCPartnerUpdated(address indexed partner, bool authorized);
    
    // Modifiers
    modifier onlyAuthorizedCaller() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized caller");
        _;
    }
    
    modifier onlyOTCPartner() {
        require(otcPartners[msg.sender] || msg.sender == owner(), "Not authorized OTC partner");
        _;
    }
    
    constructor(address _usdtToken) {
        usdtToken = IERC20(_usdtToken);
        
        // Initialize fee configuration
        feeConfig = FeeConfig({
            lineNextFee: 50,        // 0.5%
            processorFee: 250,      // 2.5%
            platformFee: 30,       // 0.3%
            settlementFee: 10       // 0.1%
        });
    }
    
    /**
     * @dev Create a new payment request
     * @param user User address
     * @param amount Payment amount
     * @param currency Payment currency
     * @param paymentMethod Payment method
     * @param description Payment description
     * @param metadata Additional metadata
     * @return requestId Payment request ID
     */
    function createPaymentRequest(
        address user,
        uint256 amount,
        string memory currency,
        string memory paymentMethod,
        string memory description,
        string memory metadata
    ) external onlyAuthorizedCaller nonReentrant whenNotPaused returns (uint256) {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        
        paymentRequestCounter = paymentRequestCounter.add(1);
        uint256 requestId = paymentRequestCounter;
        
        // Calculate fees
        uint256 totalFees = _calculateFees(amount);
        
        PaymentRequest memory newRequest = PaymentRequest({
            requestId: requestId,
            user: user,
            amount: amount,
            currency: currency,
            paymentMethod: paymentMethod,
            description: description,
            timestamp: block.timestamp,
            status: PaymentStatus.Pending,
            lineNextTransactionId: "",
            processorTransactionId: "",
            fees: totalFees,
            metadata: metadata
        });
        
        paymentRequests[requestId] = newRequest;
        userPaymentRequests[user].push(requestId);
        
        emit PaymentRequestCreated(requestId, user, amount, currency);
        return requestId;
    }
    
    /**
     * @dev Approve payment request (called by LINE NEXT)
     * @param requestId Payment request ID
     * @param lineNextTransactionId LINE NEXT transaction ID
     */
    function approvePayment(uint256 requestId, string memory lineNextTransactionId) external onlyAuthorizedCaller {
        require(paymentRequests[requestId].requestId != 0, "Payment request not found");
        require(paymentRequests[requestId].status == PaymentStatus.Pending, "Payment not pending");
        
        paymentRequests[requestId].status = PaymentStatus.Approved;
        paymentRequests[requestId].lineNextTransactionId = lineNextTransactionId;
        
        emit PaymentApproved(requestId, lineNextTransactionId);
    }
    
    /**
     * @dev Process payment (called by 3rd party processor)
     * @param requestId Payment request ID
     * @param processorTransactionId Processor transaction ID
     */
    function processPayment(uint256 requestId, string memory processorTransactionId) external onlyAuthorizedCaller {
        require(paymentRequests[requestId].requestId != 0, "Payment request not found");
        require(paymentRequests[requestId].status == PaymentStatus.Approved, "Payment not approved");
        
        paymentRequests[requestId].status = PaymentStatus.Processing;
        paymentRequests[requestId].processorTransactionId = processorTransactionId;
        
        emit PaymentProcessing(requestId, processorTransactionId);
    }
    
    /**
     * @dev Complete payment processing
     * @param requestId Payment request ID
     */
    function completePayment(uint256 requestId) external onlyAuthorizedCaller {
        require(paymentRequests[requestId].requestId != 0, "Payment request not found");
        require(paymentRequests[requestId].status == PaymentStatus.Processing, "Payment not processing");
        
        paymentRequests[requestId].status = PaymentStatus.Completed;
        
        // Create settlement request
        _createSettlementRequest(requestId);
        
        emit PaymentCompleted(requestId, paymentRequests[requestId].fees);
    }
    
    /**
     * @dev Mark payment as failed
     * @param requestId Payment request ID
     * @param reason Failure reason
     */
    function failPayment(uint256 requestId, string memory reason) external onlyAuthorizedCaller {
        require(paymentRequests[requestId].requestId != 0, "Payment request not found");
        require(paymentRequests[requestId].status != PaymentStatus.Completed, "Payment already completed");
        
        paymentRequests[requestId].status = PaymentStatus.Failed;
        
        emit PaymentFailed(requestId, reason);
    }
    
    /**
     * @dev Create settlement request
     * @param paymentRequestId Payment request ID
     */
    function _createSettlementRequest(uint256 paymentRequestId) internal {
        PaymentRequest memory payment = paymentRequests[paymentRequestId];
        
        settlementRequestCounter = settlementRequestCounter.add(1);
        uint256 settlementId = settlementRequestCounter;
        
        // Calculate USDT amount (assuming 1:1 conversion for now)
        uint256 usdtAmount = payment.amount.sub(payment.fees);
        
        SettlementRequest memory newSettlement = SettlementRequest({
            settlementId: settlementId,
            paymentRequestId: paymentRequestId,
            user: payment.user,
            usdtAmount: usdtAmount,
            timestamp: block.timestamp,
            status: SettlementStatus.Pending,
            otcTransactionId: "",
            settlementHash: ""
        });
        
        settlementRequests[settlementId] = newSettlement;
        userSettlementRequests[payment.user].push(settlementId);
        
        emit SettlementRequestCreated(settlementId, paymentRequestId, payment.user);
    }
    
    /**
     * @dev Process settlement (called by OTC partner)
     * @param settlementId Settlement request ID
     * @param otcTransactionId OTC transaction ID
     */
    function processSettlement(uint256 settlementId, string memory otcTransactionId) external onlyOTCPartner {
        require(settlementRequests[settlementId].settlementId != 0, "Settlement request not found");
        require(settlementRequests[settlementId].status == SettlementStatus.Pending, "Settlement not pending");
        
        settlementRequests[settlementId].status = SettlementStatus.Processing;
        settlementRequests[settlementId].otcTransactionId = otcTransactionId;
    }
    
    /**
     * @dev Complete settlement
     * @param settlementId Settlement request ID
     * @param settlementHash Settlement hash
     */
    function completeSettlement(uint256 settlementId, string memory settlementHash) external onlyOTCPartner {
        require(settlementRequests[settlementId].settlementId != 0, "Settlement request not found");
        require(settlementRequests[settlementId].status == SettlementStatus.Processing, "Settlement not processing");
        
        SettlementRequest storage settlement = settlementRequests[settlementId];
        settlement.status = SettlementStatus.Completed;
        settlement.settlementHash = settlementHash;
        
        // Transfer USDT to user
        usdtToken.safeTransfer(settlement.user, settlement.usdtAmount);
        
        emit SettlementCompleted(settlementId, settlement.usdtAmount);
    }
    
    /**
     * @dev Calculate total fees for payment
     * @param amount Payment amount
     * @return Total fees
     */
    function _calculateFees(uint256 amount) internal view returns (uint256) {
        uint256 lineNextFee = amount.mul(feeConfig.lineNextFee).div(10000);
        uint256 processorFee = amount.mul(feeConfig.processorFee).div(10000);
        uint256 platformFee = amount.mul(feeConfig.platformFee).div(10000);
        
        return lineNextFee.add(processorFee).add(platformFee);
    }
    
    /**
     * @dev Get payment request details
     * @param requestId Payment request ID
     * @return PaymentRequest struct
     */
    function getPaymentRequest(uint256 requestId) external view returns (PaymentRequest memory) {
        return paymentRequests[requestId];
    }
    
    /**
     * @dev Get settlement request details
     * @param settlementId Settlement request ID
     * @return SettlementRequest struct
     */
    function getSettlementRequest(uint256 settlementId) external view returns (SettlementRequest memory) {
        return settlementRequests[settlementId];
    }
    
    /**
     * @dev Get user's payment requests
     * @param user User address
     * @return Array of payment request IDs
     */
    function getUserPaymentRequests(address user) external view returns (uint256[] memory) {
        return userPaymentRequests[user];
    }
    
    /**
     * @dev Get user's settlement requests
     * @param user User address
     * @return Array of settlement request IDs
     */
    function getUserSettlementRequests(address user) external view returns (uint256[] memory) {
        return userSettlementRequests[user];
    }
    
    /**
     * @dev Update fee configuration
     * @param lineNextFee LINE NEXT fee in basis points
     * @param processorFee Processor fee in basis points
     * @param platformFee Platform fee in basis points
     * @param settlementFee Settlement fee in basis points
     */
    function updateFeeConfig(
        uint256 lineNextFee,
        uint256 processorFee,
        uint256 platformFee,
        uint256 settlementFee
    ) external onlyOwner {
        feeConfig = FeeConfig({
            lineNextFee: lineNextFee,
            processorFee: processorFee,
            platformFee: platformFee,
            settlementFee: settlementFee
        });
        
        emit FeeConfigUpdated(lineNextFee, processorFee, platformFee, settlementFee);
    }
    
    /**
     * @dev Add or remove authorized caller
     * @param caller Caller address
     * @param authorized Authorization status
     */
    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
        emit AuthorizedCallerUpdated(caller, authorized);
    }
    
    /**
     * @dev Add or remove OTC partner
     * @param partner Partner address
     * @param authorized Authorization status
     */
    function setOTCPartner(address partner, bool authorized) external onlyOwner {
        otcPartners[partner] = authorized;
        emit OTCPartnerUpdated(partner, authorized);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw USDT
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        usdtToken.safeTransfer(owner(), amount);
    }
}

