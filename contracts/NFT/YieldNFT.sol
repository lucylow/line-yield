// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title YieldNFT
 * @dev NFT contract for LINE Yield platform with trading volume optimization
 * @author LINE Yield Team
 */
contract YieldNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    // Token ID counter
    Counters.Counter private _tokenIdCounter;

    // NFT Tier structure
    struct NFTTier {
        uint256 tierId;
        string name;
        string symbol;
        uint256 maxSupply;
        uint256 currentSupply;
        uint256 mintPrice; // In USDT (6 decimals)
        uint256 royaltyFee; // Basis points (100 = 1%)
        bool active;
        string baseURI;
    }

    // Token metadata
    struct TokenMetadata {
        uint256 tierId;
        uint256 rarityScore;
        uint256 mintTimestamp;
        uint256 lastTradePrice;
        uint256 tradeCount;
        bool isStaked;
        uint256 stakingRewards;
    }

    // Mapping structures
    mapping(uint256 => NFTTier) public tiers;
    mapping(uint256 => TokenMetadata) public tokenMetadata;
    mapping(address => uint256[]) public userTokens;
    mapping(uint256 => uint256) public tierTokenCount;

    // Trading volume tracking
    struct TradingVolume {
        uint256 dailyVolume;
        uint256 weeklyVolume;
        uint256 monthlyVolume;
        uint256 totalVolume;
        uint256 lastUpdate;
    }

    mapping(uint256 => TradingVolume) public tierTradingVolume;
    TradingVolume public globalTradingVolume;

    // Marketplace integration
    address public marketplace;
    address public usdtToken;
    address public treasury;

    // Events
    event TierCreated(uint256 indexed tierId, string name, uint256 maxSupply, uint256 mintPrice);
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 indexed tierId);
    event NFTTraded(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    event TradingVolumeUpdated(uint256 indexed tierId, uint256 volume);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed recipient, uint256 amount);

    // Modifiers
    modifier onlyMarketplace() {
        require(msg.sender == marketplace, "Only marketplace can call this");
        _;
    }

    modifier validTier(uint256 _tierId) {
        require(tiers[_tierId].active, "Invalid tier");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _usdtToken,
        address _treasury
    ) ERC721(_name, _symbol) {
        usdtToken = _usdtToken;
        treasury = _treasury;
        
        // Initialize global trading volume
        globalTradingVolume.lastUpdate = block.timestamp;
    }

    /**
     * @dev Create a new NFT tier
     */
    function createTier(
        uint256 _tierId,
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        uint256 _mintPrice,
        uint256 _royaltyFee,
        string memory _baseURI
    ) external onlyOwner {
        require(!tiers[_tierId].active, "Tier already exists");
        require(_maxSupply > 0, "Invalid max supply");
        require(_royaltyFee <= 1000, "Royalty fee too high"); // Max 10%

        tiers[_tierId] = NFTTier({
            tierId: _tierId,
            name: _name,
            symbol: _symbol,
            maxSupply: _maxSupply,
            currentSupply: 0,
            mintPrice: _mintPrice,
            royaltyFee: _royaltyFee,
            active: true,
            baseURI: _baseURI
        });

        emit TierCreated(_tierId, _name, _maxSupply, _mintPrice);
    }

    /**
     * @dev Mint NFT for a specific tier
     */
    function mintNFT(
        address _to,
        uint256 _tierId,
        uint256 _rarityScore
    ) external onlyMarketplace validTier(_tierId) nonReentrant returns (uint256) {
        NFTTier storage tier = tiers[_tierId];
        require(tier.currentSupply < tier.maxSupply, "Tier sold out");
        require(_to != address(0), "Invalid recipient");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        // Mint the NFT
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked(tier.baseURI, "/", _tierId.toString(), "/", tokenId.toString())));

        // Set metadata
        tokenMetadata[tokenId] = TokenMetadata({
            tierId: _tierId,
            rarityScore: _rarityScore,
            mintTimestamp: block.timestamp,
            lastTradePrice: tier.mintPrice,
            tradeCount: 0,
            isStaked: false,
            stakingRewards: 0
        });

        // Update tier supply
        tier.currentSupply = tier.currentSupply.add(1);
        tierTokenCount[_tierId] = tierTokenCount[_tierId].add(1);

        // Update user tokens
        userTokens[_to].push(tokenId);

        emit NFTMinted(_to, tokenId, _tierId);
        return tokenId;
    }

    /**
     * @dev Record NFT trade for volume tracking
     */
    function recordTrade(
        uint256 _tokenId,
        address _from,
        address _to,
        uint256 _price
    ) external onlyMarketplace {
        require(_exists(_tokenId), "Token does not exist");
        
        TokenMetadata storage metadata = tokenMetadata[_tokenId];
        uint256 tierId = metadata.tierId;

        // Update token metadata
        metadata.lastTradePrice = _price;
        metadata.tradeCount = metadata.tradeCount.add(1);

        // Update trading volumes
        _updateTradingVolume(tierId, _price);
        _updateGlobalTradingVolume(_price);

        // Update user tokens
        _removeTokenFromUser(_from, _tokenId);
        userTokens[_to].push(_tokenId);

        emit NFTTraded(_tokenId, _from, _to, _price);
    }

    /**
     * @dev Update trading volume for a tier
     */
    function _updateTradingVolume(uint256 _tierId, uint256 _amount) internal {
        TradingVolume storage volume = tierTradingVolume[_tierId];
        
        // Reset daily volume if new day
        if (block.timestamp >= volume.lastUpdate + 1 days) {
            volume.dailyVolume = 0;
        }
        
        // Reset weekly volume if new week
        if (block.timestamp >= volume.lastUpdate + 7 days) {
            volume.weeklyVolume = 0;
        }
        
        // Reset monthly volume if new month
        if (block.timestamp >= volume.lastUpdate + 30 days) {
            volume.monthlyVolume = 0;
        }

        volume.dailyVolume = volume.dailyVolume.add(_amount);
        volume.weeklyVolume = volume.weeklyVolume.add(_amount);
        volume.monthlyVolume = volume.monthlyVolume.add(_amount);
        volume.totalVolume = volume.totalVolume.add(_amount);
        volume.lastUpdate = block.timestamp;

        emit TradingVolumeUpdated(_tierId, _amount);
    }

    /**
     * @dev Update global trading volume
     */
    function _updateGlobalTradingVolume(uint256 _amount) internal {
        TradingVolume storage volume = globalTradingVolume;
        
        // Reset daily volume if new day
        if (block.timestamp >= volume.lastUpdate + 1 days) {
            volume.dailyVolume = 0;
        }
        
        // Reset weekly volume if new week
        if (block.timestamp >= volume.lastUpdate + 7 days) {
            volume.weeklyVolume = 0;
        }
        
        // Reset monthly volume if new month
        if (block.timestamp >= volume.lastUpdate + 30 days) {
            volume.monthlyVolume = 0;
        }

        volume.dailyVolume = volume.dailyVolume.add(_amount);
        volume.weeklyVolume = volume.weeklyVolume.add(_amount);
        volume.monthlyVolume = volume.monthlyVolume.add(_amount);
        volume.totalVolume = volume.totalVolume.add(_amount);
        volume.lastUpdate = block.timestamp;
    }

    /**
     * @dev Remove token from user's token list
     */
    function _removeTokenFromUser(address _user, uint256 _tokenId) internal {
        uint256[] storage tokens = userTokens[_user];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == _tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    /**
     * @dev Get user's tokens
     */
    function getUserTokens(address _user) external view returns (uint256[] memory) {
        return userTokens[_user];
    }

    /**
     * @dev Get tier trading volume
     */
    function getTierTradingVolume(uint256 _tierId) external view returns (
        uint256 dailyVolume,
        uint256 weeklyVolume,
        uint256 monthlyVolume,
        uint256 totalVolume
    ) {
        TradingVolume storage volume = tierTradingVolume[_tierId];
        return (volume.dailyVolume, volume.weeklyVolume, volume.monthlyVolume, volume.totalVolume);
    }

    /**
     * @dev Get global trading volume
     */
    function getGlobalTradingVolume() external view returns (
        uint256 dailyVolume,
        uint256 weeklyVolume,
        uint256 monthlyVolume,
        uint256 totalVolume
    ) {
        TradingVolume storage volume = globalTradingVolume;
        return (volume.dailyVolume, volume.weeklyVolume, volume.monthlyVolume, volume.totalVolume);
    }

    /**
     * @dev Set marketplace address
     */
    function setMarketplace(address _marketplace) external onlyOwner {
        require(_marketplace != address(0), "Invalid marketplace");
        marketplace = _marketplace;
    }

    /**
     * @dev Set treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
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

    // Required overrides
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

