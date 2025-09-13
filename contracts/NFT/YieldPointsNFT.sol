// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title YieldPointsNFT - NFT badges for Yield Points gamification
/// @notice Mint NFTs as user loyalty/reward badges based on Yield Points earned
/// @author LINE Yield Team
contract YieldPointsNFT is ERC721Enumerable, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Token ID counter
    Counters.Counter private _tokenIdCounter;

    // Mapping user address to reward points balance
    mapping(address => uint256) public yieldPoints;

    // Mapping from user address to minted NFT token IDs
    mapping(address => uint256[]) public userNFTs;

    // Mapping from token ID to tier level
    mapping(uint256 => uint256) public tokenTier;

    // Mapping from user address to tier => minted status
    mapping(address => mapping(uint256 => bool)) public hasMintedTier;

    // Thresholds of points needed to mint different NFT badges
    uint256[] public pointsThresholds;

    // Metadata URIs for each badge tier
    string[] public badgeURIs;

    // Tier names for better UX
    string[] public tierNames;

    // Maximum supply per tier
    mapping(uint256 => uint256) public tierMaxSupply;
    mapping(uint256 => uint256) public tierCurrentSupply;

    // Events
    event YieldPointsAwarded(address indexed user, uint256 points, string reason);
    event NFTMinted(address indexed user, uint256 tokenId, uint256 tier, string tokenURI);
    event TierAdded(uint256 tier, uint256 threshold, string name, string uri, uint256 maxSupply);
    event TierUpdated(uint256 tier, uint256 threshold, string name, string uri, uint256 maxSupply);

    // Errors
    error ZeroAddress();
    error ZeroPoints();
    error InvalidTier();
    error TierAlreadyMinted();
    error InsufficientPoints();
    error TierSupplyExceeded();
    error ArrayLengthMismatch();
    error NoNewNFTTierAvailable();

    constructor(
        string memory name_,
        string memory symbol_,
        uint256[] memory thresholds_,
        string[] memory uris_,
        string[] memory names_,
        uint256[] memory maxSupplies_
    ) ERC721(name_, symbol_) {
        require(
            thresholds_.length == uris_.length && 
            uris_.length == names_.length && 
            names_.length == maxSupplies_.length, 
            "Array length mismatch"
        );
        
        pointsThresholds = thresholds_;
        badgeURIs = uris_;
        tierNames = names_;
        
        // Set max supplies for each tier
        for (uint256 i = 0; i < maxSupplies_.length; i++) {
            tierMaxSupply[i] = maxSupplies_[i];
        }
        
        _tokenIdCounter.increment(); // start token IDs from 1
    }

    /// @notice Owner awards Yield Points to user (e.g., on deposit/referral triggers)
    /// @param user Address to award points
    /// @param points Number of points to add
    /// @param reason Reason for awarding points (e.g., "deposit", "referral", "loyalty")
    function awardYieldPoints(address user, uint256 points, string calldata reason) external onlyOwner {
        if (user == address(0)) revert ZeroAddress();
        if (points == 0) revert ZeroPoints();

        yieldPoints[user] += points;
        emit YieldPointsAwarded(user, points, reason);
    }

    /// @notice Batch award points to multiple users
    /// @param users Array of user addresses
    /// @param points Array of points to award
    /// @param reason Reason for awarding points
    function batchAwardYieldPoints(
        address[] calldata users, 
        uint256[] calldata points, 
        string calldata reason
    ) external onlyOwner {
        require(users.length == points.length, "Array length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] != address(0) && points[i] > 0) {
                yieldPoints[users[i]] += points[i];
                emit YieldPointsAwarded(users[i], points[i], reason);
            }
        }
    }

    /// @notice User mints an NFT badge if they reached a points threshold and haven't minted it yet
    function mintNFTReward() external whenNotPaused nonReentrant {
        uint256 userPoints = yieldPoints[msg.sender];
        if (userPoints == 0) revert InsufficientPoints();

        // Find highest tier user qualifies for that they haven't minted yet
        for (uint256 i = pointsThresholds.length; i > 0; i--) {
            uint256 tier = i - 1;
            if (userPoints >= pointsThresholds[tier]) {
                // Check if user already has this tier NFT
                if (!hasMintedTier[msg.sender][tier]) {
                    _mintBadge(msg.sender, tier);
                    return;
                }
            }
        }

        revert NoNewNFTTierAvailable();
    }

    /// @notice Mint specific tier NFT (admin function for special cases)
    /// @param user Address to mint NFT for
    /// @param tier Tier level to mint
    function mintSpecificTier(address user, uint256 tier) external onlyOwner {
        if (tier >= pointsThresholds.length) revert InvalidTier();
        if (hasMintedTier[user][tier]) revert TierAlreadyMinted();
        
        _mintBadge(user, tier);
    }

    /// @dev Helper to mint badge NFT
    function _mintBadge(address to, uint256 tier) internal {
        // Check tier supply limit
        if (tierCurrentSupply[tier] >= tierMaxSupply[tier]) {
            revert TierSupplyExceeded();
        }

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, badgeURIs[tier]);
        
        tokenTier[tokenId] = tier;
        userNFTs[to].push(tokenId);
        hasMintedTier[to][tier] = true;
        tierCurrentSupply[tier]++;

        emit NFTMinted(to, tokenId, tier, badgeURIs[tier]);
    }

    /// @notice View all token IDs owned by a user
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        return userNFTs[owner];
    }

    /// @notice Get user's NFT collection with tier information
    function getUserNFTCollection(address user) external view returns (
        uint256[] memory tokenIds,
        uint256[] memory tiers,
        string[] memory uris,
        string[] memory names
    ) {
        uint256[] memory userTokens = userNFTs[user];
        uint256 length = userTokens.length;
        
        tokenIds = new uint256[](length);
        tiers = new uint256[](length);
        uris = new string[](length);
        names = new string[](length);
        
        for (uint256 i = 0; i < length; i++) {
            uint256 tokenId = userTokens[i];
            uint256 tier = tokenTier[tokenId];
            
            tokenIds[i] = tokenId;
            tiers[i] = tier;
            uris[i] = badgeURIs[tier];
            names[i] = tierNames[tier];
        }
    }

    /// @notice Get user's current tier based on points
    function getUserCurrentTier(address user) external view returns (uint256 tier, string memory name) {
        uint256 userPoints = yieldPoints[user];
        
        for (uint256 i = pointsThresholds.length; i > 0; i--) {
            uint256 currentTier = i - 1;
            if (userPoints >= pointsThresholds[currentTier]) {
                return (currentTier, tierNames[currentTier]);
            }
        }
        
        return (0, tierNames[0]); // Default to first tier
    }

    /// @notice Get next tier requirements for user
    function getNextTierRequirements(address user) external view returns (
        uint256 nextTier,
        uint256 pointsNeeded,
        string memory tierName,
        string memory tierURI
    ) {
        uint256 userPoints = yieldPoints[user];
        
        for (uint256 i = 0; i < pointsThresholds.length; i++) {
            if (userPoints < pointsThresholds[i]) {
                return (i, pointsThresholds[i] - userPoints, tierNames[i], badgeURIs[i]);
            }
        }
        
        // User has reached max tier
        uint256 maxTier = pointsThresholds.length - 1;
        return (maxTier, 0, tierNames[maxTier], badgeURIs[maxTier]);
    }

    /// @notice Add new tier (owner only)
    function addTier(
        uint256 threshold,
        string calldata uri,
        string calldata name,
        uint256 maxSupply
    ) external onlyOwner {
        pointsThresholds.push(threshold);
        badgeURIs.push(uri);
        tierNames.push(name);
        tierMaxSupply[pointsThresholds.length - 1] = maxSupply;
        
        emit TierAdded(pointsThresholds.length - 1, threshold, name, uri, maxSupply);
    }

    /// @notice Update existing tier (owner only)
    function updateTier(
        uint256 tier,
        uint256 threshold,
        string calldata uri,
        string calldata name,
        uint256 maxSupply
    ) external onlyOwner {
        if (tier >= pointsThresholds.length) revert InvalidTier();
        
        pointsThresholds[tier] = threshold;
        badgeURIs[tier] = uri;
        tierNames[tier] = name;
        tierMaxSupply[tier] = maxSupply;
        
        emit TierUpdated(tier, threshold, name, uri, maxSupply);
    }

    /// @notice Get tier information
    function getTierInfo(uint256 tier) external view returns (
        uint256 threshold,
        string memory name,
        string memory uri,
        uint256 maxSupply,
        uint256 currentSupply
    ) {
        if (tier >= pointsThresholds.length) revert InvalidTier();
        
        return (
            pointsThresholds[tier],
            tierNames[tier],
            badgeURIs[tier],
            tierMaxSupply[tier],
            tierCurrentSupply[tier]
        );
    }

    /// @notice Get all tiers information
    function getAllTiers() external view returns (
        uint256[] memory thresholds,
        string[] memory names,
        string[] memory uris,
        uint256[] memory maxSupplies,
        uint256[] memory currentSupplies
    ) {
        uint256 length = pointsThresholds.length;
        
        thresholds = new uint256[](length);
        names = new string[](length);
        uris = new string[](length);
        maxSupplies = new uint256[](length);
        currentSupplies = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            thresholds[i] = pointsThresholds[i];
            names[i] = tierNames[i];
            uris[i] = badgeURIs[i];
            maxSupplies[i] = tierMaxSupply[i];
            currentSupplies[i] = tierCurrentSupply[i];
        }
    }

    /// @notice Pause contract (emergency only)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause contract
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Override tokenURI to return badge URI
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /// @notice Override _beforeTokenTransfer to add pausable functionality
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /// @notice Override _burn to handle URI storage
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @notice Override supportsInterface
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}


