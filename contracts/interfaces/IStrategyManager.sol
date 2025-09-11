// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IStrategyManager
 * @dev Interface for strategy management
 */
interface IStrategyManager {
    function allocateAssets(uint256 amount) external;
    function deallocateAssets(uint256 amount) external;
    function getTotalAssets() external view returns (uint256);
    function getCurrentAPY() external view returns (uint256);
    function getActiveStrategies() external view returns (address[] memory);
    function getStrategyAllocations() external view returns (address[] memory strategies, uint256[] memory allocations);
    function emergencyWithdrawAll() external;
}
