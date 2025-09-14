// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SettlementContract
 * @dev Handles settlement with OTC partners and USDT conversion
 * @author LINE Yield Team
 */
contract SettlementContract is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // OTC partner structure
    struct OTCPartner {
        address partnerAddress;
        string name;
        bool active;
        uint256 liquidityLimit;
        uint256 currentLiquidity;
        uint256 conversionFee; // Basis points
        uint256 lastUpdate;
    }

    // Settlement batch structure
    struct SettlementBatch {
        uint256 batchId;
        uint256 totalAmount;
        uint256 totalUSDT;
        uint256 partnerCount;
        uint256 timestamp;
        SettlementBatchStatus status;
        string batchHash;
    }

    // Settlement batch status
    enum SettlementBatchStatus {
        Pending,
        Processing,
        Completed,
        Failed
    }

    // Individual settlement structure
    struct IndividualSettlement {
        uint256 settlementId;
        uint256 batchId;
        address user;
        uint256 fiatAmount;
        uint256 usdtAmount;
        address otcPartner;
        uint256 timestamp;
        SettlementStatus status;
        string transactionHash;
    }

    // Settlement status
    enum SettlementStatus {
        Pending,
        Processing,
        Completed,
        Failed,
        Disputed
    }

    // State variables
    mapping(uint256 => SettlementBatch) public settlementBatches;
    mapping(uint256 => IndividualSettlement) public individualSettlements;
    mapping(address => uint256[]) public userSettlements;
    mapping(address => OTCPartner) public otcPartners;
    mapping(address => bool) public authorizedSettlers;
    
    uint256 public batchCounter;
    uint256 public settlementCounter;
    
    // USDT token
    IERC20 public usdtToken;
    
    // Configuration
    uint256 public minSettlementAmount = 100 * 10**18; // 100 USDT minimum
    uint256 public maxSettlementAmount = 1000000 * 10**18; // 1M USDT maximum
    uint256 public settlementTimeout = 24 hours;
    
    // Events
    event SettlementBatchCreated(uint256 indexed batchId, uint256 totalAmount, uint256 partnerCount);
    event SettlementBatchCompleted(uint256 indexed batchId, uint256 totalUSDT);
    event IndividualSettlementCreated(uint256 indexed settlementId, uint256 indexed batchId, address indexed user);
    event IndividualSettlementCompleted(uint256 indexed settlementId, uint256 usdtAmount);
    event OTCPartnerAdded(address indexed partner, string name, uint256 liquidityLimit);
    event OTCPartnerUpdated(address indexed partner, bool active, uint256 liquidityLimit);
    event LiquidityUpdated(address indexed partner, uint256 newLiquidity);
    event SettlementDisputed(uint256 indexed settlementId, string reason);
    
    // Modifiers
    modifier onlyAuthorizedSettler() {
        require(authorizedSettlers[msg.sender] || msg.sender == owner(), "Not authorized settler");
        _;
    }
    
    modifier onlyOTCPartner() {
        require(otcPartners[msg.sender].active, "Not authorized OTC partner");
        _;
    }
    
    constructor(address _usdtToken) {
        usdtToken = IERC20(_usdtToken);
    }
    
    /**
     * @dev Create a new settlement batch
     * @param totalAmount Total fiat amount to settle
     * @param partnerCount Number of OTC partners involved
     * @return batchId Settlement batch ID
     */
    function createSettlementBatch(
        uint256 totalAmount,
        uint256 partnerCount
    ) external onlyAuthorizedSettler nonReentrant whenNotPaused returns (uint256) {
        require(totalAmount >= minSettlementAmount, "Amount below minimum");
        require(totalAmount <= maxSettlementAmount, "Amount above maximum");
        require(partnerCount > 0, "Invalid partner count");
        
        batchCounter = batchCounter.add(1);
        uint256 batchId = batchCounter;
        
        SettlementBatch memory newBatch = SettlementBatch({
            batchId: batchId,
            totalAmount: totalAmount,
            totalUSDT: 0,
            partnerCount: partnerCount,
            timestamp: block.timestamp,
            status: SettlementBatchStatus.Pending,
            batchHash: ""
        });
        
        settlementBatches[batchId] = newBatch;
        
        emit SettlementBatchCreated(batchId, totalAmount, partnerCount);
        return batchId;
    }
    
    /**
     * @dev Add individual settlement to batch
     * @param batchId Settlement batch ID
     * @param user User address
     * @param fiatAmount Fiat amount
     * @param otcPartner OTC partner address
     * @return settlementId Individual settlement ID
     */
    function addIndividualSettlement(
        uint256 batchId,
        address user,
        uint256 fiatAmount,
        address otcPartner
    ) external onlyAuthorizedSettler nonReentrant returns (uint256) {
        require(settlementBatches[batchId].batchId != 0, "Batch not found");
        require(settlementBatches[batchId].status == SettlementBatchStatus.Pending, "Batch not pending");
        require(otcPartners[otcPartner].active, "OTC partner not active");
        require(otcPartners[otcPartner].currentLiquidity >= fiatAmount, "Insufficient liquidity");
        
        settlementCounter = settlementCounter.add(1);
        uint256 settlementId = settlementCounter;
        
        // Calculate USDT amount with conversion fee
        uint256 conversionFee = fiatAmount.mul(otcPartners[otcPartner].conversionFee).div(10000);
        uint256 usdtAmount = fiatAmount.sub(conversionFee);
        
        IndividualSettlement memory newSettlement = IndividualSettlement({
            settlementId: settlementId,
            batchId: batchId,
            user: user,
            fiatAmount: fiatAmount,
            usdtAmount: usdtAmount,
            otcPartner: otcPartner,
            timestamp: block.timestamp,
            status: SettlementStatus.Pending,
            transactionHash: ""
        });
        
        individualSettlements[settlementId] = newSettlement;
        userSettlements[user].push(settlementId);
        
        // Update OTC partner liquidity
        otcPartners[otcPartner].currentLiquidity = otcPartners[otcPartner].currentLiquidity.sub(fiatAmount);
        otcPartners[otcPartner].lastUpdate = block.timestamp;
        
        emit IndividualSettlementCreated(settlementId, batchId, user);
        emit LiquidityUpdated(otcPartner, otcPartners[otcPartner].currentLiquidity);
        
        return settlementId;
    }
    
    /**
     * @dev Process individual settlement (called by OTC partner)
     * @param settlementId Settlement ID
     * @param transactionHash Transaction hash
     */
    function processSettlement(uint256 settlementId, string memory transactionHash) external onlyOTCPartner {
        require(individualSettlements[settlementId].settlementId != 0, "Settlement not found");
        require(individualSettlements[settlementId].status == SettlementStatus.Pending, "Settlement not pending");
        require(individualSettlements[settlementId].otcPartner == msg.sender, "Not authorized partner");
        
        individualSettlements[settlementId].status = SettlementStatus.Processing;
        individualSettlements[settlementId].transactionHash = transactionHash;
    }
    
    /**
     * @dev Complete individual settlement
     * @param settlementId Settlement ID
     */
    function completeSettlement(uint256 settlementId) external onlyOTCPartner nonReentrant {
        require(individualSettlements[settlementId].settlementId != 0, "Settlement not found");
        require(individualSettlements[settlementId].status == SettlementStatus.Processing, "Settlement not processing");
        require(individualSettlements[settlementId].otcPartner == msg.sender, "Not authorized partner");
        
        IndividualSettlement storage settlement = individualSettlements[settlementId];
        settlement.status = SettlementStatus.Completed;
        
        // Transfer USDT to user
        usdtToken.safeTransfer(settlement.user, settlement.usdtAmount);
        
        // Update batch total
        uint256 batchId = settlement.batchId;
        settlementBatches[batchId].totalUSDT = settlementBatches[batchId].totalUSDT.add(settlement.usdtAmount);
        
        emit IndividualSettlementCompleted(settlementId, settlement.usdtAmount);
        
        // Check if batch is complete
        _checkBatchCompletion(batchId);
    }
    
    /**
     * @dev Check if settlement batch is complete
     * @param batchId Batch ID
     */
    function _checkBatchCompletion(uint256 batchId) internal {
        SettlementBatch storage batch = settlementBatches[batchId];
        
        // Count completed settlements in batch
        uint256 completedCount = 0;
        for (uint256 i = 1; i <= settlementCounter; i++) {
            if (individualSettlements[i].batchId == batchId && 
                individualSettlements[i].status == SettlementStatus.Completed) {
                completedCount = completedCount.add(1);
            }
        }
        
        // If all settlements completed, mark batch as complete
        if (completedCount == batch.partnerCount) {
            batch.status = SettlementBatchStatus.Completed;
            batch.batchHash = keccak256(abi.encodePacked(batchId, block.timestamp));
            emit SettlementBatchCompleted(batchId, batch.totalUSDT);
        }
    }
    
    /**
     * @dev Fail individual settlement
     * @param settlementId Settlement ID
     * @param reason Failure reason
     */
    function failSettlement(uint256 settlementId, string memory reason) external onlyOTCPartner {
        require(individualSettlements[settlementId].settlementId != 0, "Settlement not found");
        require(individualSettlements[settlementId].otcPartner == msg.sender, "Not authorized partner");
        
        IndividualSettlement storage settlement = individualSettlements[settlementId];
        settlement.status = SettlementStatus.Failed;
        
        // Return liquidity to OTC partner
        otcPartners[settlement.otcPartner].currentLiquidity = 
            otcPartners[settlement.otcPartner].currentLiquidity.add(settlement.fiatAmount);
        
        emit LiquidityUpdated(settlement.otcPartner, otcPartners[settlement.otcPartner].currentLiquidity);
    }
    
    /**
     * @dev Dispute settlement
     * @param settlementId Settlement ID
     * @param reason Dispute reason
     */
    function disputeSettlement(uint256 settlementId, string memory reason) external {
        require(individualSettlements[settlementId].settlementId != 0, "Settlement not found");
        require(individualSettlements[settlementId].user == msg.sender, "Not settlement user");
        require(individualSettlements[settlementId].status == SettlementStatus.Completed, "Settlement not completed");
        
        individualSettlements[settlementId].status = SettlementStatus.Disputed;
        
        emit SettlementDisputed(settlementId, reason);
    }
    
    /**
     * @dev Add OTC partner
     * @param partner Partner address
     * @param name Partner name
     * @param liquidityLimit Liquidity limit
     * @param conversionFee Conversion fee in basis points
     */
    function addOTCPartner(
        address partner,
        string memory name,
        uint256 liquidityLimit,
        uint256 conversionFee
    ) external onlyOwner {
        require(partner != address(0), "Invalid partner address");
        require(liquidityLimit > 0, "Invalid liquidity limit");
        require(conversionFee <= 1000, "Conversion fee too high"); // Max 10%
        
        otcPartners[partner] = OTCPartner({
            partnerAddress: partner,
            name: name,
            active: true,
            liquidityLimit: liquidityLimit,
            currentLiquidity: liquidityLimit,
            conversionFee: conversionFee,
            lastUpdate: block.timestamp
        });
        
        emit OTCPartnerAdded(partner, name, liquidityLimit);
    }
    
    /**
     * @dev Update OTC partner
     * @param partner Partner address
     * @param active Active status
     * @param liquidityLimit New liquidity limit
     */
    function updateOTCPartner(
        address partner,
        bool active,
        uint256 liquidityLimit
    ) external onlyOwner {
        require(otcPartners[partner].partnerAddress != address(0), "Partner not found");
        
        otcPartners[partner].active = active;
        otcPartners[partner].liquidityLimit = liquidityLimit;
        otcPartners[partner].lastUpdate = block.timestamp;
        
        emit OTCPartnerUpdated(partner, active, liquidityLimit);
    }
    
    /**
     * @dev Replenish OTC partner liquidity
     * @param partner Partner address
     * @param amount Amount to add
     */
    function replenishLiquidity(address partner, uint256 amount) external onlyOwner {
        require(otcPartners[partner].partnerAddress != address(0), "Partner not found");
        
        otcPartners[partner].currentLiquidity = otcPartners[partner].currentLiquidity.add(amount);
        otcPartners[partner].lastUpdate = block.timestamp;
        
        emit LiquidityUpdated(partner, otcPartners[partner].currentLiquidity);
    }
    
    /**
     * @dev Get settlement batch details
     * @param batchId Batch ID
     * @return SettlementBatch struct
     */
    function getSettlementBatch(uint256 batchId) external view returns (SettlementBatch memory) {
        return settlementBatches[batchId];
    }
    
    /**
     * @dev Get individual settlement details
     * @param settlementId Settlement ID
     * @return IndividualSettlement struct
     */
    function getIndividualSettlement(uint256 settlementId) external view returns (IndividualSettlement memory) {
        return individualSettlements[settlementId];
    }
    
    /**
     * @dev Get user's settlements
     * @param user User address
     * @return Array of settlement IDs
     */
    function getUserSettlements(address user) external view returns (uint256[] memory) {
        return userSettlements[user];
    }
    
    /**
     * @dev Get OTC partner details
     * @param partner Partner address
     * @return OTCPartner struct
     */
    function getOTCPartner(address partner) external view returns (OTCPartner memory) {
        return otcPartners[partner];
    }
    
    /**
     * @dev Add or remove authorized settler
     * @param settler Settler address
     * @param authorized Authorization status
     */
    function setAuthorizedSettler(address settler, bool authorized) external onlyOwner {
        authorizedSettlers[settler] = authorized;
    }
    
    /**
     * @dev Update settlement limits
     * @param minAmount Minimum settlement amount
     * @param maxAmount Maximum settlement amount
     */
    function updateSettlementLimits(uint256 minAmount, uint256 maxAmount) external onlyOwner {
        require(minAmount > 0, "Invalid minimum amount");
        require(maxAmount > minAmount, "Invalid maximum amount");
        
        minSettlementAmount = minAmount;
        maxSettlementAmount = maxAmount;
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
    
    /**
     * @dev Emergency withdraw USDT
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        usdtToken.safeTransfer(owner(), amount);
    }
}

