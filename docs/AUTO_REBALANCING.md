# Auto-Rebalancing System for LINE Yield Protocol

## Overview

The LINE Yield Protocol features a sophisticated auto-rebalancing system that automatically moves funds between different yield strategies to maximize returns while maintaining risk diversification. This system continuously monitors strategy performance and rebalances allocations based on real-time APY data.

## Architecture

### Smart Contracts

#### StrategyManager.sol
The main contract that manages auto-rebalancing functionality:

- **Strategy Management**: Add, remove, and update yield strategies
- **Auto-Rebalancing**: Automatically rebalance funds based on performance
- **Threshold-Based Rebalancing**: Only rebalance when performance differences exceed configurable thresholds
- **Gas Optimization**: Includes cooldown periods to prevent excessive rebalancing

Key Functions:
```solidity
function rebalance() external; // Execute rebalancing
function addStrategy(address _strategy, uint256 _allocation, string memory _name) external;
function canRebalance() external view returns (bool);
function getStrategyPerformance() external view returns (...);
```

#### IStrategy.sol
Standardized interface for yield strategies:

```solidity
interface IStrategy {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external returns (uint256);
    function harvest() external returns (uint256);
    function getTotalAssets() external view returns (uint256);
    function getAPY() external view returns (uint256);
    function emergencyWithdraw() external;
    function isActive() external view returns (bool);
}
```

### Mock Strategies

#### MockAaveStrategy.sol
- **Base APY**: 5.2%
- **Volatility**: ±0.5%
- **APY Range**: 1% - 15%
- **Features**: Dynamic APY fluctuation simulation

#### MockKlaySwapStrategy.sol
- **Base APY**: 12.5%
- **Volatility**: ±1%
- **APY Range**: 5% - 25%
- **Features**: Higher volatility for LP strategies

#### MockCompoundStrategy.sol
- **Base APY**: 7.8%
- **Volatility**: ±0.75%
- **APY Range**: 3% - 12%
- **Features**: Medium volatility lending strategy

### Rebalancing Service

#### Node.js Service (scripts/rebalancing-service.js)
Automated service that monitors and executes rebalancing:

**Features:**
- **Scheduled Rebalancing**: Runs on configurable cron schedule
- **Health Monitoring**: Continuous health checks
- **Gas Optimization**: Dynamic gas price adjustment
- **Error Handling**: Comprehensive error handling and logging
- **Performance Tracking**: Detailed performance metrics

**Configuration:**
```javascript
const config = {
    kaiaRpcUrl: 'https://api.kaia.klaytn.net',
    strategyManagerAddress: '0x...',
    privateKey: '0x...',
    rebalanceInterval: '0 * * * *', // Every hour
    threshold: 50, // 0.5% threshold
    gasLimit: 500000,
    gasMultiplier: 1.2
};
```

### React Components

#### StrategyAllocation.tsx
Enhanced component for displaying auto-rebalancing information:

**Features:**
- **Real-time Status**: Shows last and next rebalance times
- **Performance Indicators**: Visual indicators for strategy performance
- **Rebalancing Controls**: Manual rebalancing trigger
- **Alert System**: Notifications when rebalancing is needed

## How It Works

### 1. Performance Monitoring
The system continuously monitors the APY of all active strategies:

```solidity
for (uint256 i = 0; i < strategies.length; i++) {
    if (strategies[i].active) {
        currentAPYs[i] = IStrategy(strategies[i].strategyAddress).getAPY();
        totalAPY += currentAPYs[i];
    }
}
```

### 2. Threshold Check
Rebalancing only occurs when performance differences exceed the threshold:

```solidity
uint256 targetAllocation = (currentAPYs[i] * MAX_ALLOCATION) / totalAPY;
uint256 currentAllocation = strategies[i].allocation;

if (targetAllocation > currentAllocation + rebalanceThreshold || 
    targetAllocation < currentAllocation - rebalanceThreshold) {
    needsRebalance = true;
}
```

### 3. Rebalancing Execution
When rebalancing is needed, funds are moved between strategies:

```solidity
if (targetAllocation > currentAllocation + rebalanceThreshold) {
    // Move funds to higher-performing strategy
    uint256 amountToAdd = (targetAllocation - currentAllocation) * totalAssetsValue / MAX_ALLOCATION;
    _allocateToStrategy(i, amountToAdd);
} else if (targetAllocation < currentAllocation - rebalanceThreshold) {
    // Move funds from lower-performing strategy
    uint256 amountToRemove = (currentAllocation - targetAllocation) * totalAssetsValue / MAX_ALLOCATION;
    _deallocateFromStrategy(i, amountToRemove);
}
```

## Configuration

### Rebalancing Parameters

- **Threshold**: Minimum performance difference to trigger rebalancing (default: 0.5%)
- **Cooldown**: Minimum time between rebalancing operations (default: 1 hour)
- **Gas Limit**: Maximum gas for rebalancing transactions
- **Gas Multiplier**: Gas price multiplier for transaction priority

### Strategy Parameters

Each strategy can be configured with:
- **Base APY**: Initial APY value
- **Volatility**: APY fluctuation range
- **APY Bounds**: Minimum and maximum APY limits
- **Update Frequency**: How often APY can be updated

## Security Features

### Access Control
- **Owner-Only Functions**: Critical functions restricted to contract owner
- **Strategy Validation**: Comprehensive validation of strategy addresses
- **Allocation Limits**: Prevents over-allocation of funds

### Reentrancy Protection
- **ReentrancyGuard**: Prevents reentrancy attacks
- **SafeERC20**: Safe token transfer operations

### Emergency Functions
- **Emergency Withdraw**: Immediate withdrawal from all strategies
- **Strategy Deactivation**: Ability to disable strategies
- **Pause Functionality**: Ability to pause rebalancing

## Monitoring and Analytics

### Performance Metrics
- **Strategy Performance**: Individual strategy APY and allocation
- **Rebalancing Frequency**: How often rebalancing occurs
- **Gas Usage**: Gas consumption for rebalancing operations
- **Success Rate**: Percentage of successful rebalancing operations

### Health Checks
- **Network Connectivity**: Kaia network connection status
- **Contract Accessibility**: Strategy manager contract availability
- **Strategy Status**: Individual strategy health monitoring

## Deployment

### Prerequisites
1. Node.js 16+
2. Hardhat development environment
3. Kaia network access
4. Private key for rebalancing service

### Steps
1. **Deploy Contracts**:
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.ts --network kaia
   ```

2. **Configure Service**:
   ```bash
   cd scripts
   cp config.example.js config.js
   # Update configuration with actual values
   ```

3. **Start Service**:
   ```bash
   npm install
   npm start
   ```

4. **Add Strategies**:
   ```solidity
   strategyManager.addStrategy(aaveStrategy, 4000, "Aave Lending");
   strategyManager.addStrategy(klaySwapStrategy, 3500, "KlaySwap LP");
   strategyManager.addStrategy(compoundStrategy, 2500, "Compound");
   ```

## Testing

### Unit Tests
```bash
npx hardhat test
```

### Integration Tests
```bash
npx hardhat test test/integration/Rebalancing.test.js
```

### Service Tests
```bash
cd scripts
npm test
```

## Best Practices

### Strategy Development
1. **Implement IStrategy Interface**: Ensure compatibility
2. **APY Accuracy**: Provide accurate, real-time APY data
3. **Error Handling**: Implement comprehensive error handling
4. **Gas Optimization**: Minimize gas consumption

### Rebalancing Configuration
1. **Threshold Setting**: Balance between responsiveness and stability
2. **Cooldown Periods**: Prevent excessive rebalancing
3. **Gas Management**: Optimize gas usage for cost efficiency
4. **Monitoring**: Implement comprehensive monitoring

### Security Considerations
1. **Access Control**: Implement proper access controls
2. **Input Validation**: Validate all inputs thoroughly
3. **Emergency Procedures**: Have emergency procedures ready
4. **Regular Audits**: Conduct regular security audits

## Troubleshooting

### Common Issues

1. **Rebalancing Not Triggering**:
   - Check threshold settings
   - Verify strategy APY data
   - Ensure cooldown period has passed

2. **High Gas Costs**:
   - Adjust gas multiplier
   - Optimize strategy contracts
   - Consider longer cooldown periods

3. **Service Connectivity**:
   - Check RPC endpoint
   - Verify private key configuration
   - Monitor network status

### Debug Commands

```bash
# Check service health
npm run health-check

# View service logs
tail -f logs/rebalancing.log

# Test rebalancing manually
npx hardhat run scripts/test-rebalance.js
```

## Future Enhancements

### Planned Features
1. **Machine Learning**: AI-powered rebalancing decisions
2. **Risk Management**: Advanced risk assessment
3. **Multi-Chain**: Support for multiple blockchains
4. **Governance**: Community-driven parameter updates

### Integration Opportunities
1. **Price Oracles**: Real-time price feeds
2. **Risk Metrics**: Advanced risk calculations
3. **Analytics**: Comprehensive performance analytics
4. **Notifications**: Real-time alerts and notifications

## Support

For technical support or questions about the auto-rebalancing system:

- **Documentation**: [docs.lineyield.com](https://docs.lineyield.com)
- **GitHub Issues**: [github.com/lineyield/issues](https://github.com/lineyield/issues)
- **Discord**: [discord.gg/lineyield](https://discord.gg/lineyield)
- **Email**: support@lineyield.com
