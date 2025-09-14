// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title KaiaPaymentProcessor
 * @dev Handles KAIA-based payments with comprehensive fee structure
 * Deployed by LINE NEXT for buyer-seller transactions
 */
contract KaiaPaymentProcessor is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Payment structure
    struct Payment {
        uint256 paymentId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 platformFee;
        uint256 loyaltyFee;
        uint256 sellerPayout;
        address tokenAddress; // KAIA token address
        string productId;
        string description;
        PaymentStatus status;
        uint256 createdAt;
        uint256 completedAt;
        bytes32 orderHash;
    }

    // Fee structure
    struct FeeStructure {
        uint256 platformFeePercent; // Basis points (e.g., 250 = 2.5%)
        uint256 loyaltyFeePercent;   // Basis points (e.g., 100 = 1.0%)
        uint256 gasFeePercent;       // Basis points for gas fee delegation
        address platformWallet;      // LINE NEXT platform wallet
        address loyaltyWallet;       // Loyalty program wallet
    }

    // Events
    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        string productId
    );
    
    event PaymentCompleted(
        uint256 indexed paymentId,
        uint256 platformFee,
        uint256 loyaltyFee,
        uint256 sellerPayout,
        bytes32 indexed orderHash
    );
    
    event PaymentCancelled(uint256 indexed paymentId, string reason);
    event PaymentRefunded(uint256 indexed paymentId, uint256 refundAmount);
    
    event FeeStructureUpdated(
        uint256 platformFeePercent,
        uint256 loyaltyFeePercent,
        uint256 gasFeePercent
    );
    
    event WalletUpdated(string walletType, address indexed oldWallet, address indexed newWallet);

    // State variables
    mapping(uint256 => Payment) public payments;
    mapping(address => uint256[]) public userPayments;
    mapping(bytes32 => bool) public usedOrderHashes;
    
    FeeStructure public feeStructure;
    IERC20 public kaiaToken;
    
    uint256 public nextPaymentId = 1;
    uint256 public totalVolumeProcessed;
    uint256 public totalFeesCollected;
    
    // Constants
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000 basis points
    uint256 public constant MAX_FEE_PERCENT = 1000; // Max 10% fee
    uint256 public constant MIN_PAYMENT_AMOUNT = 1e15; // 0.001 KAIA minimum

    constructor(
        address _kaiaToken,
        address _platformWallet,
        address _loyaltyWallet
    ) {
        kaiaToken = IERC20(_kaiaToken);
        
        feeStructure = FeeStructure({
            platformFeePercent: 250,  // 2.5%
            loyaltyFeePercent: 100,    // 1.0%
            gasFeePercent: 50,         // 0.5%
            platformWallet: _platformWallet,
            loyaltyWallet: _loyaltyWallet
        });
    }

    /**
     * @dev Create a new payment
     */
    function createPayment(
        address seller,
        uint256 amount,
        string calldata productId,
        string calldata description,
        bytes32 orderHash,
        bytes calldata signature
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(amount >= MIN_PAYMENT_AMOUNT, "Amount too low");
        require(seller != address(0), "Invalid seller");
        require(seller != msg.sender, "Cannot sell to self");
        require(!usedOrderHashes[orderHash], "Order hash already used");
        require(_verifyOrderSignature(seller, amount, productId, orderHash, signature), "Invalid signature");

        // Calculate fees
        (uint256 platformFee, uint256 loyaltyFee, uint256 sellerPayout) = _calculateFees(amount);
        
        // Check buyer has sufficient balance
        require(kaiaToken.balanceOf(msg.sender) >= amount, "Insufficient KAIA balance");
        
        // Transfer KAIA from buyer to contract
        kaiaToken.safeTransferFrom(msg.sender, address(this), amount);

        // Create payment record
        uint256 paymentId = nextPaymentId++;
        Payment storage payment = payments[paymentId];
        payment.paymentId = paymentId;
        payment.buyer = msg.sender;
        payment.seller = seller;
        payment.amount = amount;
        payment.platformFee = platformFee;
        payment.loyaltyFee = loyaltyFee;
        payment.sellerPayout = sellerPayout;
        payment.tokenAddress = address(kaiaToken);
        payment.productId = productId;
        payment.description = description;
        payment.status = PaymentStatus.PENDING;
        payment.createdAt = block.timestamp;
        payment.orderHash = orderHash;

        // Track user payments
        userPayments[msg.sender].push(paymentId);
        userPayments[seller].push(paymentId);
        
        // Mark order hash as used
        usedOrderHashes[orderHash] = true;
        
        // Update totals
        totalVolumeProcessed += amount;

        emit PaymentCreated(paymentId, msg.sender, seller, amount, productId);
        return paymentId;
    }

    /**
     * @dev Complete payment and distribute funds
     */
    function completePayment(uint256 paymentId) external whenNotPaused nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.PENDING, "Payment not pending");
        require(payment.seller == msg.sender, "Only seller can complete");
        require(payment.amount > 0, "Invalid payment");

        // Update payment status
        payment.status = PaymentStatus.COMPLETED;
        payment.completedAt = block.timestamp;

        // Distribute funds
        if (payment.platformFee > 0) {
            kaiaToken.safeTransfer(feeStructure.platformWallet, payment.platformFee);
        }
        
        if (payment.loyaltyFee > 0) {
            kaiaToken.safeTransfer(feeStructure.loyaltyWallet, payment.loyaltyFee);
        }
        
        if (payment.sellerPayout > 0) {
            kaiaToken.safeTransfer(payment.seller, payment.sellerPayout);
        }

        // Update total fees collected
        totalFeesCollected += (payment.platformFee + payment.loyaltyFee);

        emit PaymentCompleted(
            paymentId,
            payment.platformFee,
            payment.loyaltyFee,
            payment.sellerPayout,
            payment.orderHash
        );
    }

    /**
     * @dev Cancel payment and refund buyer
     */
    function cancelPayment(uint256 paymentId, string calldata reason) external whenNotPaused nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.PENDING, "Payment not pending");
        require(payment.buyer == msg.sender || payment.seller == msg.sender, "Not authorized");
        require(payment.amount > 0, "Invalid payment");

        // Update payment status
        payment.status = PaymentStatus.CANCELLED;

        // Refund buyer
        kaiaToken.safeTransfer(payment.buyer, payment.amount);

        emit PaymentCancelled(paymentId, reason);
    }

    /**
     * @dev Process refund (admin only)
     */
    function processRefund(uint256 paymentId, uint256 refundAmount) external onlyOwner nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.COMPLETED, "Payment not completed");
        require(refundAmount <= payment.amount, "Refund amount exceeds payment");
        require(refundAmount > 0, "Invalid refund amount");

        // Update payment status
        payment.status = PaymentStatus.REFUNDED;

        // Transfer refund to buyer
        kaiaToken.safeTransfer(payment.buyer, refundAmount);

        emit PaymentRefunded(paymentId, refundAmount);
    }

    /**
     * @dev Update fee structure (admin only)
     */
    function updateFeeStructure(
        uint256 _platformFeePercent,
        uint256 _loyaltyFeePercent,
        uint256 _gasFeePercent
    ) external onlyOwner {
        require(_platformFeePercent <= MAX_FEE_PERCENT, "Platform fee too high");
        require(_loyaltyFeePercent <= MAX_FEE_PERCENT, "Loyalty fee too high");
        require(_gasFeePercent <= MAX_FEE_PERCENT, "Gas fee too high");

        feeStructure.platformFeePercent = _platformFeePercent;
        feeStructure.loyaltyFeePercent = _loyaltyFeePercent;
        feeStructure.gasFeePercent = _gasFeePercent;

        emit FeeStructureUpdated(_platformFeePercent, _loyaltyFeePercent, _gasFeePercent);
    }

    /**
     * @dev Update platform wallet (admin only)
     */
    function updatePlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid wallet address");
        address oldWallet = feeStructure.platformWallet;
        feeStructure.platformWallet = _newWallet;
        emit WalletUpdated("platform", oldWallet, _newWallet);
    }

    /**
     * @dev Update loyalty wallet (admin only)
     */
    function updateLoyaltyWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid wallet address");
        address oldWallet = feeStructure.loyaltyWallet;
        feeStructure.loyaltyWallet = _newWallet;
        emit WalletUpdated("loyalty", oldWallet, _newWallet);
    }

    /**
     * @dev Emergency withdraw (admin only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @dev Pause contract (admin only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (admin only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get payment details
     */
    function getPayment(uint256 paymentId) external view returns (Payment memory) {
        return payments[paymentId];
    }

    /**
     * @dev Get user's payment history
     */
    function getUserPayments(address user) external view returns (uint256[] memory) {
        return userPayments[user];
    }

    /**
     * @dev Get payment statistics
     */
    function getPaymentStats() external view returns (
        uint256 _totalVolumeProcessed,
        uint256 _totalFeesCollected,
        uint256 _totalPayments,
        uint256 _platformFeePercent,
        uint256 _loyaltyFeePercent,
        uint256 _gasFeePercent
    ) {
        return (
            totalVolumeProcessed,
            totalFeesCollected,
            nextPaymentId - 1,
            feeStructure.platformFeePercent,
            feeStructure.loyaltyFeePercent,
            feeStructure.gasFeePercent
        );
    }

    /**
     * @dev Calculate fees for a given amount
     */
    function calculateFees(uint256 amount) external view returns (
        uint256 platformFee,
        uint256 loyaltyFee,
        uint256 sellerPayout
    ) {
        return _calculateFees(amount);
    }

    /**
     * @dev Internal function to calculate fees
     */
    function _calculateFees(uint256 amount) internal view returns (
        uint256 platformFee,
        uint256 loyaltyFee,
        uint256 sellerPayout
    ) {
        platformFee = (amount * feeStructure.platformFeePercent) / BASIS_POINTS;
        loyaltyFee = (amount * feeStructure.loyaltyFeePercent) / BASIS_POINTS;
        sellerPayout = amount - platformFee - loyaltyFee;
    }

    /**
     * @dev Verify order signature
     */
    function _verifyOrderSignature(
        address seller,
        uint256 amount,
        string calldata productId,
        bytes32 orderHash,
        bytes calldata signature
    ) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(
            seller,
            amount,
            productId,
            orderHash,
            address(this)
        ));
        
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        
        return recoveredSigner == seller;
    }
}

// Payment status enum
enum PaymentStatus {
    PENDING,
    COMPLETED,
    CANCELLED,
    REFUNDED
}

