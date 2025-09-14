// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title NFTMarketplace
 * @dev NFT marketplace with in-app item support and LINE payment integration
 */
contract NFTMarketplace is ReentrancyGuard, Ownable, Pausable {
    using Counters for Counters.Counter;

    // Events
    event ItemListed(
        uint256 indexed itemId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        bool isInAppItem,
        uint256 fiatPrice
    );
    
    event ItemSold(
        uint256 indexed itemId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        bool isInAppItem,
        uint256 fiatPrice
    );
    
    event ItemCancelled(uint256 indexed itemId, address indexed seller);
    event PriceUpdated(uint256 indexed itemId, uint256 newPrice, uint256 newFiatPrice);
    
    event InAppItemPurchased(
        address indexed buyer,
        uint256 indexed itemId,
        uint256 fiatAmount,
        string paymentId
    );

    // Structs
    struct MarketplaceItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price; // Price in USDT/stablecoin
        uint256 fiatPrice; // Price in fiat currency (e.g., JPY, USD)
        bool isInAppItem; // True if it's an in-app item, false if it's an NFT
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct InAppItem {
        uint256 itemId;
        string name;
        string description;
        string imageUrl;
        uint256 cryptoPrice; // Price in USDT
        uint256 fiatPrice; // Price in fiat currency
        uint256 maxSupply; // 0 for unlimited
        uint256 currentSupply;
        bool isActive;
        address creator;
    }

    struct PaymentProvider {
        address provider;
        bool isActive;
        uint256 feePercentage; // Fee percentage (e.g., 300 for 3%)
        string name;
    }

    // State variables
    Counters.Counter private _itemIds;
    Counters.Counter private _inAppItemIds;
    
    mapping(uint256 => MarketplaceItem) public items;
    mapping(uint256 => InAppItem) public inAppItems;
    mapping(address => uint256[]) public userItems;
    mapping(address => uint256[]) public userInAppItems;
    
    // Payment providers
    mapping(address => PaymentProvider) public paymentProviders;
    address[] public activePaymentProviders;
    
    // Supported stablecoins
    mapping(address => bool) public supportedStablecoins;
    address[] public stablecoinList;
    
    // Fees
    uint256 public marketplaceFeePercentage = 250; // 2.5%
    address public feeRecipient;
    
    // LINE payment integration
    mapping(string => bool) public usedPaymentIds; // Prevent double spending
    mapping(string => uint256) public paymentToItem; // Map payment ID to item ID

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }

    // Modifiers
    modifier onlyActiveItem(uint256 _itemId) {
        require(items[_itemId].isActive, "Item is not active");
        _;
    }

    modifier onlyItemOwner(uint256 _itemId) {
        require(items[_itemId].seller == msg.sender, "Not the item owner");
        _;
    }

    modifier onlySupportedStablecoin(address _token) {
        require(supportedStablecoins[_token], "Unsupported stablecoin");
        _;
    }

    modifier onlyValidPayment(string memory _paymentId) {
        require(!usedPaymentIds[_paymentId], "Payment ID already used");
        require(bytes(_paymentId).length > 0, "Invalid payment ID");
        _;
    }

    // Admin functions
    function addSupportedStablecoin(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        supportedStablecoins[_token] = true;
        stablecoinList.push(_token);
    }

    function removeSupportedStablecoin(address _token) external onlyOwner {
        supportedStablecoins[_token] = false;
        // Note: We don't remove from stablecoinList to maintain consistency
    }

    function addPaymentProvider(
        address _provider,
        string memory _name,
        uint256 _feePercentage
    ) external onlyOwner {
        require(_provider != address(0), "Invalid provider address");
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        
        paymentProviders[_provider] = PaymentProvider({
            provider: _provider,
            isActive: true,
            feePercentage: _feePercentage,
            name: _name
        });
        
        activePaymentProviders.push(_provider);
    }

    function updatePaymentProvider(
        address _provider,
        bool _isActive,
        uint256 _feePercentage
    ) external onlyOwner {
        require(paymentProviders[_provider].provider != address(0), "Provider not found");
        require(_feePercentage <= 1000, "Fee too high");
        
        paymentProviders[_provider].isActive = _isActive;
        paymentProviders[_provider].feePercentage = _feePercentage;
    }

    function setMarketplaceFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        marketplaceFeePercentage = _feePercentage;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    // NFT listing functions
    function listNFT(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price,
        uint256 _fiatPrice,
        address _stablecoin
    ) external onlySupportedStablecoin(_stablecoin) whenNotPaused {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_price > 0, "Price must be greater than 0");
        require(_fiatPrice > 0, "Fiat price must be greater than 0");
        
        // Check if the caller owns the NFT
        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not the NFT owner");
        require(nft.getApproved(_tokenId) == address(this) || 
                nft.isApprovedForAll(msg.sender, address(this)), "NFT not approved");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        items[itemId] = MarketplaceItem({
            itemId: itemId,
            nftContract: _nftContract,
            tokenId: _tokenId,
            seller: msg.sender,
            price: _price,
            fiatPrice: _fiatPrice,
            isInAppItem: false,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        userItems[msg.sender].push(itemId);

        emit ItemListed(itemId, msg.sender, _nftContract, _tokenId, _price, false, _fiatPrice);
    }

    function buyNFT(
        uint256 _itemId,
        address _stablecoin
    ) external onlyActiveItem(_itemId) onlySupportedStablecoin(_stablecoin) nonReentrant whenNotPaused {
        MarketplaceItem storage item = items[_itemId];
        require(!item.isInAppItem, "This is an in-app item");
        require(item.seller != msg.sender, "Cannot buy your own item");

        // Transfer NFT
        IERC721 nft = IERC721(item.nftContract);
        nft.transferFrom(item.seller, msg.sender, item.tokenId);

        // Transfer payment
        IERC20 stablecoin = IERC20(_stablecoin);
        require(stablecoin.transferFrom(msg.sender, address(this), item.price), "Payment failed");

        // Calculate fees
        uint256 marketplaceFee = (item.price * marketplaceFeePercentage) / 10000;
        uint256 sellerAmount = item.price - marketplaceFee;

        // Transfer fees and payment
        if (marketplaceFee > 0) {
            stablecoin.transfer(feeRecipient, marketplaceFee);
        }
        stablecoin.transfer(item.seller, sellerAmount);

        // Update item status
        item.isActive = false;
        item.updatedAt = block.timestamp;

        emit ItemSold(_itemId, msg.sender, item.seller, item.price, false, item.fiatPrice);
    }

    function cancelListing(uint256 _itemId) external onlyItemOwner(_itemId) {
        MarketplaceItem storage item = items[_itemId];
        require(item.isActive, "Item is not active");
        require(!item.isInAppItem, "Cannot cancel in-app item");

        item.isActive = false;
        item.updatedAt = block.timestamp;

        emit ItemCancelled(_itemId, msg.sender);
    }

    function updatePrice(
        uint256 _itemId,
        uint256 _newPrice,
        uint256 _newFiatPrice
    ) external onlyItemOwner(_itemId) {
        MarketplaceItem storage item = items[_itemId];
        require(item.isActive, "Item is not active");
        require(_newPrice > 0, "Price must be greater than 0");
        require(_newFiatPrice > 0, "Fiat price must be greater than 0");

        item.price = _newPrice;
        item.fiatPrice = _newFiatPrice;
        item.updatedAt = block.timestamp;

        emit PriceUpdated(_itemId, _newPrice, _newFiatPrice);
    }

    // In-app item functions
    function createInAppItem(
        string memory _name,
        string memory _description,
        string memory _imageUrl,
        uint256 _cryptoPrice,
        uint256 _fiatPrice,
        uint256 _maxSupply
    ) external whenNotPaused {
        require(_cryptoPrice > 0, "Crypto price must be greater than 0");
        require(_fiatPrice > 0, "Fiat price must be greater than 0");
        require(bytes(_name).length > 0, "Name cannot be empty");

        _inAppItemIds.increment();
        uint256 itemId = _inAppItemIds.current();

        inAppItems[itemId] = InAppItem({
            itemId: itemId,
            name: _name,
            description: _description,
            imageUrl: _imageUrl,
            cryptoPrice: _cryptoPrice,
            fiatPrice: _fiatPrice,
            maxSupply: _maxSupply,
            currentSupply: 0,
            isActive: true,
            creator: msg.sender
        });

        userInAppItems[msg.sender].push(itemId);
    }

    function purchaseInAppItemWithFiat(
        uint256 _itemId,
        string memory _paymentId,
        address _stablecoin
    ) external onlyValidPayment(_paymentId) onlySupportedStablecoin(_stablecoin) nonReentrant whenNotPaused {
        InAppItem storage item = inAppItems[_itemId];
        require(item.isActive, "Item is not active");
        require(item.maxSupply == 0 || item.currentSupply < item.maxSupply, "Item sold out");

        // Mark payment as used
        usedPaymentIds[_paymentId] = true;
        paymentToItem[_paymentId] = _itemId;

        // Transfer payment
        IERC20 stablecoin = IERC20(_stablecoin);
        require(stablecoin.transferFrom(msg.sender, address(this), item.cryptoPrice), "Payment failed");

        // Calculate fees
        uint256 marketplaceFee = (item.cryptoPrice * marketplaceFeePercentage) / 10000;
        uint256 creatorAmount = item.cryptoPrice - marketplaceFee;

        // Transfer fees and payment
        if (marketplaceFee > 0) {
            stablecoin.transfer(feeRecipient, marketplaceFee);
        }
        stablecoin.transfer(item.creator, creatorAmount);

        // Update supply
        item.currentSupply++;

        emit InAppItemPurchased(msg.sender, _itemId, item.fiatPrice, _paymentId);
    }

    function purchaseInAppItemWithCrypto(
        uint256 _itemId,
        address _stablecoin
    ) external onlySupportedStablecoin(_stablecoin) nonReentrant whenNotPaused {
        InAppItem storage item = inAppItems[_itemId];
        require(item.isActive, "Item is not active");
        require(item.maxSupply == 0 || item.currentSupply < item.maxSupply, "Item sold out");

        // Transfer payment
        IERC20 stablecoin = IERC20(_stablecoin);
        require(stablecoin.transferFrom(msg.sender, address(this), item.cryptoPrice), "Payment failed");

        // Calculate fees
        uint256 marketplaceFee = (item.cryptoPrice * marketplaceFeePercentage) / 10000;
        uint256 creatorAmount = item.cryptoPrice - marketplaceFee;

        // Transfer fees and payment
        if (marketplaceFee > 0) {
            stablecoin.transfer(feeRecipient, marketplaceFee);
        }
        stablecoin.transfer(item.creator, creatorAmount);

        // Update supply
        item.currentSupply++;

        emit InAppItemPurchased(msg.sender, _itemId, item.fiatPrice, "");
    }

    // View functions
    function getItem(uint256 _itemId) external view returns (MarketplaceItem memory) {
        return items[_itemId];
    }

    function getInAppItem(uint256 _itemId) external view returns (InAppItem memory) {
        return inAppItems[_itemId];
    }

    function getUserItems(address _user) external view returns (uint256[] memory) {
        return userItems[_user];
    }

    function getUserInAppItems(address _user) external view returns (uint256[] memory) {
        return userInAppItems[_user];
    }

    function getActivePaymentProviders() external view returns (address[] memory) {
        return activePaymentProviders;
    }

    function getSupportedStablecoins() external view returns (address[] memory) {
        return stablecoinList;
    }

    function getItemCount() external view returns (uint256) {
        return _itemIds.current();
    }

    function getInAppItemCount() external view returns (uint256) {
        return _inAppItemIds.current();
    }

    function isPaymentIdUsed(string memory _paymentId) external view returns (bool) {
        return usedPaymentIds[_paymentId];
    }

    function getPaymentItem(string memory _paymentId) external view returns (uint256) {
        return paymentToItem[_paymentId];
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
}

