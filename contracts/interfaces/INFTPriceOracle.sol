// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title NFT Price Oracle Interface
/// @notice Interface for NFT price oracles used in collateral valuation
interface INFTPriceOracle {
    /// @notice Get the current value of an NFT in stablecoin (6 decimals)
    /// @param nftContract The NFT contract address
    /// @param tokenId The NFT token ID
    /// @return value The NFT value in stablecoin (6 decimals)
    function getNFTValue(address nftContract, uint256 tokenId) external view returns (uint256 value);
    
    /// @notice Get the floor price of an NFT collection
    /// @param nftContract The NFT contract address
    /// @return floorPrice The floor price in stablecoin (6 decimals)
    function getFloorPrice(address nftContract) external view returns (uint256 floorPrice);
    
    /// @notice Update NFT price (only price updater role)
    /// @param nftContract The NFT contract address
    /// @param tokenId The NFT token ID
    /// @param price The new price in stablecoin (6 decimals)
    function updateNFTPrice(address nftContract, uint256 tokenId, uint256 price) external;
    
    /// @notice Update collection floor price
    /// @param nftContract The NFT contract address
    /// @param floorPrice The new floor price in stablecoin (6 decimals)
    function updateFloorPrice(address nftContract, uint256 floorPrice) external;
    
    /// @notice Check if NFT price is available
    /// @param nftContract The NFT contract address
    /// @param tokenId The NFT token ID
    /// @return available True if price is available
    function isPriceAvailable(address nftContract, uint256 tokenId) external view returns (bool available);
    
    /// @notice Get price update timestamp
    /// @param nftContract The NFT contract address
    /// @param tokenId The NFT token ID
    /// @return timestamp The last update timestamp
    function getPriceUpdateTime(address nftContract, uint256 tokenId) external view returns (uint256 timestamp);
    
    /// @notice Events
    event NFTPriceUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 price, uint256 timestamp);
    event FloorPriceUpdated(address indexed nftContract, uint256 floorPrice, uint256 timestamp);
}



