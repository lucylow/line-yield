// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title NftAirdropManager
 * @dev Manages NFT airdrops with signature-based minting and drop stages
 */
contract NftAirdropManager is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Drop stage structure
    struct DropStage {
        uint256 stageId;
        string name;
        string description;
        uint256 maxSupply;
        uint256 mintedCount;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        string baseURI;
        mapping(address => bool) whitelist;
        mapping(address => uint256) mintedPerUser;
        uint256 maxMintsPerUser;
    }

    // Mint parameters for signature verification
    struct MintParams {
        address recipient;
        uint256 stageId;
        uint256 tokenId;
        string tokenURI;
        uint256 nonce;
        uint256 deadline;
    }

    // Events
    event DropStageCreated(uint256 indexed stageId, string name, uint256 maxSupply);
    event DropStageUpdated(uint256 indexed stageId, bool isActive);
    event NFTMinted(address indexed recipient, uint256 indexed tokenId, uint256 indexed stageId);
    event WhitelistUpdated(uint256 indexed stageId, address indexed user, bool isWhitelisted);
    event SignerUpdated(address indexed oldSigner, address indexed newSigner);

    // State variables
    mapping(uint256 => DropStage) public dropStages;
    mapping(bytes32 => bool) public usedNonces;
    mapping(address => uint256) public userNonces;
    
    address public signer;
    uint256 public nextStageId = 1;
    uint256 public nextTokenId = 1;
    
    // Constants
    uint256 public constant MAX_SUPPLY_PER_STAGE = 10000;
    uint256 public constant MAX_MINTS_PER_USER_DEFAULT = 5;

    constructor(
        string memory name,
        string memory symbol,
        address initialSigner
    ) ERC721(name, symbol) {
        signer = initialSigner;
    }

    /**
     * @dev Create a new drop stage
     */
    function createDropStage(
        string memory name,
        string memory description,
        uint256 maxSupply,
        uint256 startTime,
        uint256 endTime,
        string memory baseURI,
        uint256 maxMintsPerUser
    ) external onlyOwner {
        require(maxSupply <= MAX_SUPPLY_PER_STAGE, "Max supply exceeded");
        require(startTime < endTime, "Invalid time range");
        require(maxMintsPerUser > 0, "Invalid max mints per user");

        uint256 stageId = nextStageId++;
        
        DropStage storage stage = dropStages[stageId];
        stage.stageId = stageId;
        stage.name = name;
        stage.description = description;
        stage.maxSupply = maxSupply;
        stage.startTime = startTime;
        stage.endTime = endTime;
        stage.isActive = true;
        stage.baseURI = baseURI;
        stage.maxMintsPerUser = maxMintsPerUser;

        emit DropStageCreated(stageId, name, maxSupply);
    }

    /**
     * @dev Update drop stage status
     */
    function updateDropStage(uint256 stageId, bool isActive) external onlyOwner {
        require(stageId < nextStageId, "Invalid stage ID");
        dropStages[stageId].isActive = isActive;
        emit DropStageUpdated(stageId, isActive);
    }

    /**
     * @dev Add users to whitelist for a stage
     */
    function updateWhitelist(
        uint256 stageId,
        address[] calldata users,
        bool[] calldata isWhitelisted
    ) external onlyOwner {
        require(stageId < nextStageId, "Invalid stage ID");
        require(users.length == isWhitelisted.length, "Array length mismatch");

        DropStage storage stage = dropStages[stageId];
        for (uint256 i = 0; i < users.length; i++) {
            stage.whitelist[users[i]] = isWhitelisted[i];
            emit WhitelistUpdated(stageId, users[i], isWhitelisted[i]);
        }
    }

    /**
     * @dev Mint NFT with signature verification
     */
    function mintWithSignature(
        MintParams calldata params,
        bytes calldata signature
    ) external nonReentrant {
        require(_verifySignature(params, signature), "Invalid signature");
        require(_isValidMintParams(params), "Invalid mint parameters");
        require(!usedNonces[_getNonceHash(params)], "Nonce already used");

        DropStage storage stage = dropStages[params.stageId];
        require(stage.isActive, "Stage not active");
        require(block.timestamp >= stage.startTime, "Stage not started");
        require(block.timestamp <= stage.endTime, "Stage ended");
        require(stage.mintedCount < stage.maxSupply, "Stage supply exhausted");
        require(stage.mintedPerUser[params.recipient] < stage.maxMintsPerUser, "User mint limit exceeded");

        // Mark nonce as used
        usedNonces[_getNonceHash(params)] = true;
        userNonces[params.recipient]++;

        // Mint the NFT
        _safeMint(params.recipient, params.tokenId);
        _setTokenURI(params.tokenId, params.tokenURI);
        
        // Update stage counters
        stage.mintedCount++;
        stage.mintedPerUser[params.recipient]++;

        emit NFTMinted(params.recipient, params.tokenId, params.stageId);
    }

    /**
     * @dev Batch mint NFTs for airdrop
     */
    function batchMintAirdrop(
        address[] calldata recipients,
        uint256 stageId,
        string[] calldata tokenURIs
    ) external onlyOwner {
        require(recipients.length == tokenURIs.length, "Array length mismatch");
        require(stageId < nextStageId, "Invalid stage ID");

        DropStage storage stage = dropStages[stageId];
        require(stage.isActive, "Stage not active");
        require(stage.mintedCount + recipients.length <= stage.maxSupply, "Exceeds stage supply");

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = nextTokenId++;
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            stage.mintedCount++;
            stage.mintedPerUser[recipients[i]]++;
            
            emit NFTMinted(recipients[i], tokenId, stageId);
        }
    }

    /**
     * @dev Update signer address
     */
    function updateSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid signer");
        address oldSigner = signer;
        signer = newSigner;
        emit SignerUpdated(oldSigner, newSigner);
    }

    /**
     * @dev Get drop stage information
     */
    function getDropStage(uint256 stageId) external view returns (
        uint256 id,
        string memory name,
        string memory description,
        uint256 maxSupply,
        uint256 mintedCount,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        string memory baseURI,
        uint256 maxMintsPerUser
    ) {
        require(stageId < nextStageId, "Invalid stage ID");
        DropStage storage stage = dropStages[stageId];
        
        return (
            stage.stageId,
            stage.name,
            stage.description,
            stage.maxSupply,
            stage.mintedCount,
            stage.startTime,
            stage.endTime,
            stage.isActive,
            stage.baseURI,
            stage.maxMintsPerUser
        );
    }

    /**
     * @dev Check if user is whitelisted for a stage
     */
    function isWhitelisted(uint256 stageId, address user) external view returns (bool) {
        require(stageId < nextStageId, "Invalid stage ID");
        return dropStages[stageId].whitelist[user];
    }

    /**
     * @dev Get user's minted count for a stage
     */
    function getUserMintedCount(uint256 stageId, address user) external view returns (uint256) {
        require(stageId < nextStageId, "Invalid stage ID");
        return dropStages[stageId].mintedPerUser[user];
    }

    /**
     * @dev Verify signature for mint parameters
     */
    function _verifySignature(
        MintParams calldata params,
        bytes calldata signature
    ) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(
            params.recipient,
            params.stageId,
            params.tokenId,
            params.tokenURI,
            params.nonce,
            params.deadline,
            address(this)
        ));
        
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        
        return recoveredSigner == signer;
    }

    /**
     * @dev Validate mint parameters
     */
    function _isValidMintParams(MintParams calldata params) internal view returns (bool) {
        return params.recipient != address(0) &&
               params.deadline > block.timestamp &&
               params.tokenId > 0;
    }

    /**
     * @dev Get nonce hash for tracking used nonces
     */
    function _getNonceHash(MintParams calldata params) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(params.recipient, params.nonce));
    }

    // Required overrides for multiple inheritance
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

