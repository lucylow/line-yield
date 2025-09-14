// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IYieldStrategy
 * @notice Interface for yield strategies in the Kaia Wave Stablecoin DeFi ecosystem
 * @dev All yield strategies must implement this interface for vault integration
 */
interface IYieldStrategy {
    /**
     * @notice Deposit tokens into the strategy
     * @param amount Amount of tokens to deposit
     * @return shares Number of strategy shares received
     */
    function deposit(uint256 amount) external returns (uint256 shares);

    /**
     * @notice Withdraw tokens from the strategy
     * @param amount Amount of tokens to withdraw
     * @return withdrawn Actual amount of tokens withdrawn
     */
    function withdraw(uint256 amount) external returns (uint256 withdrawn);

    /**
     * @notice Harvest accumulated yield
     * @return yieldAmount Amount of yield harvested
     */
    function harvest() external returns (uint256 yieldAmount);

    /**
     * @notice Get current strategy balance in underlying token terms
     * @return balance Current balance including principal and yield
     */
    function balance() external view returns (uint256 balance);

    /**
     * @notice Get strategy information
     * @return name Strategy name
     * @return apy Current APY (in basis points, e.g., 850 = 8.5%)
     * @return riskLevel Risk level (1-5, where 5 is highest risk)
     * @return minDeposit Minimum deposit amount
     * @return maxDeposit Maximum deposit amount
     */
    function getStrategyInfo() external view returns (
        string memory name,
        uint256 apy,
        uint256 riskLevel,
        uint256 minDeposit,
        uint256 maxDeposit
    );

    /**
     * @notice Check if strategy is active and accepting deposits
     * @return isActive True if strategy is active
     */
    function isActive() external view returns (bool isActive);

    /**
     * @notice Get the underlying token address
     * @return token Address of the underlying token
     */
    function getUnderlyingToken() external view returns (address token);
}



