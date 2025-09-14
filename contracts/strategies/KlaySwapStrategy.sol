// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IYieldStrategy.sol";

/**
 * @title KlaySwapStrategy
 * @notice Yield strategy for KlaySwap liquidity provision on Kaia blockchain
 * @dev Provides yield through liquidity provision and trading fees
 */
contract KlaySwapStrategy is AccessControl, ReentrancyGuard, IYieldStrategy {
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant HARVESTER_ROLE = keccak256("HARVESTER_ROLE");

    IERC20 public immutable underlyingToken;
    IERC20 public immutable lpToken;
    address public immutable klaySwapRouter;
    address public immutable klaySwapFactory;
    address public manager;

    uint256 public totalDeposited;
    uint256 public totalShares;
    uint256 public totalFeesEarned;
    uint256 public lastHarvestTime;
    uint256 public constant HARVEST_COOLDOWN = 6 hours;

    // Strategy parameters
    string public constant STRATEGY_NAME = "KlaySwap Liquidity Strategy";
    uint256 public constant APY_BASIS_POINTS = 1200; // 12% APY
    uint256 public constant RISK_LEVEL = 3; // Medium risk (impermanent loss)
    uint256 public constant MIN_DEPOSIT = 50 * 10**6; // 50 USDT
    uint256 public constant MAX_DEPOSIT = 500000 * 10**6; // 500K USDT

    // Pair information
    address public immutable token0;
    address public immutable token1;
    uint256 public immutable fee; // Pool fee in basis points

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event Harvested(uint256 yieldAmount, uint256 timestamp);
    event LiquidityAdded(uint256 amount0, uint256 amount1, uint256 liquidity);
    event LiquidityRemoved(uint256 liquidity, uint256 amount0, uint256 amount1);

    constructor(
        address _underlyingToken,
        address _lpToken,
        address _klaySwapRouter,
        address _klaySwapFactory,
        address _token0,
        address _token1,
        uint256 _fee,
        address _manager
    ) {
        require(_underlyingToken != address(0), "Invalid underlying token");
        require(_lpToken != address(0), "Invalid LP token");
        require(_klaySwapRouter != address(0), "Invalid router");
        require(_klaySwapFactory != address(0), "Invalid factory");
        require(_manager != address(0), "Invalid manager");

        underlyingToken = IERC20(_underlyingToken);
        lpToken = IERC20(_lpToken);
        klaySwapRouter = _klaySwapRouter;
        klaySwapFactory = _klaySwapFactory;
        token0 = _token0;
        token1 = _token1;
        fee = _fee;
        manager = _manager;

        _grantRole(DEFAULT_ADMIN_ROLE, _manager);
        _grantRole(MANAGER_ROLE, _manager);
        _grantRole(HARVESTER_ROLE, _manager);

        // Approve router for token swaps and LP operations
        underlyingToken.safeApprove(klaySwapRouter, type(uint256).max);
        lpToken.safeApprove(klaySwapRouter, type(uint256).max);
    }

    modifier onlyManager() {
        require(hasRole(MANAGER_ROLE, msg.sender), "Caller is not manager");
        _;
    }

    modifier onlyHarvester() {
        require(hasRole(HARVESTER_ROLE, msg.sender), "Caller is not harvester");
        _;
    }

    modifier whenActive() {
        require(isActive(), "Strategy is not active");
        _;
    }

    /**
     * @notice Deposit tokens into KlaySwap liquidity pool
     * @param amount Amount of tokens to deposit
     * @return shares Number of LP shares received
     */
    function deposit(uint256 amount) external override onlyManager whenActive nonReentrant returns (uint256 shares) {
        require(amount >= MIN_DEPOSIT, "Amount below minimum");
        require(amount <= MAX_DEPOSIT, "Amount above maximum");
        require(totalDeposited + amount <= MAX_DEPOSIT, "Total deposits exceed maximum");

        // Transfer tokens from manager to this contract
        underlyingToken.safeTransferFrom(manager, address(this), amount);

        // Add liquidity to KlaySwap pool
        (uint256 amount0, uint256 amount1, uint256 liquidity) = _addLiquidity(amount);

        // Calculate shares based on LP tokens received
        shares = liquidity;
        totalDeposited += amount;
        totalShares += shares;

        emit Deposited(manager, amount, shares);
        emit LiquidityAdded(amount0, amount1, liquidity);
        return shares;
    }

    /**
     * @notice Withdraw tokens from KlaySwap
     * @param amount Amount to withdraw
     * @return withdrawn Actual amount withdrawn
     */
    function withdraw(uint256 amount) external override onlyManager nonReentrant returns (uint256 withdrawn) {
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= totalDeposited, "Insufficient balance");

        // Calculate LP tokens to remove
        uint256 lpTokensToRemove = (amount * totalShares) / totalDeposited;

        // Remove liquidity from KlaySwap
        (uint256 amount0, uint256 amount1) = _removeLiquidity(lpTokensToRemove);

        // Convert received tokens back to underlying token if needed
        uint256 withdrawnAmount = _convertToUnderlying(amount0, amount1);

        require(withdrawnAmount >= amount, "Withdrawn less than requested");

        totalDeposited -= amount;
        totalShares -= lpTokensToRemove;

        // Transfer withdrawn tokens back to manager
        underlyingToken.safeTransfer(manager, withdrawnAmount);

        emit Withdrawn(manager, withdrawnAmount, amount);
        emit LiquidityRemoved(lpTokensToRemove, amount0, amount1);
        return withdrawnAmount;
    }

    /**
     * @notice Harvest trading fees from KlaySwap
     * @return yieldAmount Amount of yield harvested
     */
    function harvest() external override onlyHarvester nonReentrant returns (uint256 yieldAmount) {
        require(block.timestamp >= lastHarvestTime + HARVEST_COOLDOWN, "Harvest cooldown not met");

        uint256 lpTokenBalance = lpToken.balanceOf(address(this));
        if (lpTokenBalance > totalShares) {
            uint256 feeTokens = lpTokenBalance - totalShares;
            
            // Remove fee tokens as liquidity
            (uint256 amount0, uint256 amount1) = _removeLiquidity(feeTokens);
            
            // Convert to underlying token
            yieldAmount = _convertToUnderlying(amount0, amount1);
            
            totalFeesEarned += yieldAmount;
            lastHarvestTime = block.timestamp;

            // Transfer yield to manager
            underlyingToken.safeTransfer(manager, yieldAmount);

            emit Harvested(yieldAmount, block.timestamp);
        }

        return yieldAmount;
    }

    /**
     * @notice Get current strategy balance
     * @return balance Current balance in underlying token terms
     */
    function balance() external view override returns (uint256 balance) {
        uint256 lpTokenBalance = lpToken.balanceOf(address(this));
        if (lpTokenBalance == 0) return 0;

        // Get current LP token value in underlying token terms
        (uint256 reserve0, uint256 reserve1) = _getReserves();
        uint256 totalSupply = lpToken.totalSupply();
        
        if (totalSupply == 0) return 0;

        uint256 amount0 = (lpTokenBalance * reserve0) / totalSupply;
        uint256 amount1 = (lpTokenBalance * reserve1) / totalSupply;

        // Convert to underlying token value
        return _getUnderlyingValue(amount0, amount1);
    }

    /**
     * @notice Get strategy information
     */
    function getStrategyInfo() external pure override returns (
        string memory name,
        uint256 apy,
        uint256 riskLevel,
        uint256 minDeposit,
        uint256 maxDeposit
    ) {
        return (STRATEGY_NAME, APY_BASIS_POINTS, RISK_LEVEL, MIN_DEPOSIT, MAX_DEPOSIT);
    }

    /**
     * @notice Check if strategy is active
     * @return isActive True if strategy is active
     */
    function isActive() public view override returns (bool isActive) {
        return totalDeposited < MAX_DEPOSIT;
    }

    /**
     * @notice Get underlying token address
     * @return token Address of underlying token
     */
    function getUnderlyingToken() external view override returns (address token) {
        return address(underlyingToken);
    }

    /**
     * @notice Get current APY based on recent trading activity
     * @return currentApy Current APY in basis points
     */
    function getCurrentApy() external view returns (uint256 currentApy) {
        // In real implementation, this would calculate APY based on recent trading volume
        return APY_BASIS_POINTS;
    }

    /**
     * @notice Get total fees earned
     * @return totalFees Total fees earned since inception
     */
    function getTotalFees() external view returns (uint256 totalFees) {
        return totalFeesEarned;
    }

    /**
     * @notice Internal function to add liquidity
     */
    function _addLiquidity(uint256 amount) internal returns (uint256 amount0, uint256 amount1, uint256 liquidity) {
        // For simplicity, assuming single-sided liquidity provision
        // Real implementation would handle token0/token1 pairs properly
        amount0 = amount;
        amount1 = 0; // Assuming we're providing single token liquidity
        
        // Add liquidity through router
        (amount0, amount1, liquidity) = IKlaySwapRouter(klaySwapRouter).addLiquidity(
            token0,
            token1,
            amount0,
            amount1,
            0, // Slippage tolerance
            0, // Slippage tolerance
            address(this),
            block.timestamp + 300
        );
    }

    /**
     * @notice Internal function to remove liquidity
     */
    function _removeLiquidity(uint256 lpTokens) internal returns (uint256 amount0, uint256 amount1) {
        (amount0, amount1) = IKlaySwapRouter(klaySwapRouter).removeLiquidity(
            token0,
            token1,
            lpTokens,
            0, // Slippage tolerance
            0, // Slippage tolerance
            address(this),
            block.timestamp + 300
        );
    }

    /**
     * @notice Internal function to convert tokens to underlying
     */
    function _convertToUnderlying(uint256 amount0, uint256 amount1) internal returns (uint256 underlyingAmount) {
        // Convert token0 and token1 to underlying token
        if (amount0 > 0 && token0 != address(underlyingToken)) {
            uint256 converted = _swapToken(token0, address(underlyingToken), amount0);
            underlyingAmount += converted;
        } else if (amount0 > 0) {
            underlyingAmount += amount0;
        }

        if (amount1 > 0 && token1 != address(underlyingToken)) {
            uint256 converted = _swapToken(token1, address(underlyingToken), amount1);
            underlyingAmount += converted;
        } else if (amount1 > 0) {
            underlyingAmount += amount1;
        }
    }

    /**
     * @notice Internal function to swap tokens
     */
    function _swapToken(address tokenIn, address tokenOut, uint256 amountIn) internal returns (uint256 amountOut) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        uint256[] memory amounts = IKlaySwapRouter(klaySwapRouter).swapExactTokensForTokens(
            amountIn,
            0, // Accept any amount out
            path,
            address(this),
            block.timestamp + 300
        );

        return amounts[amounts.length - 1];
    }

    /**
     * @notice Internal function to get reserves
     */
    function _getReserves() internal view returns (uint256 reserve0, uint256 reserve1) {
        (reserve0, reserve1,) = IKlaySwapPair(address(lpToken)).getReserves();
    }

    /**
     * @notice Internal function to get underlying value
     */
    function _getUnderlyingValue(uint256 amount0, uint256 amount1) internal view returns (uint256 value) {
        // Simplified calculation - in real implementation would use price oracles
        if (token0 == address(underlyingToken)) {
            value = amount0;
        } else if (token1 == address(underlyingToken)) {
            value = amount1;
        } else {
            // Would need price conversion here
            value = amount0 + amount1; // Simplified
        }
    }
}

interface IKlaySwapRouter {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

interface IKlaySwapPair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}



