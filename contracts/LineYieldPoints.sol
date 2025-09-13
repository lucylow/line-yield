// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LineYieldPoints
 * @dev Gamification contract for LINE YIELD Points system
 * Handles points tracking, leaderboard, and daily distribution
 */
contract LineYieldPoints is Ownable, ReentrancyGuard, Pausable {
    // Mapping user address => points balance
    mapping(address => uint256) public pointsBalance;
    
    // Mapping user address => last time points were updated (for holding rewards)
    mapping(address => uint256) public lastPointsUpdate;
    
    // Mapping user address => total points earned (for statistics)
    mapping(address => uint256) public totalPointsEarned;
    
    // Mapping user address => referral count
    mapping(address => uint256) public referralCount;
    
    // Mapping user address => referral points earned
    mapping(address => uint256) public referralPointsEarned;
    
    // Total points distributed overall
    uint256 public totalPointsDistributed;
    
    // Daily distribution pool (admin controlled)
    uint256 public dailyDistributionPool;
    
    // Points configuration
    uint256 public constant DEPOSIT_POINTS_RATE = 1e18; // 1 point per USDT (scaled by 1e18)
    uint256 public constant REFERRAL_POINTS = 50e18; // 50 points for referral
    uint256 public constant HOLDING_POINTS_PER_DAY = 10e18; // 10 points per day held
    uint256 public constant MIN_HOLDING_DURATION = 1 days; // Minimum holding duration
    
    // Leaderboard configuration
    uint256 public constant LEADERBOARD_SIZE = 10;
    address[] public leaderboardAddresses;
    mapping(address => uint256) public leaderboardPoints;
    
    // Daily distribution tracking
    uint256 public lastDistributionTime;
    uint256 public constant DISTRIBUTION_INTERVAL = 1 days;
    
    // Events
    event PointsAwarded(address indexed user, uint256 points, string reason, uint256 timestamp);
    event DailyDistribution(uint256 totalDistributed, uint256 timestamp);
    event LeaderboardUpdated(address indexed user, uint256 newRank, uint256 points);
    event ReferralRegistered(address indexed referrer, address indexed referee);
    
    // Modifiers
    modifier updateHoldingPoints(address user) {
        _distributeHoldingPoints(user);
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || 
            authorizedCallers[msg.sender], 
            "Not authorized"
        );
        _;
    }
    
    // Authorized callers (backend services)
    mapping(address => bool) public authorizedCallers;
    
    constructor() {
        lastDistributionTime = block.timestamp;
    }
    
    /**
     * @dev Add authorized caller (backend service)
     */
    function addAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = true;
    }
    
    /**
     * @dev Remove authorized caller
     */
    function removeAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = false;
    }
    
    /**
     * @dev Award points for deposit
     * @param user User address
     * @param amount Deposit amount in USDT (scaled by 1e6)
     */
    function awardDepositPoints(address user, uint256 amount) 
        external 
        onlyAuthorized 
        updateHoldingPoints(user) 
        nonReentrant 
        whenNotPaused 
    {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        
        // Calculate points: 1 point per USDT deposited
        uint256 points = (amount * DEPOSIT_POINTS_RATE) / 1e6;
        
        pointsBalance[user] += points;
        totalPointsEarned[user] += points;
        lastPointsUpdate[user] = block.timestamp;
        totalPointsDistributed += points;
        
        _updateLeaderboard(user);
        
        emit PointsAwarded(user, points, "Deposit", block.timestamp);
    }
    
    /**
     * @dev Award referral points
     * @param referrer Address of the referrer
     * @param referee Address of the referee
     */
    function awardReferralPoints(address referrer, address referee) 
        external 
        onlyAuthorized 
        updateHoldingPoints(referrer) 
        updateHoldingPoints(referee) 
        nonReentrant 
        whenNotPaused 
    {
        require(referrer != address(0), "Invalid referrer address");
        require(referee != address(0), "Invalid referee address");
        require(referrer != referee, "Cannot refer yourself");
        
        // Award points to both referrer and referee
        pointsBalance[referrer] += REFERRAL_POINTS;
        pointsBalance[referee] += REFERRAL_POINTS;
        
        totalPointsEarned[referrer] += REFERRAL_POINTS;
        totalPointsEarned[referee] += REFERRAL_POINTS;
        
        referralPointsEarned[referrer] += REFERRAL_POINTS;
        referralCount[referrer] += 1;
        
        lastPointsUpdate[referrer] = block.timestamp;
        lastPointsUpdate[referee] = block.timestamp;
        
        totalPointsDistributed += REFERRAL_POINTS * 2;
        
        _updateLeaderboard(referrer);
        _updateLeaderboard(referee);
        
        emit PointsAwarded(referrer, REFERRAL_POINTS, "Referral", block.timestamp);
        emit PointsAwarded(referee, REFERRAL_POINTS, "Referral", block.timestamp);
        emit ReferralRegistered(referrer, referee);
    }
    
    /**
     * @dev Distribute holding points (internal)
     * @param user User address
     */
    function _distributeHoldingPoints(address user) internal {
        if (lastPointsUpdate[user] == 0) {
            lastPointsUpdate[user] = block.timestamp;
            return;
        }
        
        uint256 timeHeld = block.timestamp - lastPointsUpdate[user];
        if (timeHeld < MIN_HOLDING_DURATION) {
            return;
        }
        
        uint256 daysHeld = timeHeld / MIN_HOLDING_DURATION;
        uint256 points = daysHeld * HOLDING_POINTS_PER_DAY;
        
        pointsBalance[user] += points;
        totalPointsEarned[user] += points;
        totalPointsDistributed += points;
        
        lastPointsUpdate[user] = lastPointsUpdate[user] + daysHeld * MIN_HOLDING_DURATION;
        
        _updateLeaderboard(user);
        
        emit PointsAwarded(user, points, "Holding", block.timestamp);
    }
    
    /**
     * @dev Update leaderboard (internal)
     * @param user User address
     */
    function _updateLeaderboard(address user) internal {
        uint256 userPoints = pointsBalance[user];
        uint256 len = leaderboardAddresses.length;
        
        // Check if user is already in leaderboard
        bool inBoard = false;
        uint256 userIndex = 0;
        
        for (uint256 i = 0; i < len; i++) {
            if (leaderboardAddresses[i] == user) {
                inBoard = true;
                userIndex = i;
                break;
            }
        }
        
        if (inBoard) {
            // Update existing entry
            leaderboardPoints[user] = userPoints;
        } else {
            // Add new entry or replace minimum
            if (len < LEADERBOARD_SIZE) {
                leaderboardAddresses.push(user);
                leaderboardPoints[user] = userPoints;
            } else {
                // Find minimum points entry
                uint256 minPoints = type(uint256).max;
                uint256 minIndex = 0;
                
                for (uint256 i = 0; i < len; i++) {
                    if (leaderboardPoints[leaderboardAddresses[i]] < minPoints) {
                        minPoints = leaderboardPoints[leaderboardAddresses[i]];
                        minIndex = i;
                    }
                }
                
                // Replace if user has more points
                if (userPoints > minPoints) {
                    address removed = leaderboardAddresses[minIndex];
                    leaderboardPoints[removed] = 0;
                    leaderboardAddresses[minIndex] = user;
                    leaderboardPoints[user] = userPoints;
                }
            }
        }
        
        // Sort leaderboard (simple bubble sort for small array)
        _sortLeaderboard();
    }
    
    /**
     * @dev Sort leaderboard by points (internal)
     */
    function _sortLeaderboard() internal {
        uint256 len = leaderboardAddresses.length;
        for (uint256 i = 0; i < len - 1; i++) {
            for (uint256 j = 0; j < len - i - 1; j++) {
                if (leaderboardPoints[leaderboardAddresses[j]] < leaderboardPoints[leaderboardAddresses[j + 1]]) {
                    // Swap addresses
                    address temp = leaderboardAddresses[j];
                    leaderboardAddresses[j] = leaderboardAddresses[j + 1];
                    leaderboardAddresses[j + 1] = temp;
                }
            }
        }
    }
    
    /**
     * @dev Set daily distribution pool
     * @param amount Amount of points to distribute daily
     */
    function setDailyDistributionPool(uint256 amount) external onlyOwner {
        dailyDistributionPool = amount;
    }
    
    /**
     * @dev Distribute daily points proportionally to leaderboard users
     * Should be called once per day by backend/keeper
     */
    function distributeDailyPoints() external onlyAuthorized nonReentrant whenNotPaused {
        require(
            block.timestamp >= lastDistributionTime + DISTRIBUTION_INTERVAL,
            "Distribution interval not met"
        );
        
        uint256 len = leaderboardAddresses.length;
        if (len == 0 || dailyDistributionPool == 0) {
            lastDistributionTime = block.timestamp;
            return;
        }
        
        // Calculate total points for proportional distribution
        uint256 totalLeaderboardPoints = 0;
        for (uint256 i = 0; i < len; i++) {
            totalLeaderboardPoints += pointsBalance[leaderboardAddresses[i]];
        }
        
        if (totalLeaderboardPoints == 0) {
            lastDistributionTime = block.timestamp;
            return;
        }
        
        // Distribute points proportionally
        for (uint256 i = 0; i < len; i++) {
            address user = leaderboardAddresses[i];
            uint256 userShare = (pointsBalance[user] * dailyDistributionPool) / totalLeaderboardPoints;
            
            if (userShare > 0) {
                pointsBalance[user] += userShare;
                totalPointsEarned[user] += userShare;
                totalPointsDistributed += userShare;
                
                emit PointsAwarded(user, userShare, "DailyDistribution", block.timestamp);
            }
        }
        
        emit DailyDistribution(dailyDistributionPool, block.timestamp);
        
        // Reset distribution pool and update time
        dailyDistributionPool = 0;
        lastDistributionTime = block.timestamp;
    }
    
    /**
     * @dev Get current leaderboard
     * @return users Array of user addresses
     * @return scores Array of user scores
     */
    function getLeaderboard() external view returns (address[] memory users, uint256[] memory scores) {
        uint256 len = leaderboardAddresses.length;
        users = new address[](len);
        scores = new uint256[](len);
        
        for (uint256 i = 0; i < len; i++) {
            users[i] = leaderboardAddresses[i];
            scores[i] = leaderboardPoints[leaderboardAddresses[i]];
        }
    }
    
    /**
     * @dev Get user statistics
     * @param user User address
     * @return balance Current points balance
     * @return totalEarned Total points earned
     * @return referrals Number of referrals
     * @return referralPoints Points earned from referrals
     */
    function getUserStats(address user) external view returns (
        uint256 balance,
        uint256 totalEarned,
        uint256 referrals,
        uint256 referralPoints
    ) {
        return (
            pointsBalance[user],
            totalPointsEarned[user],
            referralCount[user],
            referralPointsEarned[user]
        );
    }
    
    /**
     * @dev Get contract statistics
     * @return totalDistributed Total points distributed
     * @return dailyPool Current daily distribution pool
     * @return lastDistributed Last distribution timestamp
     * @return leaderboardSize Current leaderboard size
     */
    function getContractStats() external view returns (
        uint256 totalDistributed,
        uint256 dailyPool,
        uint256 lastDistributed,
        uint256 leaderboardSize
    ) {
        return (
            totalPointsDistributed,
            dailyDistributionPool,
            lastDistributionTime,
            leaderboardAddresses.length
        );
    }
    
    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}

