// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Liquidation Engine Interface
/// @notice Interface for liquidation logic in NFT collateral system
interface ILiquidationEngine {
    /// @notice Calculate liquidation amount for a position
    /// @param collateralValue The current collateral value
    /// @param totalDebt The total debt (principal + interest)
    /// @return liquidationAmount The amount to be paid by liquidator
    function calculateLiquidationAmount(
        uint256 collateralValue,
        uint256 totalDebt
    ) external pure returns (uint256 liquidationAmount);
    
    /// @notice Calculate liquidation bonus for liquidator
    /// @param collateralValue The current collateral value
    /// @param liquidationAmount The liquidation amount
    /// @return bonus The liquidation bonus amount
    function calculateLiquidationBonus(
        uint256 collateralValue,
        uint256 liquidationAmount
    ) external pure returns (uint256 bonus);
    
    /// @notice Check if position is liquidatable
    /// @param collateralValue The current collateral value
    /// @param totalDebt The total debt
    /// @param liquidationThreshold The liquidation threshold (basis points)
    /// @return liquidatable True if position can be liquidated
    function isLiquidatable(
        uint256 collateralValue,
        uint256 totalDebt,
        uint256 liquidationThreshold
    ) external pure returns (bool liquidatable);
    
    /// @notice Get liquidation parameters
    /// @return liquidationBonusBps Liquidation bonus in basis points
    /// @return maxLiquidationRatio Maximum liquidation ratio in basis points
    function getLiquidationParameters() external view returns (
        uint256 liquidationBonusBps,
        uint256 maxLiquidationRatio
    );
}



