// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token for testing purposes
 */
contract MockUSDT is ERC20, Ownable {
    uint8 private _decimals = 6; // USDT has 6 decimals
    
    constructor() ERC20("Mock Tether USD", "USDT") {
        // Mint 1,000,000 USDT to deployer for testing
        _mint(msg.sender, 1000000 * 10**_decimals);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function faucet() external {
        // Allow anyone to mint 1000 USDT for testing
        _mint(msg.sender, 1000 * 10**_decimals);
    }
}
