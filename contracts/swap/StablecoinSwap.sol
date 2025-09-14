// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IERC20Decimals {
    function decimals() external view returns (uint8);
}

// Generic DEX Router Interface (compatible with KlaySwap, UniswapV2)
interface IDexRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external view returns (uint256[] memory amounts);
}

/// @title StablecoinSwap for Kaia Wave Stablecoin DeFi
/// @notice Secure stablecoin swapping with slippage protection
/// @dev Integrates with Kaia DEX routers for optimal pricing
contract StablecoinSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IDexRouter public dexRouter;
    
    // Supported stablecoins
    mapping(address => bool) public supportedStablecoins;
    mapping(address => uint8) public tokenDecimals;
    
    // Swap fee (basis points, e.g., 30 = 0.3%)
    uint256 public swapFeeBps = 30;
    address public feeRecipient;
    
    // Maximum slippage protection (basis points)
    uint256 public maxSlippageBps = 500; // 5%
    
    event DexRouterUpdated(address indexed newDexRouter);
    event StablecoinSupported(address indexed stablecoin, bool supported);
    event StablecoinSwapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeAmount
    );
    event SwapFeeUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address indexed newRecipient);

    constructor(address _dexRouter, address _feeRecipient) {
        require(_dexRouter != address(0), "Invalid DEX router");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        dexRouter = IDexRouter(_dexRouter);
        feeRecipient = _feeRecipient;
    }

    /// @notice Set supported stablecoin
    function setSupportedStablecoin(address stablecoin, bool enabled) external onlyOwner {
        require(stablecoin != address(0), "Invalid token address");
        supportedStablecoins[stablecoin] = enabled;
        
        if (enabled) {
            try IERC20Decimals(stablecoin).decimals() returns (uint8 decimals) {
                tokenDecimals[stablecoin] = decimals;
            } catch {
                tokenDecimals[stablecoin] = 18; // Default to 18 decimals
            }
        }
        
        emit StablecoinSupported(stablecoin, enabled);
    }

    /// @notice Update DEX router
    function setDexRouter(address newDexRouter) external onlyOwner {
        require(newDexRouter != address(0), "Invalid DEX router");
        dexRouter = IDexRouter(newDexRouter);
        emit DexRouterUpdated(newDexRouter);
    }

    /// @notice Update swap fee
    function setSwapFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        swapFeeBps = newFeeBps;
        emit SwapFeeUpdated(newFeeBps);
    }

    /// @notice Update fee recipient
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    /// @notice Swap stablecoins with slippage protection
    function swapStablecoins(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline,
        uint256 maxSlippageBpsOverride
    ) external nonReentrant {
        require(supportedStablecoins[tokenIn], "Input token not supported");
        require(supportedStablecoins[tokenOut], "Output token not supported");
        require(amountIn > 0, "Amount must be > 0");
        require(tokenIn != tokenOut, "Tokens must differ");
        require(deadline >= block.timestamp, "Deadline expired");
        
        // Use override slippage if provided, otherwise use default
        uint256 slippageBps = maxSlippageBpsOverride > 0 ? maxSlippageBpsOverride : maxSlippageBps;
        require(slippageBps <= 1000, "Slippage too high"); // Max 10%

        // Transfer tokens from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Calculate and collect swap fee
        uint256 feeAmount = (amountIn * swapFeeBps) / 10000;
        uint256 swapAmount = amountIn - feeAmount;
        
        if (feeAmount > 0) {
            IERC20(tokenIn).safeTransfer(feeRecipient, feeAmount);
        }

        // Approve router if needed
        _approveTokenIfNeeded(tokenIn, swapAmount);

        // Build swap path
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        // Execute swap
        uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
            swapAmount,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );

        uint256 amountOut = amounts[amounts.length - 1];
        
        emit StablecoinSwapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut, feeAmount);
    }

    /// @notice Estimate swap output with fee consideration
    function estimateSwapOutput(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 estimatedAmountOut, uint256 feeAmount) {
        require(supportedStablecoins[tokenIn], "Input token not supported");
        require(supportedStablecoins[tokenOut], "Output token not supported");
        require(amountIn > 0, "Amount must be > 0");

        // Calculate fee
        feeAmount = (amountIn * swapFeeBps) / 10000;
        uint256 swapAmount = amountIn - feeAmount;

        // Get DEX estimate
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        uint256[] memory amountsOut = dexRouter.getAmountsOut(swapAmount, path);
        estimatedAmountOut = amountsOut[amountsOut.length - 1];
    }

    /// @notice Get optimal swap path (can be extended for multi-hop swaps)
    function getSwapPath(address tokenIn, address tokenOut) 
        external 
        pure 
        returns (address[] memory path) 
    {
        path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
    }

    /// @notice Emergency function to recover stuck tokens
    function emergencyRecover(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    /// @dev Internal helper to approve DEX router
    function _approveTokenIfNeeded(address token, uint256 amount) internal {
        IERC20 erc20 = IERC20(token);
        uint256 currentAllowance = erc20.allowance(address(this), address(dexRouter));
        
        if (currentAllowance < amount) {
            erc20.safeApprove(address(dexRouter), 0);
            erc20.safeApprove(address(dexRouter), type(uint256).max);
        }
    }
}



