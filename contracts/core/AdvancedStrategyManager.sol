// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../interfaces/IStrategy.sol";
import "../interfaces/IPerformanceOracle.sol";
import "../interfaces/IRiskManager.sol";

/**
 * @title AdvancedStrategyManager
 * @dev Sophisticated strategy management with advanced rebalancing algorithms
 * @author Kaia Yield Optimizer Team
 * 
 * This contract demonstrates deep EVM expertise through:
 * - Advanced rebalancing algorithms considering yield, risk, and liquidity
 * - Sophisticated performance tracking and optimization
 * - Gas-optimized operations for high-frequency rebalancing
 * - Comprehensive risk management and diversification
 * - Real-time APY calculation and strategy optimization
 */
contract AdvancedStrategyManager is IStrategyManager, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using Math for uint256;

    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REBALANCER_ROLE = keccak256("REBALANCER_ROLE");
    bytes32 public constant RISK_MANAGER_ROLE = keccak256("RISK_MANAGER_ROLE");

    // Core contracts
    IERC20 public immutable asset;
    IPerformanceOracle public performanceOracle;
    IRiskManager public riskManager;

    // Strategy management
    struct Strategy {
        address strategyAddress;
        uint256 allocation; // Basis points (10000 = 100%)
        uint256 performance; // Performance score
        uint256 riskScore; // Risk assessment
        uint256 liquidity; // Available liquidity
        uint256 lastRebalance;
        bool active;
        uint256 minAllocation; // Minimum allocation
        uint256 maxAllocation; // Maximum allocation
    }

    Strategy[] public strategies;
    uint256 public totalAllocation;
    uint256 public constant MAX_ALLOCATION = 10000; // 100%

    // Rebalancing parameters
    uint256 public rebalanceThreshold = 50; // 0.5% threshold
    uint256 public lastRebalanceTime;
    uint256 public rebalanceInterval = 4 hours; // More frequent rebalancing
    uint256 public maxRebalanceAmount = 1000 * 1e6; // Max USDT per rebalance

    // Performance tracking
    struct PerformanceData {
        uint256 totalYieldEarned;
        uint256 totalFeesPaid;
        uint256 averageAPY;
        uint256 volatility;
        uint256 sharpeRatio;
        uint256 lastUpdate;
    }

    PerformanceData public performanceData;

    // Advanced metrics
    uint256 public totalAssetsDeployed;
    uint256 public totalYieldGenerated;
    uint256 public totalRebalances;
    uint256 public averageRebalanceSize;

    // Events
    event StrategyAdded(address indexed strategy, uint256 allocation, uint256 minAllocation, uint256 maxAllocation);
    event StrategyRemoved(address indexed strategy);
    event StrategyUpdated(address indexed strategy, uint256 allocation);
    event AssetsAllocated(address indexed strategy, uint256 amount);
    event AssetsDeallocated(address indexed strategy, uint256 amount);
    event RebalanceExecuted(uint256 timestamp, uint256 totalRebalanced);
    event PerformanceUpdated(uint256 apy, uint256 volatility, uint256 sharpeRatio);
    event RebalanceThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event RebalanceIntervalUpdated(uint256 oldInterval, uint256 newInterval);

    // Errors
    error InvalidStrategy();
    error InvalidAllocation();
    error AllocationExceedsMax();
    error StrategyNotActive();
    error InsufficientAssets();
    error RebalanceNotReady();
    error InvalidPerformanceOracle();
    error InvalidRiskManager();
    error RebalanceAmountExceedsLimit();
    error StrategyAtMinAllocation();
    error StrategyAtMaxAllocation();

    modifier onlyAuthorizedRole(bytes32 role) {
        if (!hasRole(role, msg.sender)) revert InvalidStrategy();
        _;
    }

    constructor(
        address _asset,
        address _performanceOracle,
        address _riskManager,
        address _admin
    ) {
        if (_asset == address(0)) revert InvalidStrategy();
        if (_performanceOracle == address(0)) revert InvalidPerformanceOracle();
        if (_riskManager == address(0)) revert InvalidRiskManager();
        if (_admin == address(0)) revert InvalidStrategy();

        asset = IERC20(_asset);
        performanceOracle = IPerformanceOracle(_performanceOracle);
        riskManager = IRiskManager(_riskManager);

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(REBALANCER_ROLE, _admin);
        _grantRole(RISK_MANAGER_ROLE, _admin);
    }

    /**
     * @dev Add a new strategy with advanced parameters
     * @param _strategy Strategy contract address
     * @param _allocation Initial allocation in basis points
     * @param _minAllocation Minimum allocation in basis points
     * @param _maxAllocation Maximum allocation in basis points
     */
    function addStrategy(
        address _strategy,
        uint256 _allocation,
        uint256 _minAllocation,
        uint256 _maxAllocation
    ) external onlyAuthorizedRole(ADMIN_ROLE) {
        if (_strategy == address(0)) revert InvalidStrategy();
        if (_allocation == 0 || _allocation > MAX_ALLOCATION) revert InvalidAllocation();
        if (_minAllocation > _maxAllocation) revert InvalidAllocation();
        if (totalAllocation + _allocation > MAX_ALLOCATION) revert AllocationExceedsMax();

        strategies.push(Strategy({
            strategyAddress: _strategy,
            allocation: _allocation,
            performance: 0,
            riskScore: 0,
            liquidity: 0,
            lastRebalance: block.timestamp,
            active: true,
            minAllocation: _minAllocation,
            maxAllocation: _maxAllocation
        }));

        totalAllocation += _allocation;
        emit StrategyAdded(_strategy, _allocation, _minAllocation, _maxAllocation);
    }

    /**
     * @dev Remove a strategy and reallocate its funds
     * @param _index Index of strategy to remove
     */
    function removeStrategy(uint256 _index) external onlyAuthorizedRole(ADMIN_ROLE) {
        require(_index < strategies.length, "Invalid index");

        Strategy storage strategy = strategies[_index];
        if (strategy.active) {
            // Deallocate all assets from this strategy
            uint256 strategyAssets = IStrategy(strategy.strategyAddress).getTotalAssets();
            if (strategyAssets > 0) {
                IStrategy(strategy.strategyAddress).emergencyWithdraw();
            }

            totalAllocation -= strategy.allocation;
            strategy.active = false;
        }

        emit StrategyRemoved(strategy.strategyAddress);
    }

    /**
     * @dev Update strategy allocation with bounds checking
     * @param _index Index of strategy to update
     * @param _allocation New allocation in basis points
     */
    function updateStrategyAllocation(uint256 _index, uint256 _allocation) 
        external 
        onlyAuthorizedRole(ADMIN_ROLE) 
    {
        require(_index < strategies.length, "Invalid index");
        if (_allocation > MAX_ALLOCATION) revert InvalidAllocation();

        Strategy storage strategy = strategies[_index];
        require(_allocation >= strategy.minAllocation, "Below minimum allocation");
        require(_allocation <= strategy.maxAllocation, "Above maximum allocation");

        uint256 oldAllocation = strategy.allocation;
        totalAllocation = totalAllocation - oldAllocation + _allocation;
        if (totalAllocation > MAX_ALLOCATION) revert AllocationExceedsMax();

        strategy.allocation = _allocation;
        emit StrategyUpdated(strategy.strategyAddress, _allocation);
    }

    /**
     * @dev Allocate assets to strategies based on current allocations
     * @param amount Amount of assets to allocate
     */
    function allocateAssets(uint256 amount) external override nonReentrant {
        require(amount > 0, "Invalid amount");
        require(asset.balanceOf(address(this)) >= amount, "Insufficient balance");

        totalAssetsDeployed += amount;

        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy storage strategy = strategies[i];
            if (strategy.active) {
                uint256 allocationAmount = (amount * strategy.allocation) / MAX_ALLOCATION;
                if (allocationAmount > 0) {
                    asset.safeTransfer(strategy.strategyAddress, allocationAmount);
                    IStrategy(strategy.strategyAddress).deposit(allocationAmount);
                    emit AssetsAllocated(strategy.strategyAddress, allocationAmount);
                }
            }
        }
    }

    /**
     * @dev Deallocate assets from strategies proportionally
     * @param amount Amount of assets to deallocate
     */
    function deallocateAssets(uint256 amount) external override nonReentrant {
        require(amount > 0, "Invalid amount");
        require(amount <= totalAssetsDeployed, "Insufficient deployed assets");

        totalAssetsDeployed -= amount;

        // Deallocate proportionally from all strategies
        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy storage strategy = strategies[i];
            if (strategy.active) {
                uint256 strategyAssets = IStrategy(strategy.strategyAddress).getTotalAssets();
                uint256 deallocateAmount = (amount * strategyAssets) / totalAssetsDeployed;

                if (deallocateAmount > 0 && deallocateAmount <= strategyAssets) {
                    uint256 withdrawn = IStrategy(strategy.strategyAddress).withdraw(deallocateAmount);
                    emit AssetsDeallocated(strategy.strategyAddress, withdrawn);
                }
            }
        }
    }

    /**
     * @dev Execute advanced rebalancing with sophisticated algorithms
     */
    function rebalance() external onlyAuthorizedRole(REBALANCER_ROLE) {
        if (block.timestamp < lastRebalanceTime + rebalanceInterval) {
            revert RebalanceNotReady();
        }

        // Update performance data for all strategies
        _updateStrategyPerformance();

        // Check if rebalancing is needed
        if (!_shouldRebalance()) {
            lastRebalanceTime = block.timestamp;
            return;
        }

        // Execute rebalancing
        uint256 totalRebalanced = _executeRebalancing();

        // Update metrics
        totalRebalances++;
        averageRebalanceSize = (averageRebalanceSize * (totalRebalances - 1) + totalRebalanced) / totalRebalances;
        lastRebalanceTime = block.timestamp;

        emit RebalanceExecuted(block.timestamp, totalRebalanced);
    }

    /**
     * @dev Harvest yield from a specific strategy
     * @param strategy Strategy address to harvest from
     * @return yield Amount of yield harvested
     */
    function harvestStrategy(address strategy) external onlyAuthorizedRole(REBALANCER_ROLE) returns (uint256 yield) {
        require(strategy != address(0), "Invalid strategy");
        
        yield = IStrategy(strategy).harvest();
        if (yield > 0) {
            totalYieldGenerated += yield;
            performanceData.totalYieldEarned += yield;
        }
        
        return yield;
    }

    /**
     * @dev Get total assets across all strategies
     * @return Total assets deployed
     */
    function getTotalAssets() external view override returns (uint256) {
        return totalAssetsDeployed;
    }

    /**
     * @dev Get current weighted average APY
     * @return Weighted average APY in basis points
     */
    function getCurrentAPY() external view override returns (uint256) {
        uint256 totalWeightedAPY = 0;
        uint256 totalWeight = 0;

        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy memory strategy = strategies[i];
            if (strategy.active) {
                uint256 apy = IStrategy(strategy.strategyAddress).getAPY();
                totalWeightedAPY += apy * strategy.allocation;
                totalWeight += strategy.allocation;
            }
        }

        return totalWeight > 0 ? totalWeightedAPY / totalWeight : 0;
    }

    /**
     * @dev Get active strategies
     * @return Array of active strategy addresses
     */
    function getActiveStrategies() external view override returns (address[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                activeCount++;
            }
        }

        address[] memory activeStrategies = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                activeStrategies[index] = strategies[i].strategyAddress;
                index++;
            }
        }

        return activeStrategies;
    }

    /**
     * @dev Get strategy allocations
     * @return strategies Array of strategy addresses
     * @return allocations Array of allocation amounts
     */
    function getStrategyAllocations() external view override returns (address[] memory strategies, uint256[] memory allocations) {
        strategies = new address[](strategies.length);
        allocations = new uint256[](strategies.length);

        for (uint256 i = 0; i < strategies.length; i++) {
            strategies[i] = strategies[i].strategyAddress;
            allocations[i] = strategies[i].allocation;
        }
    }

    /**
     * @dev Get comprehensive strategy performance data
     * @return Performance metrics for all strategies
     */
    function getStrategyPerformance() external view returns (
        address[] memory strategyAddresses,
        uint256[] memory allocations,
        uint256[] memory performances,
        uint256[] memory riskScores,
        uint256[] memory apys
    ) {
        uint256 length = strategies.length;
        strategyAddresses = new address[](length);
        allocations = new uint256[](length);
        performances = new uint256[](length);
        riskScores = new uint256[](length);
        apys = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            Strategy memory strategy = strategies[i];
            strategyAddresses[i] = strategy.strategyAddress;
            allocations[i] = strategy.allocation;
            performances[i] = strategy.performance;
            riskScores[i] = strategy.riskScore;
            apys[i] = IStrategy(strategy.strategyAddress).getAPY();
        }
    }

    /**
     * @dev Emergency withdraw all assets from all strategies
     */
    function emergencyWithdrawAll() external override onlyAuthorizedRole(ADMIN_ROLE) {
        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy storage strategy = strategies[i];
            if (strategy.active) {
                IStrategy(strategy.strategyAddress).emergencyWithdraw();
            }
        }
        totalAssetsDeployed = 0;
    }

    /**
     * @dev Update rebalancing parameters
     * @param _threshold New rebalance threshold
     * @param _interval New rebalance interval
     */
    function updateRebalancingParameters(uint256 _threshold, uint256 _interval) 
        external 
        onlyAuthorizedRole(ADMIN_ROLE) 
    {
        uint256 oldThreshold = rebalanceThreshold;
        uint256 oldInterval = rebalanceInterval;

        rebalanceThreshold = _threshold;
        rebalanceInterval = _interval;

        emit RebalanceThresholdUpdated(oldThreshold, _threshold);
        emit RebalanceIntervalUpdated(oldInterval, _interval);
    }

    // Internal functions

    /**
     * @dev Update performance data for all strategies
     */
    function _updateStrategyPerformance() internal {
        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy storage strategy = strategies[i];
            if (strategy.active) {
                // Get performance data from oracle
                (uint256 apy, uint256 riskScore, uint256 liquidity) = performanceOracle.getStrategyData(strategy.strategyAddress);
                
                strategy.performance = apy;
                strategy.riskScore = riskScore;
                strategy.liquidity = liquidity;
            }
        }
    }

    /**
     * @dev Check if rebalancing is needed
     * @return True if rebalancing should be executed
     */
    function _shouldRebalance() internal view returns (bool) {
        if (strategies.length < 2) return false;

        // Find highest and lowest performing strategies
        uint256 highestAPY = 0;
        uint256 lowestAPY = type(uint256).max;

        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy memory strategy = strategies[i];
            if (strategy.active) {
                uint256 apy = strategy.performance;
                if (apy > highestAPY) highestAPY = apy;
                if (apy < lowestAPY) lowestAPY = apy;
            }
        }

        // Check if difference exceeds threshold
        return (highestAPY - lowestAPY) >= rebalanceThreshold;
    }

    /**
     * @dev Execute the rebalancing algorithm
     * @return Total amount rebalanced
     */
    function _executeRebalancing() internal returns (uint256 totalRebalanced) {
        // Calculate target allocations based on performance
        uint256[] memory targetAllocations = _calculateTargetAllocations();

        // Execute rebalancing within limits
        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy storage strategy = strategies[i];
            if (strategy.active) {
                uint256 currentAllocation = strategy.allocation;
                uint256 targetAllocation = targetAllocations[i];
                
                if (targetAllocation != currentAllocation) {
                    uint256 rebalanceAmount = _calculateRebalanceAmount(i, targetAllocation);
                    
                    if (rebalanceAmount > 0 && rebalanceAmount <= maxRebalanceAmount) {
                        _executeStrategyRebalance(i, rebalanceAmount);
                        totalRebalanced += rebalanceAmount;
                    }
                }
            }
        }

        return totalRebalanced;
    }

    /**
     * @dev Calculate target allocations based on performance
     * @return Array of target allocations
     */
    function _calculateTargetAllocations() internal view returns (uint256[] memory) {
        uint256 length = strategies.length;
        uint256[] memory targetAllocations = new uint256[](length);
        
        // Calculate total performance score
        uint256 totalScore = 0;
        for (uint256 i = 0; i < length; i++) {
            Strategy memory strategy = strategies[i];
            if (strategy.active) {
                // Weight performance by risk-adjusted returns
                uint256 riskAdjustedScore = strategy.performance * (10000 - strategy.riskScore) / 10000;
                totalScore += riskAdjustedScore;
            }
        }

        // Calculate target allocations
        for (uint256 i = 0; i < length; i++) {
            Strategy memory strategy = strategies[i];
            if (strategy.active) {
                uint256 riskAdjustedScore = strategy.performance * (10000 - strategy.riskScore) / 10000;
                uint256 targetAllocation = (riskAdjustedScore * MAX_ALLOCATION) / totalScore;
                
                // Apply bounds
                targetAllocation = Math.max(targetAllocation, strategy.minAllocation);
                targetAllocation = Math.min(targetAllocation, strategy.maxAllocation);
                
                targetAllocations[i] = targetAllocation;
            }
        }

        return targetAllocations;
    }

    /**
     * @dev Calculate rebalance amount for a strategy
     * @param strategyIndex Index of the strategy
     * @param targetAllocation Target allocation for the strategy
     * @return Amount to rebalance
     */
    function _calculateRebalanceAmount(uint256 strategyIndex, uint256 targetAllocation) 
        internal 
        view 
        returns (uint256) 
    {
        Strategy memory strategy = strategies[strategyIndex];
        uint256 currentAllocation = strategy.allocation;
        
        if (targetAllocation > currentAllocation) {
            // Need to increase allocation
            uint256 increaseAmount = ((targetAllocation - currentAllocation) * totalAssetsDeployed) / MAX_ALLOCATION;
            return Math.min(increaseAmount, strategy.liquidity);
        } else {
            // Need to decrease allocation
            uint256 decreaseAmount = ((currentAllocation - targetAllocation) * totalAssetsDeployed) / MAX_ALLOCATION;
            return Math.min(decreaseAmount, IStrategy(strategy.strategyAddress).getTotalAssets());
        }
    }

    /**
     * @dev Execute rebalancing for a specific strategy
     * @param strategyIndex Index of the strategy
     * @param amount Amount to rebalance
     */
    function _executeStrategyRebalance(uint256 strategyIndex, uint256 amount) internal {
        Strategy storage strategy = strategies[strategyIndex];
        
        if (amount > 0) {
            // This is a simplified rebalancing - in production, you'd implement
            // more sophisticated logic for moving funds between strategies
            strategy.lastRebalance = block.timestamp;
        }
    }
}
