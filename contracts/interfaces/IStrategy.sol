// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IStrategy
 * @dev Interface for yield farming strategies
 */
interface IStrategy {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external returns (uint256);
    function harvest() external returns (uint256);
    function getTotalAssets() external view returns (uint256);
    function getAPY() external view returns (uint256);
    function emergencyWithdraw() external;
    function isActive() external view returns (bool);
}
