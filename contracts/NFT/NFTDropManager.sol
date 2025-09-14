// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title NFTDropManager
 * @dev Manages NFT drops with airdrop, presale, and public sale stages
 * @author LINE Yield Team
 */
contract NFTDropManager is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Drop campaign structure
    struct DropCampaign {
        uint256 dropId;
        address nftContract;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 maxParticipants;
        uint256 airdropAmount;
        uint256 presalePrice;
        uint256 publicPrice;
        bool whitelistRequired;
        DropStatus status;
        uint256 totalMinted;
        uint256 totalAirdropped;
    }

    // Drop stage structure
    struct DropStage {
        uint256 stageId;
        uint256 dropId;
        StageType stageType;
        uint256 startTime;
        uint256 endTime;
        uint256 price;
        uint256 maxSupply;
        uint256 minted;
        bool active;
    }

    // Airdrop recipient structure
    struct AirdropRecipient {
        address recipient;
        uint256 amount;
        bool claimed;
        uint256 tier;
    }

    // Whitelist entry structure
    struct WhitelistEntry {
        address user;
        uint256 maxMints;
        uint256 minted;
        bool active;
    }

    // Enums
    enum DropStatus {
        Created,
        Airdrop,
        Presale,
        Public,
        Completed,
        Cancelled
    }

    enum StageType {
        Airdrop,
        Presale,
        Public
    }

    // State variables
    mapping(uint256 => DropCampaign) public dropCampaigns;
    mapping(uint256 => DropStage) public dropStages;
    mapping(uint256 => mapping(address => AirdropRecipient)) public airdropRecipients;
    mapping(uint256 => mapping(address => WhitelistEntry)) public whitelist;
    mapping(uint256 => address[]) public dropParticipants;
    
    uint256 public dropCounter;
    uint256 public stageCounter;
    
    // Payment token (USDT)
    IERC20 public paymentToken;
    
    // Fee configuration
    uint256 public platformFee = 250; // 2.5%
    address public feeRecipient;
    
    // Events
    event DropCampaignCreated(uint256 indexed dropId, address indexed nftContract, string name);
    event DropStageStarted(uint256 indexed dropId, StageType stageType, uint256 startTime);
    event AirdropExecuted(uint256 indexed dropId, address indexed recipient, uint256 amount);
    event PresaleMint(uint256 indexed dropId, address indexed user, uint256 amount, uint256 price);
    event PublicMint(uint256 indexed dropId, address indexed user, uint256 amount, uint256 price);
    event WhitelistUpdated(uint256 indexed dropId, address indexed user, uint256 maxMints);
    event DropStatusUpdated(uint256 indexed dropId, DropStatus newStatus);
    event PlatformFeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address newRecipient);
    
    // Modifiers
    modifier onlyDropOwner(uint256 dropId) {
        require(dropCampaigns[dropId].dropId != 0, "Drop not found");
        require(msg.sender == owner() || msg.sender == dropCampaigns[dropId].nftContract, "Not authorized");
        _;
    }
    
    modifier dropActive(uint256 dropId) {
        require(dropCampaigns[dropId].dropId != 0, "Drop not found");
        require(dropCampaigns[dropId].status != DropStatus.Cancelled, "Drop cancelled");
        require(dropCampaigns[dropId].status != DropStatus.Completed, "Drop completed");
        _;
    }
    
    modifier stageActive(uint256 dropId, StageType stageType) {
        DropStage memory stage = getActiveStage(dropId, stageType);
        require(stage.stageId != 0, "Stage not found");
        require(stage.active, "Stage not active");
        require(block.timestamp >= stage.startTime, "Stage not started");
        require(block.timestamp <= stage.endTime, "Stage ended");
        _;
    }
    
    constructor(address _paymentToken, address _feeRecipient) {
        paymentToken = IERC20(_paymentToken);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create a new drop campaign
     * @param nftContract NFT contract address
     * @param name Drop name
     * @param description Drop description
     * @param startTime Drop start time
     * @param endTime Drop end time
     * @param maxParticipants Maximum participants
     * @param airdropAmount Airdrop amount per recipient
     * @param presalePrice Presale price
     * @param publicPrice Public sale price
     * @param whitelistRequired Whether whitelist is required
     * @return dropId Drop campaign ID
     */
    function createDropCampaign(
        address nftContract,
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 maxParticipants,
        uint256 airdropAmount,
        uint256 presalePrice,
        uint256 publicPrice,
        bool whitelistRequired
    ) external onlyOwner returns (uint256) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(startTime > block.timestamp, "Invalid start time");
        require(endTime > startTime, "Invalid end time");
        require(maxParticipants > 0, "Invalid max participants");
        
        dropCounter = dropCounter.add(1);
        uint256 dropId = dropCounter;
        
        DropCampaign memory newDrop = DropCampaign({
            dropId: dropId,
            nftContract: nftContract,
            name: name,
            description: description,
            startTime: startTime,
            endTime: endTime,
            maxParticipants: maxParticipants,
            airdropAmount: airdropAmount,
            presalePrice: presalePrice,
            publicPrice: publicPrice,
            whitelistRequired: whitelistRequired,
            status: DropStatus.Created,
            totalMinted: 0,
            totalAirdropped: 0
        });
        
        dropCampaigns[dropId] = newDrop;
        
        emit DropCampaignCreated(dropId, nftContract, name);
        return dropId;
    }
    
    /**
     * @dev Create drop stages
     * @param dropId Drop campaign ID
     * @param airdropStart Airdrop start time
     * @param airdropEnd Airdrop end time
     * @param presaleStart Presale start time
     * @param presaleEnd Presale end time
     * @param publicStart Public sale start time
     * @param publicEnd Public sale end time
     */
    function createDropStages(
        uint256 dropId,
        uint256 airdropStart,
        uint256 airdropEnd,
        uint256 presaleStart,
        uint256 presaleEnd,
        uint256 publicStart,
        uint256 publicEnd
    ) external onlyDropOwner(dropId) {
        require(dropCampaigns[dropId].dropId != 0, "Drop not found");
        
        // Create airdrop stage
        stageCounter = stageCounter.add(1);
        dropStages[stageCounter] = DropStage({
            stageId: stageCounter,
            dropId: dropId,
            stageType: StageType.Airdrop,
            startTime: airdropStart,
            endTime: airdropEnd,
            price: 0,
            maxSupply: dropCampaigns[dropId].airdropAmount,
            minted: 0,
            active: true
        });
        
        // Create presale stage
        stageCounter = stageCounter.add(1);
        dropStages[stageCounter] = DropStage({
            stageId: stageCounter,
            dropId: dropId,
            stageType: StageType.Presale,
            startTime: presaleStart,
            endTime: presaleEnd,
            price: dropCampaigns[dropId].presalePrice,
            maxSupply: dropCampaigns[dropId].maxParticipants.sub(dropCampaigns[dropId].airdropAmount),
            minted: 0,
            active: true
        });
        
        // Create public sale stage
        stageCounter = stageCounter.add(1);
        dropStages[stageCounter] = DropStage({
            stageId: stageCounter,
            dropId: dropId,
            stageType: StageType.Public,
            startTime: publicStart,
            endTime: publicEnd,
            price: dropCampaigns[dropId].publicPrice,
            maxSupply: dropCampaigns[dropId].maxParticipants.sub(dropCampaigns[dropId].airdropAmount),
            minted: 0,
            active: true
        });
    }
    
    /**
     * @dev Execute airdrop
     * @param dropId Drop campaign ID
     * @param recipients Airdrop recipients
     */
    function executeAirdrop(
        uint256 dropId,
        address[] memory recipients,
        uint256[] memory amounts
    ) external onlyDropOwner(dropId) nonReentrant {
        require(dropCampaigns[dropId].dropId != 0, "Drop not found");
        require(recipients.length == amounts.length, "Array length mismatch");
        
        DropCampaign storage drop = dropCampaigns[dropId];
        require(drop.status == DropStatus.Created || drop.status == DropStatus.Airdrop, "Invalid drop status");
        
        // Update drop status to airdrop
        if (drop.status == DropStatus.Created) {
            drop.status = DropStatus.Airdrop;
            emit DropStatusUpdated(dropId, DropStatus.Airdrop);
        }
        
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            uint256 amount = amounts[i];
            
            require(recipient != address(0), "Invalid recipient");
            require(amount > 0, "Invalid amount");
            require(!airdropRecipients[dropId][recipient].claimed, "Already airdropped");
            
            // Record airdrop recipient
            airdropRecipients[dropId][recipient] = AirdropRecipient({
                recipient: recipient,
                amount: amount,
                claimed: true,
                tier: 1
            });
            
            // Mint NFTs to recipient
            IERC721(drop.nftContract).transferFrom(address(this), recipient, amount);
            
            drop.totalAirdropped = drop.totalAirdropped.add(amount);
            
            emit AirdropExecuted(dropId, recipient, amount);
        }
    }
    
    /**
     * @dev Start presale stage
     * @param dropId Drop campaign ID
     */
    function startPresale(uint256 dropId) external onlyDropOwner(dropId) {
        require(dropCampaigns[dropId].dropId != 0, "Drop not found");
        
        DropCampaign storage drop = dropCampaigns[dropId];
        drop.status = DropStatus.Presale;
        
        emit DropStatusUpdated(dropId, DropStatus.Presale);
        emit DropStageStarted(dropId, StageType.Presale, block.timestamp);
    }
    
    /**
     * @dev Start public sale stage
     * @param dropId Drop campaign ID
     */
    function startPublicSale(uint256 dropId) external onlyDropOwner(dropId) {
        require(dropCampaigns[dropId].dropId != 0, "Drop not found");
        
        DropCampaign storage drop = dropCampaigns[dropId];
        drop.status = DropStatus.Public;
        
        emit DropStatusUpdated(dropId, DropStatus.Public);
        emit DropStageStarted(dropId, StageType.Public, block.timestamp);
    }
    
    /**
     * @dev Mint during presale
     * @param dropId Drop campaign ID
     * @param amount Amount to mint
     */
    function presaleMint(uint256 dropId, uint256 amount) external nonReentrant whenNotPaused {
        require(dropCampaigns[dropId].dropId != 0, "Drop not found");
        require(dropCampaigns[dropId].status == DropStatus.Presale, "Not in presale");
        
        DropCampaign storage drop = dropCampaigns[dropId];
        
        // Check whitelist if required
        if (drop.whitelistRequired) {
            require(whitelist[dropId][msg.sender].active, "Not whitelisted");
            require(whitelist[dropId][msg.sender].minted.add(amount) <= whitelist[dropId][msg.sender].maxMints, "Exceeds whitelist limit");
        }
        
        // Check supply
        require(drop.totalMinted.add(amount) <= drop.maxParticipants, "Exceeds max supply");
        
        // Calculate total price
        uint256 totalPrice = drop.presalePrice.mul(amount);
        
        // Transfer payment
        paymentToken.safeTransferFrom(msg.sender, address(this), totalPrice);
        
        // Mint NFTs
        IERC721(drop.nftContract).transferFrom(address(this), msg.sender, amount);
        
        // Update counters
        drop.totalMinted = drop.totalMinted.add(amount);
        if (drop.whitelistRequired) {
            whitelist[dropId][msg.sender].minted = whitelist[dropId][msg.sender].minted.add(amount);
        }
        
        emit PresaleMint(dropId, msg.sender, amount, totalPrice);
    }
    
    /**
     * @dev Mint during public sale
     * @param dropId Drop campaign ID
     * @param amount Amount to mint
     */
    function publicMint(uint256 dropId, uint256 amount) external nonReentrant whenNotPaused {
        require(dropCampaigns[dropId].dropId != 0, "Drop not found");
        require(dropCampaigns[dropId].status == DropStatus.Public, "Not in public sale");
        
        DropCampaign storage drop = dropCampaigns[dropId];
        
        // Check supply
        require(drop.totalMinted.add(amount) <= drop.maxParticipants, "Exceeds max supply");
        
        // Calculate total price
        uint256 totalPrice = drop.publicPrice.mul(amount);
        
        // Transfer payment
        paymentToken.safeTransferFrom(msg.sender, address(this), totalPrice);
        
        // Mint NFTs
        IERC721(drop.nftContract).transferFrom(address(this), msg.sender, amount);
        
        // Update counters
        drop.totalMinted = drop.totalMinted.add(amount);
        
        emit PublicMint(dropId, msg.sender, amount, totalPrice);
    }
    
    /**
     * @dev Add user to whitelist
     * @param dropId Drop campaign ID
     * @param user User address
     * @param maxMints Maximum mints allowed
     */
    function addToWhitelist(uint256 dropId, address user, uint256 maxMints) external onlyDropOwner(dropId) {
        require(dropCampaigns[dropId].dropId != 0, "Drop not found");
        require(user != address(0), "Invalid user");
        require(maxMints > 0, "Invalid max mints");
        
        whitelist[dropId][user] = WhitelistEntry({
            user: user,
            maxMints: maxMints,
            minted: 0,
            active: true
        });
        
        emit WhitelistUpdated(dropId, user, maxMints);
    }
    
    /**
     * @dev Batch add users to whitelist
     * @param dropId Drop campaign ID
     * @param users User addresses
     * @param maxMints Maximum mints for each user
     */
    function batchAddToWhitelist(uint256 dropId, address[] memory users, uint256[] memory maxMints) external onlyDropOwner(dropId) {
        require(users.length == maxMints.length, "Array length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            addToWhitelist(dropId, users[i], maxMints[i]);
        }
    }
    
    /**
     * @dev Get active stage for drop
     * @param dropId Drop campaign ID
     * @param stageType Stage type
     * @return Active stage
     */
    function getActiveStage(uint256 dropId, StageType stageType) public view returns (DropStage memory) {
        for (uint256 i = 1; i <= stageCounter; i++) {
            if (dropStages[i].dropId == dropId && dropStages[i].stageType == stageType) {
                return dropStages[i];
            }
        }
        return DropStage(0, 0, StageType.Airdrop, 0, 0, 0, 0, 0, false);
    }
    
    /**
     * @dev Get drop campaign details
     * @param dropId Drop campaign ID
     * @return Drop campaign
     */
    function getDropCampaign(uint256 dropId) external view returns (DropCampaign memory) {
        return dropCampaigns[dropId];
    }
    
    /**
     * @dev Get whitelist entry
     * @param dropId Drop campaign ID
     * @param user User address
     * @return Whitelist entry
     */
    function getWhitelistEntry(uint256 dropId, address user) external view returns (WhitelistEntry memory) {
        return whitelist[dropId][user];
    }
    
    /**
     * @dev Get airdrop recipient info
     * @param dropId Drop campaign ID
     * @param recipient Recipient address
     * @return Airdrop recipient info
     */
    function getAirdropRecipient(uint256 dropId, address recipient) external view returns (AirdropRecipient memory) {
        return airdropRecipients[dropId][recipient];
    }
    
    /**
     * @dev Update platform fee
     * @param newFee New platform fee
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }
    
    /**
     * @dev Update fee recipient
     * @param newRecipient New fee recipient
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }
    
    /**
     * @dev Withdraw platform fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        
        paymentToken.safeTransfer(feeRecipient, balance);
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
}

