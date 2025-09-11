// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IStrategy.sol";

/**
 * @title MockAaveStrategy
 * @dev Mock Aave lending strategy for testing
 */
contract MockAaveStrategy is IStrategy, Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public asset;
    uint256 public totalDeposited;
    uint256 public totalYield;
    uint256 public baseAPY = 520; // 5.2% base APY in basis points
    uint256 public currentAPY = 520; // Current APY (can fluctuate)
    bool public active = true;
    uint256 public lastAPYUpdate;
    uint256 public apyVolatility = 50; // ±0.5% volatility
    
    event Deposited(uint256 amount);
    event Withdrawn(uint256 amount);
    event Harvested(uint256 yield);
    
    constructor(address _asset) {
        asset = IERC20(_asset);
    }
    
    function deposit(uint256 amount) external override onlyOwner {
        require(amount > 0, "Invalid amount");
        require(active, "Strategy not active");
        
        asset.safeTransferFrom(msg.sender, address(this), amount);
        totalDeposited += amount;
        
        emit Deposited(amount);
    }
    
    function withdraw(uint256 amount) external override onlyOwner returns (uint256) {
        require(amount > 0, "Invalid amount");
        require(amount <= totalDeposited, "Insufficient balance");
        
        totalDeposited -= amount;
        asset.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(amount);
        return amount;
    }
    
    function harvest() external override onlyOwner returns (uint256) {
        if (totalDeposited == 0) return 0;
        
        // Update APY before calculating yield
        this.updateAPY();
        
        // Calculate yield based on current APY (simplified daily calculation)
        uint256 dailyYield = (totalDeposited * currentAPY) / (10000 * 365);
        totalYield += dailyYield;
        
        // Mint new tokens to simulate yield (in real implementation, this would come from lending)
        // For testing, we'll just return the calculated yield
        emit Harvested(dailyYield);
        return dailyYield;
    }
    
    function getTotalAssets() external view override returns (uint256) {
        return totalDeposited + totalYield;
    }
    
    function getAPY() external view override returns (uint256) {
        return currentAPY;
    }
    
    function updateAPY() external {
        // Simulate APY fluctuation based on market conditions
        uint256 timeSinceUpdate = block.timestamp - lastAPYUpdate;
        if (timeSinceUpdate >= 1 hours) {
            // Generate pseudo-random APY fluctuation
            uint256 randomFactor = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % (apyVolatility * 2);
            int256 fluctuation = int256(randomFactor) - int256(apyVolatility);
            
            uint256 newAPY = uint256(int256(currentAPY) + fluctuation);
            
            // Ensure APY stays within reasonable bounds (1% to 15%)
            if (newAPY < 100) newAPY = 100;
            if (newAPY > 1500) newAPY = 1500;
            
            currentAPY = newAPY;
            lastAPYUpdate = block.timestamp;
        }
    }
    
    function setAPY(uint256 _apy) external onlyOwner {
        require(_apy >= 100 && _apy <= 1500, "APY out of bounds");
        currentAPY = _apy;
        lastAPYUpdate = block.timestamp;
    }
    
    function setVolatility(uint256 _volatility) external onlyOwner {
        require(_volatility <= 200, "Volatility too high");
        apyVolatility = _volatility;
    }
    
    function emergencyWithdraw() external override onlyOwner {
        if (totalDeposited > 0) {
            asset.safeTransfer(msg.sender, totalDeposited);
            totalDeposited = 0;
        }
    }
    
    function isActive() external view override returns (bool) {
        return active;
    }
    
    function setActive(bool _active) external onlyOwner {
        active = _active;
    }
}
