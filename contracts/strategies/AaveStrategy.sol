// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IYieldStrategy.sol";

/**
 * @title AaveStrategy
 * @notice Yield strategy integration with Aave-like lending protocol on Kaia blockchain
 * @dev Provides lending-based yield through Aave protocol integration
 */
contract AaveStrategy is AccessControl, ReentrancyGuard, IYieldStrategy {
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant HARVESTER_ROLE = keccak256("HARVESTER_ROLE");

    IERC20 public immutable underlyingToken;
    IERC20 public immutable aToken;
    address public immutable aaveLendingPool;
    address public immutable aaveIncentivesController;
    address public manager;

    uint256 public totalDeposited;
    uint256 public totalShares;
    uint256 public lastHarvestTime;
    uint256 public constant HARVEST_COOLDOWN = 1 hours;

    // Strategy parameters
    string public constant STRATEGY_NAME = "Aave Lending Strategy";
    uint256 public constant APY_BASIS_POINTS = 850; // 8.5% APY
    uint256 public constant RISK_LEVEL = 2; // Low-medium risk
    uint256 public constant MIN_DEPOSIT = 100 * 10**6; // 100 USDT (6 decimals)
    uint256 public constant MAX_DEPOSIT = 1000000 * 10**6; // 1M USDT

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event Harvested(uint256 yieldAmount, uint256 timestamp);
    event StrategyPaused(bool paused);

    constructor(
        address _underlyingToken,
        address _aToken,
        address _aaveLendingPool,
        address _aaveIncentivesController,
        address _manager
    ) {
        require(_underlyingToken != address(0), "Invalid underlying token");
        require(_aToken != address(0), "Invalid aToken");
        require(_aaveLendingPool != address(0), "Invalid lending pool");
        require(_manager != address(0), "Invalid manager");

        underlyingToken = IERC20(_underlyingToken);
        aToken = IERC20(_aToken);
        aaveLendingPool = _aaveLendingPool;
        aaveIncentivesController = _aaveIncentivesController;
        manager = _manager;

        _grantRole(DEFAULT_ADMIN_ROLE, _manager);
        _grantRole(MANAGER_ROLE, _manager);
        _grantRole(HARVESTER_ROLE, _manager);

        // Approve max allowance to Aave lending pool
        underlyingToken.safeApprove(aaveLendingPool, type(uint256).max);
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
     * @notice Deposit tokens into Aave lending pool
     * @param amount Amount of tokens to deposit
     * @return shares Number of shares received
     */
    function deposit(uint256 amount) external override onlyManager whenActive nonReentrant returns (uint256 shares) {
        require(amount >= MIN_DEPOSIT, "Amount below minimum");
        require(amount <= MAX_DEPOSIT, "Amount above maximum");
        require(totalDeposited + amount <= MAX_DEPOSIT, "Total deposits exceed maximum");

        // Transfer tokens from manager to this contract
        underlyingToken.safeTransferFrom(manager, address(this), amount);

        // Deposit into Aave lending pool
        IAaveLendingPool(aaveLendingPool).deposit(
            address(underlyingToken),
            amount,
            address(this),
            0 // No referral code
        );

        // Calculate shares (1:1 for simplicity, real implementation would use exchange rate)
        shares = amount;
        totalDeposited += amount;
        totalShares += shares;

        emit Deposited(manager, amount, shares);
        return shares;
    }

    /**
     * @notice Withdraw tokens from Aave
     * @param amount Amount to withdraw
     * @return withdrawn Actual amount withdrawn
     */
    function withdraw(uint256 amount) external override onlyManager nonReentrant returns (uint256 withdrawn) {
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= totalDeposited, "Insufficient balance");

        // Withdraw from Aave lending pool
        uint256 withdrawnAmount = IAaveLendingPool(aaveLendingPool).withdraw(
            address(underlyingToken),
            amount,
            address(this)
        );

        require(withdrawnAmount >= amount, "Withdrawn less than requested");

        totalDeposited -= amount;
        totalShares -= amount;

        // Transfer withdrawn tokens back to manager
        underlyingToken.safeTransfer(manager, withdrawnAmount);

        emit Withdrawn(manager, withdrawnAmount, amount);
        return withdrawnAmount;
    }

    /**
     * @notice Harvest yield from Aave
     * @return yieldAmount Amount of yield harvested
     */
    function harvest() external override onlyHarvester nonReentrant returns (uint256 yieldAmount) {
        require(block.timestamp >= lastHarvestTime + HARVEST_COOLDOWN, "Harvest cooldown not met");

        uint256 currentBalance = aToken.balanceOf(address(this));
        uint256 expectedBalance = totalDeposited;

        if (currentBalance > expectedBalance) {
            yieldAmount = currentBalance - expectedBalance;

            // Withdraw yield from Aave
            IAaveLendingPool(aaveLendingPool).withdraw(
                address(underlyingToken),
                yieldAmount,
                address(this)
            );

            // Transfer yield to manager
            underlyingToken.safeTransfer(manager, yieldAmount);

            lastHarvestTime = block.timestamp;
            emit Harvested(yieldAmount, block.timestamp);
        }

        return yieldAmount;
    }

    /**
     * @notice Get current strategy balance
     * @return balance Current balance in underlying token terms
     */
    function balance() external view override returns (uint256 balance) {
        return aToken.balanceOf(address(this));
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
        // Strategy is active if it has available capacity
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
     * @notice Get current APY (can be updated based on Aave rates)
     * @return currentApy Current APY in basis points
     */
    function getCurrentApy() external view returns (uint256 currentApy) {
        // In real implementation, this would query Aave for current lending rate
        return APY_BASIS_POINTS;
    }

    /**
     * @notice Get total yield earned
     * @return totalYield Total yield earned since inception
     */
    function getTotalYield() external view returns (uint256 totalYield) {
        uint256 currentBalance = aToken.balanceOf(address(this));
        if (currentBalance > totalDeposited) {
            return currentBalance - totalDeposited;
        }
        return 0;
    }

    /**
     * @notice Emergency pause function
     * @param paused True to pause, false to unpause
     */
    function setPaused(bool paused) external onlyManager {
        // Implementation would pause/unpause strategy
        emit StrategyPaused(paused);
    }
}

interface IAaveLendingPool {
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
}

interface IAaveIncentivesController {
    function claimRewards(
        address[] calldata assets,
        uint256 amount,
        address to
    ) external returns (uint256);
}



