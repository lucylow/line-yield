// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./YieldNFT.sol";

/**
 * @title NFTMarketplace
 * @dev Advanced NFT marketplace with auction system and volume optimization
 * @author LINE Yield Team
 */
contract NFTMarketplace is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Listing structure
    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
        uint256 startTime;
        uint256 endTime;
        bool active;
        bool isAuction;
    }

    // Auction structure
    struct Auction {
        address seller;
        uint256 tokenId;
        uint256 startingPrice;
        uint256 reservePrice;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        bool active;
        bool ended;
    }

    // Offer structure
    struct Offer {
        address offerer;
        uint256 tokenId;
        uint256 amount;
        uint256 expirationTime;
        bool active;
    }

    // Marketplace fees
    struct MarketplaceFees {
        uint256 listingFee; // Basis points
        uint256 tradingFee; // Basis points
        uint256 auctionFee; // Basis points
        uint256 offerFee; // Basis points
    }

    // State variables
    YieldNFT public nftContract;
    IERC20 public usdtToken;
    address public treasury;
    address public feeRecipient;

    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Offer[]) public tokenOffers;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public userAuctions;
    mapping(address => uint256[]) public userBids;

    // Fee structure
    MarketplaceFees public fees;

    // Volume tracking
    struct VolumeStats {
        uint256 dailyVolume;
        uint256 weeklyVolume;
        uint256 monthlyVolume;
        uint256 totalVolume;
        uint256 transactionCount;
        uint256 lastUpdate;
    }

    VolumeStats public volumeStats;

    // Events
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price, uint256 endTime);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event AuctionCreated(uint256 indexed tokenId, address indexed seller, uint256 startingPrice, uint256 endTime);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 winningBid);
    event OfferMade(uint256 indexed tokenId, address indexed offerer, uint256 amount, uint256 expirationTime);
    event OfferAccepted(uint256 indexed tokenId, address indexed offerer, address indexed owner, uint256 amount);
    event OfferCancelled(uint256 indexed tokenId, address indexed offerer);
    event VolumeUpdated(uint256 volume, uint256 transactionCount);

    // Modifiers
    modifier onlyNFTOwner(uint256 _tokenId) {
        require(nftContract.ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        _;
    }

    modifier listingExists(uint256 _tokenId) {
        require(listings[_tokenId].active, "Listing does not exist");
        _;
    }

    modifier auctionExists(uint256 _tokenId) {
        require(auctions[_tokenId].active, "Auction does not exist");
        _;
    }

    modifier auctionNotEnded(uint256 _tokenId) {
        require(block.timestamp < auctions[_tokenId].endTime, "Auction ended");
        _;
    }

    constructor(
        address _nftContract,
        address _usdtToken,
        address _treasury,
        address _feeRecipient
    ) {
        nftContract = YieldNFT(_nftContract);
        usdtToken = IERC20(_usdtToken);
        treasury = _treasury;
        feeRecipient = _feeRecipient;

        // Set default fees (in basis points)
        fees = MarketplaceFees({
            listingFee: 25, // 0.25%
            tradingFee: 250, // 2.5%
            auctionFee: 300, // 3%
            offerFee: 100 // 1%
        });

        volumeStats.lastUpdate = block.timestamp;
    }

    /**
     * @dev List NFT for sale
     */
    function listNFT(
        uint256 _tokenId,
        uint256 _price,
        uint256 _duration
    ) external onlyNFTOwner(_tokenId) nonReentrant whenNotPaused {
        require(_price > 0, "Price must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(nftContract.getApproved(_tokenId) == address(this), "Marketplace not approved");

        // Calculate listing fee
        uint256 listingFee = _price.mul(fees.listingFee).div(10000);
        require(usdtToken.balanceOf(msg.sender) >= listingFee, "Insufficient USDT for listing fee");

        // Transfer listing fee
        usdtToken.safeTransferFrom(msg.sender, feeRecipient, listingFee);

        // Create listing
        listings[_tokenId] = Listing({
            seller: msg.sender,
            tokenId: _tokenId,
            price: _price,
            startTime: block.timestamp,
            endTime: block.timestamp.add(_duration),
            active: true,
            isAuction: false
        });

        userListings[msg.sender].push(_tokenId);

        emit NFTListed(_tokenId, msg.sender, _price, block.timestamp.add(_duration));
    }

    /**
     * @dev Buy NFT from listing
     */
    function buyNFT(uint256 _tokenId) external listingExists(_tokenId) nonReentrant whenNotPaused {
        Listing storage listing = listings[_tokenId];
        require(block.timestamp <= listing.endTime, "Listing expired");
        require(msg.sender != listing.seller, "Cannot buy own NFT");

        uint256 totalPrice = listing.price;
        uint256 tradingFee = totalPrice.mul(fees.tradingFee).div(10000);
        uint256 sellerAmount = totalPrice.sub(tradingFee);

        require(usdtToken.balanceOf(msg.sender) >= totalPrice, "Insufficient USDT");

        // Transfer USDT
        usdtToken.safeTransferFrom(msg.sender, listing.seller, sellerAmount);
        usdtToken.safeTransferFrom(msg.sender, feeRecipient, tradingFee);

        // Transfer NFT
        nftContract.safeTransferFrom(listing.seller, msg.sender, _tokenId);

        // Record trade in NFT contract
        nftContract.recordTrade(_tokenId, listing.seller, msg.sender, totalPrice);

        // Update volume
        _updateVolume(totalPrice);

        // Remove listing
        listing.active = false;
        _removeListingFromUser(listing.seller, _tokenId);

        emit NFTSold(_tokenId, listing.seller, msg.sender, totalPrice);
    }

    /**
     * @dev Create auction for NFT
     */
    function createAuction(
        uint256 _tokenId,
        uint256 _startingPrice,
        uint256 _reservePrice,
        uint256 _duration
    ) external onlyNFTOwner(_tokenId) nonReentrant whenNotPaused {
        require(_startingPrice > 0, "Starting price must be greater than 0");
        require(_reservePrice >= _startingPrice, "Reserve price must be >= starting price");
        require(_duration > 0, "Duration must be greater than 0");
        require(nftContract.getApproved(_tokenId) == address(this), "Marketplace not approved");

        // Calculate auction fee
        uint256 auctionFee = _startingPrice.mul(fees.auctionFee).div(10000);
        require(usdtToken.balanceOf(msg.sender) >= auctionFee, "Insufficient USDT for auction fee");

        // Transfer auction fee
        usdtToken.safeTransferFrom(msg.sender, feeRecipient, auctionFee);

        // Create auction
        auctions[_tokenId] = Auction({
            seller: msg.sender,
            tokenId: _tokenId,
            startingPrice: _startingPrice,
            reservePrice: _reservePrice,
            startTime: block.timestamp,
            endTime: block.timestamp.add(_duration),
            highestBidder: address(0),
            highestBid: 0,
            active: true,
            ended: false
        });

        userAuctions[msg.sender].push(_tokenId);

        emit AuctionCreated(_tokenId, msg.sender, _startingPrice, block.timestamp.add(_duration));
    }

    /**
     * @dev Place bid on auction
     */
    function placeBid(uint256 _tokenId) external auctionExists(_tokenId) auctionNotEnded(_tokenId) nonReentrant whenNotPaused {
        Auction storage auction = auctions[_tokenId];
        require(msg.sender != auction.seller, "Cannot bid on own auction");

        uint256 bidAmount = auction.highestBid == 0 ? auction.startingPrice : auction.highestBid.add(auction.highestBid.div(10)); // 10% increment
        require(usdtToken.balanceOf(msg.sender) >= bidAmount, "Insufficient USDT for bid");

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            usdtToken.safeTransfer(auction.highestBidder, auction.highestBid);
            _removeBidFromUser(auction.highestBidder, _tokenId);
        }

        // Transfer new bid
        usdtToken.safeTransferFrom(msg.sender, address(this), bidAmount);

        // Update auction
        auction.highestBidder = msg.sender;
        auction.highestBid = bidAmount;

        userBids[msg.sender].push(_tokenId);

        emit BidPlaced(_tokenId, msg.sender, bidAmount);
    }

    /**
     * @dev End auction
     */
    function endAuction(uint256 _tokenId) external auctionExists(_tokenId) nonReentrant {
        Auction storage auction = auctions[_tokenId];
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.ended, "Auction already ended");

        auction.ended = true;
        auction.active = false;

        if (auction.highestBidder != address(0) && auction.highestBid >= auction.reservePrice) {
            // Auction successful
            uint256 tradingFee = auction.highestBid.mul(fees.tradingFee).div(10000);
            uint256 sellerAmount = auction.highestBid.sub(tradingFee);

            // Transfer USDT to seller
            usdtToken.safeTransfer(auction.seller, sellerAmount);
            usdtToken.safeTransfer(feeRecipient, tradingFee);

            // Transfer NFT to winner
            nftContract.safeTransferFrom(auction.seller, auction.highestBidder, _tokenId);

            // Record trade
            nftContract.recordTrade(_tokenId, auction.seller, auction.highestBidder, auction.highestBid);

            // Update volume
            _updateVolume(auction.highestBid);

            emit AuctionEnded(_tokenId, auction.highestBidder, auction.highestBid);
        } else {
            // Auction failed - refund bidder
            if (auction.highestBidder != address(0)) {
                usdtToken.safeTransfer(auction.highestBidder, auction.highestBid);
            }
        }

        _removeAuctionFromUser(auction.seller, _tokenId);
    }

    /**
     * @dev Make offer on NFT
     */
    function makeOffer(
        uint256 _tokenId,
        uint256 _amount,
        uint256 _duration
    ) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(nftContract.ownerOf(_tokenId) != msg.sender, "Cannot offer on own NFT");

        uint256 offerFee = _amount.mul(fees.offerFee).div(10000);
        require(usdtToken.balanceOf(msg.sender) >= _amount.add(offerFee), "Insufficient USDT");

        // Transfer offer amount and fee
        usdtToken.safeTransferFrom(msg.sender, address(this), _amount);
        usdtToken.safeTransferFrom(msg.sender, feeRecipient, offerFee);

        // Create offer
        tokenOffers[_tokenId].push(Offer({
            offerer: msg.sender,
            tokenId: _tokenId,
            amount: _amount,
            expirationTime: block.timestamp.add(_duration),
            active: true
        }));

        emit OfferMade(_tokenId, msg.sender, _amount, block.timestamp.add(_duration));
    }

    /**
     * @dev Accept offer
     */
    function acceptOffer(uint256 _tokenId, uint256 _offerIndex) external onlyNFTOwner(_tokenId) nonReentrant {
        require(_offerIndex < tokenOffers[_tokenId].length, "Invalid offer index");
        
        Offer storage offer = tokenOffers[_tokenId][_offerIndex];
        require(offer.active, "Offer not active");
        require(block.timestamp <= offer.expirationTime, "Offer expired");

        uint256 tradingFee = offer.amount.mul(fees.tradingFee).div(10000);
        uint256 sellerAmount = offer.amount.sub(tradingFee);

        // Transfer USDT
        usdtToken.safeTransfer(msg.sender, sellerAmount);
        usdtToken.safeTransfer(feeRecipient, tradingFee);

        // Transfer NFT
        nftContract.safeTransferFrom(msg.sender, offer.offerer, _tokenId);

        // Record trade
        nftContract.recordTrade(_tokenId, msg.sender, offer.offerer, offer.amount);

        // Update volume
        _updateVolume(offer.amount);

        // Deactivate offer
        offer.active = false;

        emit OfferAccepted(_tokenId, offer.offerer, msg.sender, offer.amount);
    }

    /**
     * @dev Cancel offer
     */
    function cancelOffer(uint256 _tokenId, uint256 _offerIndex) external nonReentrant {
        require(_offerIndex < tokenOffers[_tokenId].length, "Invalid offer index");
        
        Offer storage offer = tokenOffers[_tokenId][_offerIndex];
        require(offer.offerer == msg.sender, "Not offer owner");
        require(offer.active, "Offer not active");

        // Refund USDT
        usdtToken.safeTransfer(msg.sender, offer.amount);

        // Deactivate offer
        offer.active = false;

        emit OfferCancelled(_tokenId, msg.sender);
    }

    /**
     * @dev Update volume statistics
     */
    function _updateVolume(uint256 _amount) internal {
        VolumeStats storage stats = volumeStats;

        // Reset daily volume if new day
        if (block.timestamp >= stats.lastUpdate + 1 days) {
            stats.dailyVolume = 0;
        }

        // Reset weekly volume if new week
        if (block.timestamp >= stats.lastUpdate + 7 days) {
            stats.weeklyVolume = 0;
        }

        // Reset monthly volume if new month
        if (block.timestamp >= stats.lastUpdate + 30 days) {
            stats.monthlyVolume = 0;
        }

        stats.dailyVolume = stats.dailyVolume.add(_amount);
        stats.weeklyVolume = stats.weeklyVolume.add(_amount);
        stats.monthlyVolume = stats.monthlyVolume.add(_amount);
        stats.totalVolume = stats.totalVolume.add(_amount);
        stats.transactionCount = stats.transactionCount.add(1);
        stats.lastUpdate = block.timestamp;

        emit VolumeUpdated(_amount, stats.transactionCount);
    }

    /**
     * @dev Remove listing from user's listings
     */
    function _removeListingFromUser(address _user, uint256 _tokenId) internal {
        uint256[] storage userListingIds = userListings[_user];
        for (uint256 i = 0; i < userListingIds.length; i++) {
            if (userListingIds[i] == _tokenId) {
                userListingIds[i] = userListingIds[userListingIds.length - 1];
                userListingIds.pop();
                break;
            }
        }
    }

    /**
     * @dev Remove auction from user's auctions
     */
    function _removeAuctionFromUser(address _user, uint256 _tokenId) internal {
        uint256[] storage userAuctionIds = userAuctions[_user];
        for (uint256 i = 0; i < userAuctionIds.length; i++) {
            if (userAuctionIds[i] == _tokenId) {
                userAuctionIds[i] = userAuctionIds[userAuctionIds.length - 1];
                userAuctionIds.pop();
                break;
            }
        }
    }

    /**
     * @dev Remove bid from user's bids
     */
    function _removeBidFromUser(address _user, uint256 _tokenId) internal {
        uint256[] storage userBidIds = userBids[_user];
        for (uint256 i = 0; i < userBidIds.length; i++) {
            if (userBidIds[i] == _tokenId) {
                userBidIds[i] = userBidIds[userBidIds.length - 1];
                userBidIds.pop();
                break;
            }
        }
    }

    /**
     * @dev Get user's listings
     */
    function getUserListings(address _user) external view returns (uint256[] memory) {
        return userListings[_user];
    }

    /**
     * @dev Get user's auctions
     */
    function getUserAuctions(address _user) external view returns (uint256[] memory) {
        return userAuctions[_user];
    }

    /**
     * @dev Get user's bids
     */
    function getUserBids(address _user) external view returns (uint256[] memory) {
        return userBids[_user];
    }

    /**
     * @dev Get token offers
     */
    function getTokenOffers(uint256 _tokenId) external view returns (Offer[] memory) {
        return tokenOffers[_tokenId];
    }

    /**
     * @dev Get volume statistics
     */
    function getVolumeStats() external view returns (
        uint256 dailyVolume,
        uint256 weeklyVolume,
        uint256 monthlyVolume,
        uint256 totalVolume,
        uint256 transactionCount
    ) {
        VolumeStats storage stats = volumeStats;
        return (stats.dailyVolume, stats.weeklyVolume, stats.monthlyVolume, stats.totalVolume, stats.transactionCount);
    }

    /**
     * @dev Set marketplace fees
     */
    function setFees(
        uint256 _listingFee,
        uint256 _tradingFee,
        uint256 _auctionFee,
        uint256 _offerFee
    ) external onlyOwner {
        require(_listingFee <= 1000, "Listing fee too high"); // Max 10%
        require(_tradingFee <= 1000, "Trading fee too high"); // Max 10%
        require(_auctionFee <= 1000, "Auction fee too high"); // Max 10%
        require(_offerFee <= 1000, "Offer fee too high"); // Max 10%

        fees.listingFee = _listingFee;
        fees.tradingFee = _tradingFee;
        fees.auctionFee = _auctionFee;
        fees.offerFee = _offerFee;
    }

    /**
     * @dev Set fee recipient
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Pause marketplace
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause marketplace
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}

