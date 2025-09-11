// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IStrategy.sol";

/**
 * @title MockKlaySwapStrategy
 * @dev Mock KlaySwap liquidity pool strategy for testing
 */
contract MockKlaySwapStrategy is IStrategy, Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public asset;
    uint256 public totalDeposited;
    uint256 public totalYield;
    uint256 public constant APY = 1250; // 12.5% APY in basis points
    bool public active = true;
    
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
        
        // Calculate yield based on APY (simplified daily calculation)
        uint256 dailyYield = (totalDeposited * APY) / (10000 * 365);
        totalYield += dailyYield;
        
        // Mint new tokens to simulate yield (in real implementation, this would come from LP rewards)
        // For testing, we'll just return the calculated yield
        emit Harvested(dailyYield);
        return dailyYield;
    }
    
    function getTotalAssets() external view override returns (uint256) {
        return totalDeposited + totalYield;
    }
    
    function getAPY() external view override returns (uint256) {
        return APY;
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
