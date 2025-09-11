// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SecurityOracle
 * @dev Oracle contract for monitoring security metrics and triggering alerts
 * @author Kaia Yield Optimizer Team
 */
contract SecurityOracle is Ownable, Pausable {
    
    struct SecurityMetrics {
        uint256 tvl;
        uint256 dailyVolume;
        uint256 apy;
        uint256 riskScore;
        uint256 lastUpdate;
        bool isHealthy;
    }
    
    struct Alert {
        uint256 alertId;
        string alertType;
        string message;
        uint256 severity; // 1-5 scale
        uint256 timestamp;
        bool isActive;
    }
    
    // Security metrics
    mapping(address => SecurityMetrics) public vaultMetrics;
    mapping(uint256 => Alert) public alerts;
    uint256 public alertCount;
    
    // Thresholds for alerts
    uint256 public constant MAX_RISK_SCORE = 1000;
    uint256 public constant HIGH_RISK_THRESHOLD = 800;
    uint256 public constant MEDIUM_RISK_THRESHOLD = 600;
    uint256 public constant LOW_RISK_THRESHOLD = 400;
    
    // Volume thresholds
    uint256 public constant HIGH_VOLUME_THRESHOLD = 1000000 * 1e6; // 1M USDT
    uint256 public constant SUSPICIOUS_VOLUME_THRESHOLD = 10000000 * 1e6; // 10M USDT
    
    // APY thresholds
    uint256 public constant SUSPICIOUS_APY_THRESHOLD = 5000; // 50% APY
    uint256 public constant EXTREME_APY_THRESHOLD = 10000; // 100% APY
    
    // Events
    event MetricsUpdated(address indexed vault, uint256 tvl, uint256 apy, uint256 riskScore);
    event AlertTriggered(uint256 indexed alertId, string alertType, string message, uint256 severity);
    event AlertResolved(uint256 indexed alertId);
    event ThresholdUpdated(string parameter, uint256 oldValue, uint256 newValue);
    
    // Errors
    error InvalidVault();
    error InvalidMetrics();
    error AlertNotFound();
    error InvalidSeverity();
    error UnauthorizedUpdater();
    
    modifier onlyAuthorizedUpdater() {
        // In production, this would check against a whitelist of authorized updaters
        if (msg.sender != owner()) revert UnauthorizedUpdater();
        _;
    }
    
    constructor() {
        // Initialize with default thresholds
    }
    
    /**
     * @dev Update security metrics for a vault
     * @param vault Vault address
     * @param tvl Total value locked
     * @param dailyVolume Daily trading volume
     * @param apy Current APY (in basis points)
     */
    function updateMetrics(
        address vault,
        uint256 tvl,
        uint256 dailyVolume,
        uint256 apy
    ) external onlyAuthorizedUpdater {
        if (vault == address(0)) revert InvalidVault();
        
        // Calculate risk score based on various factors
        uint256 riskScore = calculateRiskScore(tvl, dailyVolume, apy);
        
        // Update metrics
        vaultMetrics[vault] = SecurityMetrics({
            tvl: tvl,
            dailyVolume: dailyVolume,
            apy: apy,
            riskScore: riskScore,
            lastUpdate: block.timestamp,
            isHealthy: riskScore < MEDIUM_RISK_THRESHOLD
        });
        
        emit MetricsUpdated(vault, tvl, apy, riskScore);
        
        // Check for alerts
        checkAndTriggerAlerts(vault, tvl, dailyVolume, apy, riskScore);
    }
    
    /**
     * @dev Calculate risk score based on various factors
     * @param tvl Total value locked
     * @param dailyVolume Daily trading volume
     * @param apy Current APY
     * @return Risk score (0-1000)
     */
    function calculateRiskScore(
        uint256 tvl,
        uint256 dailyVolume,
        uint256 apy
    ) internal pure returns (uint256) {
        uint256 score = 0;
        
        // TVL risk (higher TVL = lower risk)
        if (tvl < 100000 * 1e6) { // Less than 100K USDT
            score += 200;
        } else if (tvl < 1000000 * 1e6) { // Less than 1M USDT
            score += 100;
        }
        
        // Volume risk (unusual volume patterns)
        if (dailyVolume > SUSPICIOUS_VOLUME_THRESHOLD) {
            score += 300;
        } else if (dailyVolume > HIGH_VOLUME_THRESHOLD) {
            score += 150;
        }
        
        // APY risk (unusually high APY)
        if (apy > EXTREME_APY_THRESHOLD) {
            score += 400;
        } else if (apy > SUSPICIOUS_APY_THRESHOLD) {
            score += 200;
        }
        
        // Concentration risk (if volume is too high relative to TVL)
        if (tvl > 0 && dailyVolume > tvl * 2) {
            score += 100;
        }
        
        return score > MAX_RISK_SCORE ? MAX_RISK_SCORE : score;
    }
    
    /**
     * @dev Check metrics and trigger alerts if necessary
     */
    function checkAndTriggerAlerts(
        address vault,
        uint256 tvl,
        uint256 dailyVolume,
        uint256 apy,
        uint256 riskScore
    ) internal {
        // High risk score alert
        if (riskScore >= HIGH_RISK_THRESHOLD) {
            triggerAlert(
                "HIGH_RISK",
                string(abi.encodePacked("Vault ", _addressToString(vault), " has high risk score: ", _uintToString(riskScore))),
                5
            );
        }
        
        // Suspicious volume alert
        if (dailyVolume > SUSPICIOUS_VOLUME_THRESHOLD) {
            triggerAlert(
                "SUSPICIOUS_VOLUME",
                string(abi.encodePacked("Vault ", _addressToString(vault), " has suspicious volume: ", _uintToString(dailyVolume))),
                4
            );
        }
        
        // Extreme APY alert
        if (apy > EXTREME_APY_THRESHOLD) {
            triggerAlert(
                "EXTREME_APY",
                string(abi.encodePacked("Vault ", _addressToString(vault), " has extreme APY: ", _uintToString(apy))),
                4
            );
        }
        
        // TVL drop alert
        SecurityMetrics memory previousMetrics = vaultMetrics[vault];
        if (previousMetrics.tvl > 0 && tvl < previousMetrics.tvl * 8 / 10) { // 20% drop
            triggerAlert(
                "TVL_DROP",
                string(abi.encodePacked("Vault ", _addressToString(vault), " TVL dropped significantly")),
                3
            );
        }
    }
    
    /**
     * @dev Trigger a security alert
     * @param alertType Type of alert
     * @param message Alert message
     * @param severity Alert severity (1-5)
     */
    function triggerAlert(
        string memory alertType,
        string memory message,
        uint256 severity
    ) internal {
        if (severity < 1 || severity > 5) revert InvalidSeverity();
        
        alertCount++;
        alerts[alertCount] = Alert({
            alertId: alertCount,
            alertType: alertType,
            message: message,
            severity: severity,
            timestamp: block.timestamp,
            isActive: true
        });
        
        emit AlertTriggered(alertCount, alertType, message, severity);
    }
    
    /**
     * @dev Resolve an alert
     * @param alertId Alert ID to resolve
     */
    function resolveAlert(uint256 alertId) external onlyOwner {
        if (alertId == 0 || alertId > alertCount) revert AlertNotFound();
        
        alerts[alertId].isActive = false;
        emit AlertResolved(alertId);
    }
    
    /**
     * @dev Get vault health status
     * @param vault Vault address
     * @return isHealthy Whether vault is healthy
     * @return riskScore Current risk score
     * @return lastUpdate Last update timestamp
     */
    function getVaultHealth(address vault) external view returns (
        bool isHealthy,
        uint256 riskScore,
        uint256 lastUpdate
    ) {
        SecurityMetrics memory metrics = vaultMetrics[vault];
        return (metrics.isHealthy, metrics.riskScore, metrics.lastUpdate);
    }
    
    /**
     * @dev Get active alerts
     * @return Active alert IDs
     */
    function getActiveAlerts() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active alerts
        for (uint256 i = 1; i <= alertCount; i++) {
            if (alerts[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active alert IDs
        uint256[] memory activeAlerts = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= alertCount; i++) {
            if (alerts[i].isActive) {
                activeAlerts[index] = i;
                index++;
            }
        }
        
        return activeAlerts;
    }
    
    /**
     * @dev Get alert details
     * @param alertId Alert ID
     * @return Alert details
     */
    function getAlert(uint256 alertId) external view returns (Alert memory) {
        if (alertId == 0 || alertId > alertCount) revert AlertNotFound();
        return alerts[alertId];
    }
    
    /**
     * @dev Update risk thresholds
     * @param highRisk New high risk threshold
     * @param mediumRisk New medium risk threshold
     * @param lowRisk New low risk threshold
     */
    function updateRiskThresholds(
        uint256 highRisk,
        uint256 mediumRisk,
        uint256 lowRisk
    ) external onlyOwner {
        require(highRisk > mediumRisk && mediumRisk > lowRisk, "Invalid thresholds");
        
        emit ThresholdUpdated("HIGH_RISK_THRESHOLD", HIGH_RISK_THRESHOLD, highRisk);
        emit ThresholdUpdated("MEDIUM_RISK_THRESHOLD", MEDIUM_RISK_THRESHOLD, mediumRisk);
        emit ThresholdUpdated("LOW_RISK_THRESHOLD", LOW_RISK_THRESHOLD, lowRisk);
    }
    
    /**
     * @dev Emergency pause all operations
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Resume operations after emergency
     */
    function resumeOperations() external onlyOwner {
        _unpause();
    }
    
    // Helper functions
    function _addressToString(address addr) internal pure returns (string memory) {
        return _uintToString(uint256(uint160(addr)));
    }
    
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
