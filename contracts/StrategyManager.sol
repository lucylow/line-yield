// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IStrategy.sol";
import "./interfaces/IStrategyManager.sol";

/**
 * @title StrategyManager
 * @dev Manages allocation of funds across different yield strategies
 */
contract StrategyManager is IStrategyManager, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Strategy {
        address strategyAddress;
        uint256 allocation; // Basis points (10000 = 100%)
        uint256 performance;
        bool active;
        uint256 lastRebalance;
    }

    // Strategy management
    Strategy[] public strategies;
    uint256 public totalAllocation;
    uint256 public constant MAX_ALLOCATION = 10000; // 100%
    
    // Asset management
    IERC20 public asset;
    uint256 public totalAssetsDeployed;
    
    // Rebalancing
    uint256 public rebalanceThreshold = 500; // 5% threshold for rebalancing
    uint256 public lastRebalanceTime;
    uint256 public rebalanceInterval = 1 days;
    
    // Events
    event StrategyAdded(address indexed strategy, uint256 allocation);
    event StrategyRemoved(address indexed strategy);
    event StrategyUpdated(address indexed strategy, uint256 allocation);
    event AssetsAllocated(address indexed strategy, uint256 amount);
    event AssetsDeallocated(address indexed strategy, uint256 amount);
    event RebalanceExecuted(uint256 timestamp);
    
    // Errors
    error InvalidStrategy();
    error InvalidAllocation();
    error AllocationExceedsMax();
    error StrategyNotActive();
    error InsufficientAssets();
    error RebalanceNotReady();
    
    constructor(address _asset) {
        asset = IERC20(_asset);
    }
    
    /**
     * @dev Add a new strategy
     * @param _strategy Strategy contract address
     * @param _allocation Allocation in basis points
     */
    function addStrategy(address _strategy, uint256 _allocation) external onlyOwner {
        if (_strategy == address(0)) revert InvalidStrategy();
        if (_allocation == 0 || _allocation > MAX_ALLOCATION) revert InvalidAllocation();
        if (totalAllocation + _allocation > MAX_ALLOCATION) revert AllocationExceedsMax();
        
        strategies.push(Strategy({
            strategyAddress: _strategy,
            allocation: _allocation,
            performance: 0,
            active: true,
            lastRebalance: block.timestamp
        }));
        
        totalAllocation += _allocation;
        emit StrategyAdded(_strategy, _allocation);
    }
    
    /**
     * @dev Remove a strategy
     * @param _index Index of strategy to remove
     */
    function removeStrategy(uint256 _index) external onlyOwner {
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
     * @dev Update strategy allocation
     * @param _index Index of strategy to update
     * @param _allocation New allocation in basis points
     */
    function updateStrategyAllocation(uint256 _index, uint256 _allocation) external onlyOwner {
        require(_index < strategies.length, "Invalid index");
        if (_allocation > MAX_ALLOCATION) revert InvalidAllocation();
        
        Strategy storage strategy = strategies[_index];
        uint256 oldAllocation = strategy.allocation;
        
        totalAllocation = totalAllocation - oldAllocation + _allocation;
        if (totalAllocation > MAX_ALLOCATION) revert AllocationExceedsMax();
        
        strategy.allocation = _allocation;
        emit StrategyUpdated(strategy.strategyAddress, _allocation);
    }
    
    /**
     * @dev Allocate assets to strategies based on their allocations
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
     * @dev Deallocate assets from strategies
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
     * @dev Execute rebalancing based on performance
     */
    function rebalance() external {
        if (block.timestamp < lastRebalanceTime + rebalanceInterval) {
            revert RebalanceNotReady();
        }
        
        // Calculate performance for each strategy
        uint256[] memory currentAPYs = new uint256[](strategies.length);
        uint256 totalAPY = 0;
        uint256 activeStrategies = 0;
        
        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy storage strategy = strategies[i];
            if (strategy.active) {
                currentAPYs[i] = IStrategy(strategy.strategyAddress).getAPY();
                totalAPY += currentAPYs[i];
                activeStrategies++;
                strategy.performance = currentAPYs[i];
            }
        }
        
        require(totalAPY > 0, "No active strategies with valid APY");
        require(activeStrategies > 1, "Need at least 2 strategies for rebalancing");
        
        // Check if rebalancing is needed based on threshold
        bool needsRebalance = _checkRebalanceNeeded(currentAPYs, totalAPY);
        
        if (needsRebalance) {
            _executeRebalance(currentAPYs, totalAPY);
        }
        
        lastRebalanceTime = block.timestamp;
        emit RebalanceExecuted(block.timestamp);
    }
    
    /**
     * @dev Check if rebalancing is needed based on threshold
     */
    function _checkRebalanceNeeded(uint256[] memory currentAPYs, uint256 totalAPY) internal view returns (bool) {
        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy memory strategy = strategies[i];
            if (!strategy.active) continue;
            
            uint256 targetAllocation = (currentAPYs[i] * MAX_ALLOCATION) / totalAPY;
            uint256 currentAllocation = strategy.allocation;
            
            // Check if difference exceeds threshold
            if (targetAllocation > currentAllocation + rebalanceThreshold || 
                targetAllocation < currentAllocation - rebalanceThreshold) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Execute the actual rebalancing
     */
    function _executeRebalance(uint256[] memory currentAPYs, uint256 totalAPY) internal {
        uint256 totalAssetsValue = totalAssetsDeployed;
        require(totalAssetsValue > 0, "No assets to rebalance");
        
        // Calculate target allocations
        uint256[] memory targetAllocations = new uint256[](strategies.length);
        uint256 totalTargetAllocation = 0;
        
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                targetAllocations[i] = (currentAPYs[i] * MAX_ALLOCATION) / totalAPY;
                totalTargetAllocation += targetAllocations[i];
            }
        }
        
        // Normalize allocations to ensure they sum to 100%
        if (totalTargetAllocation != MAX_ALLOCATION) {
            for (uint256 i = 0; i < strategies.length; i++) {
                if (strategies[i].active) {
                    targetAllocations[i] = (targetAllocations[i] * MAX_ALLOCATION) / totalTargetAllocation;
                }
            }
        }
        
        // Execute rebalancing
        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy storage strategy = strategies[i];
            if (!strategy.active) continue;
            
            uint256 targetAllocation = targetAllocations[i];
            uint256 currentAllocation = strategy.allocation;
            
            if (targetAllocation > currentAllocation + rebalanceThreshold) {
                // This strategy should receive more funds
                uint256 amountToAdd = (targetAllocation - currentAllocation) * totalAssetsValue / MAX_ALLOCATION;
                if (amountToAdd > 0) {
                    _allocateToStrategy(i, amountToAdd);
                }
            } else if (targetAllocation < currentAllocation - rebalanceThreshold) {
                // This strategy should have funds reduced
                uint256 amountToRemove = (currentAllocation - targetAllocation) * totalAssetsValue / MAX_ALLOCATION;
                if (amountToRemove > 0) {
                    _deallocateFromStrategy(i, amountToRemove);
                }
            }
            
            // Update allocation
            strategy.allocation = targetAllocation;
        }
    }
    
    /**
     * @dev Internal function to allocate funds to a specific strategy
     */
    function _allocateToStrategy(uint256 _index, uint256 _amount) internal {
        Strategy storage strategy = strategies[_index];
        require(asset.balanceOf(address(this)) >= _amount, "Insufficient asset balance");
        
        asset.safeTransfer(strategy.strategyAddress, _amount);
        IStrategy(strategy.strategyAddress).deposit(_amount);
        emit AssetsAllocated(strategy.strategyAddress, _amount);
    }
    
    /**
     * @dev Internal function to deallocate funds from a specific strategy
     */
    function _deallocateFromStrategy(uint256 _index, uint256 _amount) internal {
        Strategy storage strategy = strategies[_index];
        uint256 strategyAssets = IStrategy(strategy.strategyAddress).getTotalAssets();
        
        // Only withdraw what's available
        uint256 amountToWithdraw = _amount > strategyAssets ? strategyAssets : _amount;
        
        if (amountToWithdraw > 0) {
            uint256 withdrawn = IStrategy(strategy.strategyAddress).withdraw(amountToWithdraw);
            emit AssetsDeallocated(strategy.strategyAddress, withdrawn);
        }
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
     * @dev Emergency withdraw all assets from all strategies
     */
    function emergencyWithdrawAll() external override onlyOwner {
        for (uint256 i = 0; i < strategies.length; i++) {
            Strategy storage strategy = strategies[i];
            if (strategy.active) {
                IStrategy(strategy.strategyAddress).emergencyWithdraw();
            }
        }
        totalAssetsDeployed = 0;
    }
    
    /**
     * @dev Set rebalance threshold
     * @param _threshold New threshold in basis points
     */
    function setRebalanceThreshold(uint256 _threshold) external onlyOwner {
        rebalanceThreshold = _threshold;
    }
    
    /**
     * @dev Set rebalance interval
     * @param _interval New interval in seconds
     */
    function setRebalanceInterval(uint256 _interval) external onlyOwner {
        rebalanceInterval = _interval;
    }
    
    /**
     * @dev Check if rebalancing can be executed
     * @return True if rebalancing is ready
     */
    function canRebalance() external view returns (bool) {
        return block.timestamp >= lastRebalanceTime + rebalanceInterval;
    }
    
    /**
     * @dev Get next rebalance time
     * @return Timestamp when next rebalancing can occur
     */
    function getNextRebalanceTime() external view returns (uint256) {
        return lastRebalanceTime + rebalanceInterval;
    }
    
    /**
     * @dev Get strategy performance data
     * @return strategies Array of strategy addresses
     * @return apys Array of current APYs
     * @return allocations Array of current allocations
     * @return performances Array of performance scores
     */
    function getStrategyPerformance() external view returns (
        address[] memory strategies,
        uint256[] memory apys,
        uint256[] memory allocations,
        uint256[] memory performances
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                activeCount++;
            }
        }
        
        strategies = new address[](activeCount);
        apys = new uint256[](activeCount);
        allocations = new uint256[](activeCount);
        performances = new uint256[](activeCount);
        
        uint256 index = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                strategies[index] = strategies[i].strategyAddress;
                apys[index] = IStrategy(strategies[i].strategyAddress).getAPY();
                allocations[index] = strategies[i].allocation;
                performances[index] = strategies[i].performance;
                index++;
            }
        }
    }
    
    /**
     * @dev Get rebalancing statistics
     * @return lastRebalanceTime Last rebalance timestamp
     * @return nextRebalanceTime Next rebalance timestamp
     * @return rebalanceThreshold Current threshold
     * @return rebalanceInterval Current interval
     */
    function getRebalancingStats() external view returns (
        uint256 lastRebalanceTime,
        uint256 nextRebalanceTime,
        uint256 rebalanceThreshold,
        uint256 rebalanceInterval
    ) {
        return (
            lastRebalanceTime,
            lastRebalanceTime + rebalanceInterval,
            rebalanceThreshold,
            rebalanceInterval
        );
    }
}
