// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/ILiquidationEngine.sol";

/// @title Liquidation Engine Implementation
/// @notice Handles liquidation logic for NFT collateral positions
contract LiquidationEngine is ILiquidationEngine, AccessControl, Pausable {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Liquidation parameters
    uint256 public liquidationBonusBps = 500; // 5% liquidation bonus
    uint256 public maxLiquidationRatio = 10000; // 100% max liquidation ratio
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event LiquidationParametersUpdated(uint256 liquidationBonusBps, uint256 maxLiquidationRatio);
    
    // Errors
    error InvalidParameters();
    error LiquidationNotAllowed();
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }
    
    /// @notice Calculate liquidation amount
    /// @dev Liquidator pays the total debt amount
    function calculateLiquidationAmount(
        uint256 collateralValue,
        uint256 totalDebt
    ) external pure override returns (uint256 liquidationAmount) {
        // Liquidator pays the full debt amount
        return totalDebt;
    }
    
    /// @notice Calculate liquidation bonus for liquidator
    /// @dev Liquidator receives collateral worth more than the debt paid
    function calculateLiquidationBonus(
        uint256 collateralValue,
        uint256 liquidationAmount
    ) external view override returns (uint256 bonus) {
        // Bonus is the difference between collateral value and liquidation amount
        if (collateralValue > liquidationAmount) {
            return collateralValue - liquidationAmount;
        }
        return 0;
    }
    
    /// @notice Check if position is liquidatable
    function isLiquidatable(
        uint256 collateralValue,
        uint256 totalDebt,
        uint256 liquidationThreshold
    ) external pure override returns (bool liquidatable) {
        if (totalDebt == 0) return false;
        
        // Calculate current collateral ratio
        uint256 collateralRatio = (collateralValue * BASIS_POINTS) / totalDebt;
        
        // Position is liquidatable if collateral ratio is below threshold
        return collateralRatio < liquidationThreshold;
    }
    
    /// @notice Get liquidation parameters
    function getLiquidationParameters() external view override returns (
        uint256 _liquidationBonusBps,
        uint256 _maxLiquidationRatio
    ) {
        return (liquidationBonusBps, maxLiquidationRatio);
    }
    
    /// @notice Update liquidation bonus
    function setLiquidationBonus(uint256 newBonusBps) external onlyRole(ADMIN_ROLE) {
        require(newBonusBps <= BASIS_POINTS, "Bonus cannot exceed 100%");
        liquidationBonusBps = newBonusBps;
        emit LiquidationParametersUpdated(liquidationBonusBps, maxLiquidationRatio);
    }
    
    /// @notice Update max liquidation ratio
    function setMaxLiquidationRatio(uint256 newMaxRatio) external onlyRole(ADMIN_ROLE) {
        require(newMaxRatio <= BASIS_POINTS, "Max ratio cannot exceed 100%");
        maxLiquidationRatio = newMaxRatio;
        emit LiquidationParametersUpdated(liquidationBonusBps, maxLiquidationRatio);
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



