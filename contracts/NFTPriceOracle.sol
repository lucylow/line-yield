// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/INFTPriceOracle.sol";

/// @title NFT Price Oracle Implementation
/// @notice Centralized price oracle for NFT valuations
/// @dev In production, integrate with Chainlink or other decentralized oracles
contract NFTPriceOracle is INFTPriceOracle, AccessControl, Pausable {
    // Role definitions
    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Price data structures
    struct NFTPrice {
        uint256 price;          // Price in stablecoin (6 decimals)
        uint256 timestamp;      // Last update timestamp
        bool valid;            // Price validity flag
    }
    
    struct CollectionData {
        uint256 floorPrice;     // Floor price in stablecoin (6 decimals)
        uint256 lastUpdate;    // Last floor price update
        bool active;          // Collection active status
    }
    
    // Storage
    mapping(address => mapping(uint256 => NFTPrice)) public nftPrices; // nftContract => tokenId => price
    mapping(address => CollectionData) public collections; // nftContract => collection data
    
    // Configuration
    uint256 public constant PRICE_DECIMALS = 6; // Stablecoin decimals
    uint256 public maxPriceAge = 24 hours; // Maximum price age before considered stale
    uint256 public defaultFloorPrice = 100 * 10**PRICE_DECIMALS; // Default floor price (100 USDT)
    
    // Events
    event NFTPriceUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 price, uint256 timestamp);
    event FloorPriceUpdated(address indexed nftContract, uint256 floorPrice, uint256 timestamp);
    event CollectionAdded(address indexed nftContract, uint256 floorPrice);
    event MaxPriceAgeUpdated(uint256 newMaxAge);
    
    // Errors
    error PriceNotAvailable();
    error StalePrice();
    error InvalidPrice();
    error CollectionNotSupported();
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(PRICE_UPDATER_ROLE, msg.sender);
    }
    
    /// @notice Get NFT value with fallback to floor price
    function getNFTValue(address nftContract, uint256 tokenId) external view override returns (uint256 value) {
        NFTPrice memory price = nftPrices[nftContract][tokenId];
        
        // If specific price exists and is valid
        if (price.valid && !_isStale(price.timestamp)) {
            return price.price;
        }
        
        // Fallback to floor price
        CollectionData memory collection = collections[nftContract];
        if (collection.active) {
            return collection.floorPrice;
        }
        
        // Final fallback to default floor price
        return defaultFloorPrice;
    }
    
    /// @notice Get collection floor price
    function getFloorPrice(address nftContract) external view override returns (uint256 floorPrice) {
        CollectionData memory collection = collections[nftContract];
        if (collection.active) {
            return collection.floorPrice;
        }
        return defaultFloorPrice;
    }
    
    /// @notice Update NFT price
    function updateNFTPrice(address nftContract, uint256 tokenId, uint256 price) external override onlyRole(PRICE_UPDATER_ROLE) whenNotPaused {
        require(price > 0, "Invalid price");
        
        nftPrices[nftContract][tokenId] = NFTPrice({
            price: price,
            timestamp: block.timestamp,
            valid: true
        });
        
        emit NFTPriceUpdated(nftContract, tokenId, price, block.timestamp);
    }
    
    /// @notice Update collection floor price
    function updateFloorPrice(address nftContract, uint256 floorPrice) external override onlyRole(PRICE_UPDATER_ROLE) whenNotPaused {
        require(floorPrice > 0, "Invalid floor price");
        
        collections[nftContract].floorPrice = floorPrice;
        collections[nftContract].lastUpdate = block.timestamp;
        collections[nftContract].active = true;
        
        emit FloorPriceUpdated(nftContract, floorPrice, block.timestamp);
    }
    
    /// @notice Add new NFT collection
    function addCollection(address nftContract, uint256 floorPrice) external onlyRole(ADMIN_ROLE) {
        require(nftContract != address(0), "Invalid contract address");
        require(floorPrice > 0, "Invalid floor price");
        
        collections[nftContract] = CollectionData({
            floorPrice: floorPrice,
            lastUpdate: block.timestamp,
            active: true
        });
        
        emit CollectionAdded(nftContract, floorPrice);
    }
    
    /// @notice Batch update NFT prices
    function batchUpdatePrices(
        address[] calldata nftContracts,
        uint256[] calldata tokenIds,
        uint256[] calldata prices
    ) external onlyRole(PRICE_UPDATER_ROLE) whenNotPaused {
        require(nftContracts.length == tokenIds.length && tokenIds.length == prices.length, "Array length mismatch");
        
        for (uint256 i = 0; i < nftContracts.length; i++) {
            require(prices[i] > 0, "Invalid price");
            
            nftPrices[nftContracts[i]][tokenIds[i]] = NFTPrice({
                price: prices[i],
                timestamp: block.timestamp,
                valid: true
            });
            
            emit NFTPriceUpdated(nftContracts[i], tokenIds[i], prices[i], block.timestamp);
        }
    }
    
    /// @notice Batch update floor prices
    function batchUpdateFloorPrices(
        address[] calldata nftContracts,
        uint256[] calldata floorPrices
    ) external onlyRole(PRICE_UPDATER_ROLE) whenNotPaused {
        require(nftContracts.length == floorPrices.length, "Array length mismatch");
        
        for (uint256 i = 0; i < nftContracts.length; i++) {
            require(floorPrices[i] > 0, "Invalid floor price");
            
            collections[nftContracts[i]].floorPrice = floorPrices[i];
            collections[nftContracts[i]].lastUpdate = block.timestamp;
            collections[nftContracts[i]].active = true;
            
            emit FloorPriceUpdated(nftContracts[i], floorPrices[i], block.timestamp);
        }
    }
    
    /// @notice Check if price is available
    function isPriceAvailable(address nftContract, uint256 tokenId) external view override returns (bool available) {
        NFTPrice memory price = nftPrices[nftContract][tokenId];
        return price.valid && !_isStale(price.timestamp);
    }
    
    /// @notice Get price update timestamp
    function getPriceUpdateTime(address nftContract, uint256 tokenId) external view override returns (uint256 timestamp) {
        return nftPrices[nftContract][tokenId].timestamp;
    }
    
    /// @notice Check if price is stale
    function _isStale(uint256 timestamp) internal view returns (bool) {
        return block.timestamp - timestamp > maxPriceAge;
    }
    
    /// @notice Update maximum price age
    function setMaxPriceAge(uint256 newMaxAge) external onlyRole(ADMIN_ROLE) {
        require(newMaxAge > 0, "Invalid max age");
        maxPriceAge = newMaxAge;
        emit MaxPriceAgeUpdated(newMaxAge);
    }
    
    /// @notice Set default floor price
    function setDefaultFloorPrice(uint256 newDefaultPrice) external onlyRole(ADMIN_ROLE) {
        require(newDefaultPrice > 0, "Invalid default price");
        defaultFloorPrice = newDefaultPrice;
    }
    
    /// @notice Deactivate collection
    function deactivateCollection(address nftContract) external onlyRole(ADMIN_ROLE) {
        collections[nftContract].active = false;
    }
    
    /// @notice Activate collection
    function activateCollection(address nftContract) external onlyRole(ADMIN_ROLE) {
        collections[nftContract].active = true;
    }
    
    /// @notice Emergency pause
    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /// @notice Emergency unpause
    function emergencyUnpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}



