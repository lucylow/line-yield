// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LinePaymentProvider
 * @dev LINE payment provider integration for fiat-to-crypto transactions
 */
contract LinePaymentProvider is ReentrancyGuard, Ownable, Pausable {
    
    // Events
    event PaymentInitiated(
        string indexed paymentId,
        address indexed buyer,
        uint256 fiatAmount,
        uint256 cryptoAmount,
        string currency,
        address stablecoin
    );
    
    event PaymentCompleted(
        string indexed paymentId,
        address indexed buyer,
        uint256 fiatAmount,
        uint256 cryptoAmount,
        bool success
    );
    
    event PaymentCancelled(
        string indexed paymentId,
        address indexed buyer,
        string reason
    );
    
    event ExchangeRateUpdated(
        string currency,
        uint256 newRate,
        uint256 timestamp
    );

    // Structs
    struct PaymentRequest {
        string paymentId;
        address buyer;
        uint256 fiatAmount;
        uint256 cryptoAmount;
        string currency;
        address stablecoin;
        PaymentStatus status;
        uint256 createdAt;
        uint256 completedAt;
        string lineTransactionId;
    }

    struct ExchangeRate {
        uint256 rate; // Rate in basis points (e.g., 10000 = 1:1)
        uint256 lastUpdated;
        bool isActive;
    }

    enum PaymentStatus {
        Pending,
        Processing,
        Completed,
        Failed,
        Cancelled
    }

    // State variables
    mapping(string => PaymentRequest) public payments;
    mapping(string => ExchangeRate) public exchangeRates;
    mapping(address => bool) public authorizedCallers;
    mapping(string => bool) public usedPaymentIds;
    
    address public treasury;
    uint256 public processingFeePercentage = 100; // 1%
    uint256 public minPaymentAmount = 100; // Minimum payment in basis points
    uint256 public maxPaymentAmount = 1000000; // Maximum payment in basis points
    
    // LINE payment configuration
    string public lineApiEndpoint;
    string public lineMerchantId;
    string public lineApiKey;

    constructor(
        address _treasury,
        string memory _lineApiEndpoint,
        string memory _lineMerchantId,
        string memory _lineApiKey
    ) {
        treasury = _treasury;
        lineApiEndpoint = _lineApiEndpoint;
        lineMerchantId = _lineMerchantId;
        lineApiKey = _lineApiKey;
        
        // Initialize default exchange rates
        exchangeRates["JPY"] = ExchangeRate({
            rate: 150000, // 1 JPY = 0.0067 USDT (approximate)
            lastUpdated: block.timestamp,
            isActive: true
        });
        
        exchangeRates["USD"] = ExchangeRate({
            rate: 10000, // 1 USD = 1 USDT
            lastUpdated: block.timestamp,
            isActive: true
        });
    }

    // Modifiers
    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier onlyValidPayment(string memory _paymentId) {
        require(!usedPaymentIds[_paymentId], "Payment ID already used");
        require(bytes(_paymentId).length > 0, "Invalid payment ID");
        _;
    }

    // Admin functions
    function setAuthorizedCaller(address _caller, bool _authorized) external onlyOwner {
        authorizedCallers[_caller] = _authorized;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    function setProcessingFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        processingFeePercentage = _feePercentage;
    }

    function setPaymentLimits(uint256 _minAmount, uint256 _maxAmount) external onlyOwner {
        require(_minAmount < _maxAmount, "Invalid limits");
        minPaymentAmount = _minAmount;
        maxPaymentAmount = _maxAmount;
    }

    function updateExchangeRate(
        string memory _currency,
        uint256 _rate
    ) external onlyOwner {
        require(_rate > 0, "Invalid exchange rate");
        exchangeRates[_currency] = ExchangeRate({
            rate: _rate,
            lastUpdated: block.timestamp,
            isActive: true
        });
        
        emit ExchangeRateUpdated(_currency, _rate, block.timestamp);
    }

    function setLineConfig(
        string memory _apiEndpoint,
        string memory _merchantId,
        string memory _apiKey
    ) external onlyOwner {
        lineApiEndpoint = _apiEndpoint;
        lineMerchantId = _merchantId;
        lineApiKey = _apiKey;
    }

    // Payment functions
    function initiatePayment(
        string memory _paymentId,
        address _buyer,
        uint256 _fiatAmount,
        string memory _currency,
        address _stablecoin
    ) external onlyAuthorized onlyValidPayment(_paymentId) whenNotPaused {
        require(_buyer != address(0), "Invalid buyer address");
        require(_fiatAmount >= minPaymentAmount, "Amount too small");
        require(_fiatAmount <= maxPaymentAmount, "Amount too large");
        require(exchangeRates[_currency].isActive, "Currency not supported");
        
        // Calculate crypto amount
        uint256 cryptoAmount = calculateCryptoAmount(_fiatAmount, _currency);
        require(cryptoAmount > 0, "Invalid crypto amount");

        // Mark payment ID as used
        usedPaymentIds[_paymentId] = true;

        // Create payment request
        payments[_paymentId] = PaymentRequest({
            paymentId: _paymentId,
            buyer: _buyer,
            fiatAmount: _fiatAmount,
            cryptoAmount: cryptoAmount,
            currency: _currency,
            stablecoin: _stablecoin,
            status: PaymentStatus.Pending,
            createdAt: block.timestamp,
            completedAt: 0,
            lineTransactionId: ""
        });

        emit PaymentInitiated(_paymentId, _buyer, _fiatAmount, cryptoAmount, _currency, _stablecoin);
    }

    function completePayment(
        string memory _paymentId,
        string memory _lineTransactionId,
        bool _success
    ) external onlyAuthorized {
        PaymentRequest storage payment = payments[_paymentId];
        require(payment.status == PaymentStatus.Pending || payment.status == PaymentStatus.Processing, "Invalid payment status");
        
        if (_success) {
            payment.status = PaymentStatus.Completed;
            payment.completedAt = block.timestamp;
            payment.lineTransactionId = _lineTransactionId;
            
            // Transfer stablecoins to buyer
            IERC20 stablecoin = IERC20(payment.stablecoin);
            require(stablecoin.transfer(payment.buyer, payment.cryptoAmount), "Transfer failed");
            
            emit PaymentCompleted(_paymentId, payment.buyer, payment.fiatAmount, payment.cryptoAmount, true);
        } else {
            payment.status = PaymentStatus.Failed;
            payment.completedAt = block.timestamp;
            payment.lineTransactionId = _lineTransactionId;
            
            emit PaymentCompleted(_paymentId, payment.buyer, payment.fiatAmount, payment.cryptoAmount, false);
        }
    }

    function cancelPayment(
        string memory _paymentId,
        string memory _reason
    ) external onlyAuthorized {
        PaymentRequest storage payment = payments[_paymentId];
        require(payment.status == PaymentStatus.Pending || payment.status == PaymentStatus.Processing, "Cannot cancel completed payment");
        
        payment.status = PaymentStatus.Cancelled;
        payment.completedAt = block.timestamp;
        
        emit PaymentCancelled(_paymentId, payment.buyer, _reason);
    }

    function processPayment(
        string memory _paymentId
    ) external onlyAuthorized {
        PaymentRequest storage payment = payments[_paymentId];
        require(payment.status == PaymentStatus.Pending, "Payment not pending");
        
        payment.status = PaymentStatus.Processing;
        
        // In a real implementation, this would trigger LINE payment processing
        // For now, we'll simulate the process
        _simulateLinePayment(_paymentId);
    }

    // Internal functions
    function _simulateLinePayment(string memory _paymentId) internal {
        PaymentRequest storage payment = payments[_paymentId];
        
        // Simulate LINE payment processing
        // In a real implementation, this would:
        // 1. Call LINE payment API
        // 2. Wait for payment confirmation
        // 3. Update payment status based on result
        
        // For demo purposes, we'll auto-complete after a short delay
        // In production, this would be handled by an off-chain service
        payment.status = PaymentStatus.Completed;
        payment.completedAt = block.timestamp;
        payment.lineTransactionId = string(abi.encodePacked("LINE_", _paymentId));
        
        // Transfer stablecoins to buyer
        IERC20 stablecoin = IERC20(payment.stablecoin);
        require(stablecoin.transfer(payment.buyer, payment.cryptoAmount), "Transfer failed");
        
        emit PaymentCompleted(_paymentId, payment.buyer, payment.fiatAmount, payment.cryptoAmount, true);
    }

    function calculateCryptoAmount(
        uint256 _fiatAmount,
        string memory _currency
    ) public view returns (uint256) {
        ExchangeRate memory rate = exchangeRates[_currency];
        require(rate.isActive, "Currency not supported");
        
        // Calculate crypto amount with processing fee
        uint256 baseAmount = (_fiatAmount * rate.rate) / 10000;
        uint256 processingFee = (baseAmount * processingFeePercentage) / 10000;
        
        return baseAmount - processingFee;
    }

    // View functions
    function getPayment(string memory _paymentId) external view returns (PaymentRequest memory) {
        return payments[_paymentId];
    }

    function getExchangeRate(string memory _currency) external view returns (ExchangeRate memory) {
        return exchangeRates[_currency];
    }

    function isPaymentIdUsed(string memory _paymentId) external view returns (bool) {
        return usedPaymentIds[_paymentId];
    }

    function getSupportedCurrencies() external view returns (string[] memory) {
        // In a real implementation, this would return all supported currencies
        string[] memory currencies = new string[](2);
        currencies[0] = "JPY";
        currencies[1] = "USD";
        return currencies;
    }

    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(owner(), balance), "Transfer failed");
    }

    // Receive function for direct ETH payments (if needed)
    receive() external payable {
        // Handle direct ETH payments if needed
    }
}

