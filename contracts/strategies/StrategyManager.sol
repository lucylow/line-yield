// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./IYieldStrategy.sol";

/**
 * @title StrategyManager
 * @notice Manages multiple yield strategies for the Kaia Wave Stablecoin DeFi vault
 * @dev Handles strategy allocation, rebalancing, and yield optimization
 */
contract StrategyManager is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant HARVESTER_ROLE = keccak256("HARVESTER_ROLE");
    bytes32 public constant REBALANCER_ROLE = keccak256("REBALANCER_ROLE");

    struct StrategyInfo {
        address strategy;
        uint256 allocation; // Allocation percentage (basis points)
        uint256 balance; // Current balance in strategy
        bool active;
        uint256 lastHarvestTime;
        uint256 totalYield;
    }

    struct AllocationConfig {
        uint256 totalAllocation; // Total allocation percentage (should be 10000 = 100%)
        uint256 rebalanceThreshold; // Threshold for triggering rebalance (basis points)
        uint256 harvestCooldown; // Minimum time between harvests
    }

    IERC20 public immutable underlyingToken;
    address public immutable vault;
    
    StrategyInfo[] public strategies;
    AllocationConfig public config;
    
    uint256 public totalDeposited;
    uint256 public totalYieldEarned;
    uint256 public lastRebalanceTime;
    uint256 public constant MAX_STRATEGIES = 10;

    event StrategyAdded(address indexed strategy, uint256 allocation);
    event StrategyRemoved(address indexed strategy);
    event StrategyAllocationUpdated(address indexed strategy, uint256 oldAllocation, uint256 newAllocation);
    event Deposited(address indexed strategy, uint256 amount);
    event Withdrawn(address indexed strategy, uint256 amount);
    event Harvested(address indexed strategy, uint256 yieldAmount);
    event Rebalanced(uint256 timestamp);
    event ConfigUpdated(uint256 totalAllocation, uint256 rebalanceThreshold, uint256 harvestCooldown);

    constructor(
        address _underlyingToken,
        address _vault,
        address _admin
    ) {
        require(_underlyingToken != address(0), "Invalid underlying token");
        require(_vault != address(0), "Invalid vault");
        require(_admin != address(0), "Invalid admin");

        underlyingToken = IERC20(_underlyingToken);
        vault = _vault;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MANAGER_ROLE, _admin);
        _grantRole(HARVESTER_ROLE, _admin);
        _grantRole(REBALANCER_ROLE, _admin);

        // Default configuration
        config = AllocationConfig({
            totalAllocation: 10000, // 100%
            rebalanceThreshold: 500, // 5%
            harvestCooldown: 1 hours
        });
    }

    modifier onlyVault() {
        require(msg.sender == vault, "Only vault can call");
        _;
    }

    modifier onlyManager() {
        require(hasRole(MANAGER_ROLE, msg.sender), "Caller is not manager");
        _;
    }

    modifier onlyHarvester() {
        require(hasRole(HARVESTER_ROLE, msg.sender), "Caller is not harvester");
        _;
    }

    modifier onlyRebalancer() {
        require(hasRole(REBALANCER_ROLE, msg.sender), "Caller is not rebalancer");
        _;
    }

    /**
     * @notice Add a new yield strategy
     * @param strategy Address of the strategy contract
     * @param allocation Allocation percentage in basis points
     */
    function addStrategy(address strategy, uint256 allocation) external onlyManager {
        require(strategy != address(0), "Invalid strategy address");
        require(allocation > 0, "Allocation must be positive");
        require(strategies.length < MAX_STRATEGIES, "Too many strategies");
        require(IYieldStrategy(strategy).getUnderlyingToken() == address(underlyingToken), "Token mismatch");

        strategies.push(StrategyInfo({
            strategy: strategy,
            allocation: allocation,
            balance: 0,
            active: true,
            lastHarvestTime: 0,
            totalYield: 0
        }));

        emit StrategyAdded(strategy, allocation);
    }

    /**
     * @notice Remove a strategy
     * @param index Index of the strategy to remove
     */
    function removeStrategy(uint256 index) external onlyManager {
        require(index < strategies.length, "Invalid strategy index");
        require(strategies[index].balance == 0, "Strategy has balance");

        address strategy = strategies[index].strategy;
        
        // Move last strategy to the removed position
        strategies[index] = strategies[strategies.length - 1];
        strategies.pop();

        emit StrategyRemoved(strategy);
    }

    /**
     * @notice Update strategy allocation
     * @param index Index of the strategy
     * @param newAllocation New allocation percentage
     */
    function updateStrategyAllocation(uint256 index, uint256 newAllocation) external onlyManager {
        require(index < strategies.length, "Invalid strategy index");
        require(newAllocation > 0, "Allocation must be positive");

        uint256 oldAllocation = strategies[index].allocation;
        strategies[index].allocation = newAllocation;

        emit StrategyAllocationUpdated(strategies[index].strategy, oldAllocation, newAllocation);
    }

    /**
     * @notice Deposit funds into strategies
     * @param amount Total amount to deposit
     */
    function deposit(uint256 amount) external onlyVault nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be positive");
        require(strategies.length > 0, "No strategies available");

        totalDeposited += amount;

        // Distribute funds according to allocations
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                uint256 strategyAmount = (amount * strategies[i].allocation) / config.totalAllocation;
                
                if (strategyAmount > 0) {
                    // Transfer tokens to strategy
                    underlyingToken.safeTransfer(strategies[i].strategy, strategyAmount);
                    
                    // Call strategy deposit
                    uint256 shares = IYieldStrategy(strategies[i].strategy).deposit(strategyAmount);
                    strategies[i].balance += strategyAmount;

                    emit Deposited(strategies[i].strategy, strategyAmount);
                }
            }
        }
    }

    /**
     * @notice Withdraw funds from strategies
     * @param amount Amount to withdraw
     * @return withdrawn Actual amount withdrawn
     */
    function withdraw(uint256 amount) external onlyVault nonReentrant returns (uint256 withdrawn) {
        require(amount > 0, "Amount must be positive");
        require(amount <= totalDeposited, "Insufficient balance");

        uint256 remainingAmount = amount;

        // Withdraw from strategies proportionally
        for (uint256 i = 0; i < strategies.length && remainingAmount > 0; i++) {
            if (strategies[i].active && strategies[i].balance > 0) {
                uint256 strategyAmount = (amount * strategies[i].balance) / totalDeposited;
                if (strategyAmount > remainingAmount) {
                    strategyAmount = remainingAmount;
                }

                uint256 withdrawnFromStrategy = IYieldStrategy(strategies[i].strategy).withdraw(strategyAmount);
                strategies[i].balance -= withdrawnFromStrategy;
                withdrawn += withdrawnFromStrategy;
                remainingAmount -= withdrawnFromStrategy;

                emit Withdrawn(strategies[i].strategy, withdrawnFromStrategy);
            }
        }

        totalDeposited -= withdrawn;
    }

    /**
     * @notice Harvest yield from all strategies
     * @return totalYield Total yield harvested
     */
    function harvestAll() external onlyHarvester nonReentrant returns (uint256 totalYield) {
        require(block.timestamp >= lastRebalanceTime + config.harvestCooldown, "Harvest cooldown not met");

        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                uint256 yieldAmount = IYieldStrategy(strategies[i].strategy).harvest();
                if (yieldAmount > 0) {
                    strategies[i].totalYield += yieldAmount;
                    totalYield += yieldAmount;
                    strategies[i].lastHarvestTime = block.timestamp;

                    emit Harvested(strategies[i].strategy, yieldAmount);
                }
            }
        }

        totalYieldEarned += totalYield;
        lastRebalanceTime = block.timestamp;
    }

    /**
     * @notice Rebalance strategies based on current allocations
     */
    function rebalance() external onlyRebalancer nonReentrant {
        require(strategies.length > 0, "No strategies available");

        uint256 totalBalance = getTotalBalance();
        if (totalBalance == 0) return;

        // Check if rebalancing is needed
        bool needsRebalancing = false;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                uint256 targetBalance = (totalBalance * strategies[i].allocation) / config.totalAllocation;
                uint256 currentBalance = strategies[i].balance;
                
                if (currentBalance > targetBalance) {
                    uint256 excess = currentBalance - targetBalance;
                    if (excess > (targetBalance * config.rebalanceThreshold) / 10000) {
                        needsRebalancing = true;
                        break;
                    }
                }
            }
        }

        if (!needsRebalancing) return;

        // Perform rebalancing
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                uint256 targetBalance = (totalBalance * strategies[i].allocation) / config.totalAllocation;
                uint256 currentBalance = strategies[i].balance;

                if (currentBalance > targetBalance) {
                    // Withdraw excess
                    uint256 excess = currentBalance - targetBalance;
                    uint256 withdrawn = IYieldStrategy(strategies[i].strategy).withdraw(excess);
                    strategies[i].balance -= withdrawn;
                } else if (currentBalance < targetBalance) {
                    // Deposit more
                    uint256 needed = targetBalance - currentBalance;
                    underlyingToken.safeTransfer(strategies[i].strategy, needed);
                    uint256 shares = IYieldStrategy(strategies[i].strategy).deposit(needed);
                    strategies[i].balance += needed;
                }
            }
        }

        emit Rebalanced(block.timestamp);
    }

    /**
     * @notice Get total balance across all strategies
     * @return balance Total balance
     */
    function getTotalBalance() public view returns (uint256 balance) {
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                balance += IYieldStrategy(strategies[i].strategy).balance();
            }
        }
    }

    /**
     * @notice Get strategy information
     * @param index Index of the strategy
     * @return info Strategy information
     */
    function getStrategyInfo(uint256 index) external view returns (StrategyInfo memory info) {
        require(index < strategies.length, "Invalid strategy index");
        return strategies[index];
    }

    /**
     * @notice Get all strategies
     * @return strategiesList Array of strategy information
     */
    function getAllStrategies() external view returns (StrategyInfo[] memory strategiesList) {
        return strategies;
    }

    /**
     * @notice Update configuration
     * @param _totalAllocation New total allocation
     * @param _rebalanceThreshold New rebalance threshold
     * @param _harvestCooldown New harvest cooldown
     */
    function updateConfig(
        uint256 _totalAllocation,
        uint256 _rebalanceThreshold,
        uint256 _harvestCooldown
    ) external onlyManager {
        require(_totalAllocation <= 10000, "Invalid total allocation");
        require(_rebalanceThreshold <= 1000, "Invalid rebalance threshold");

        config.totalAllocation = _totalAllocation;
        config.rebalanceThreshold = _rebalanceThreshold;
        config.harvestCooldown = _harvestCooldown;

        emit ConfigUpdated(_totalAllocation, _rebalanceThreshold, _harvestCooldown);
    }

    /**
     * @notice Emergency pause
     */
    function pause() external onlyManager {
        _pause();
    }

    /**
     * @notice Unpause
     */
    function unpause() external onlyManager {
        _unpause();
    }

    /**
     * @notice Emergency withdraw all funds
     */
    function emergencyWithdraw() external onlyManager {
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active && strategies[i].balance > 0) {
                uint256 withdrawn = IYieldStrategy(strategies[i].strategy).withdraw(strategies[i].balance);
                strategies[i].balance = 0;
            }
        }
    }
}



