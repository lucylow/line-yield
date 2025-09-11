# Kaia Yield Optimizer - Dune Analytics Dashboard

## Overview

This directory contains comprehensive SQL queries and documentation for creating a Dune Analytics dashboard to track the performance of the Kaia Yield Optimizer (KYO) DeFi protocol.

## Dashboard Features

### 📊 Key Metrics Tracked

1. **Total Value Locked (TVL)**
   - Historical TVL trends
   - Daily deposits and withdrawals
   - TVL growth rate analysis

2. **User Activity**
   - Daily Active Users (DAU)
   - New user acquisition
   - User engagement patterns

3. **APY Performance**
   - Current APY trends
   - Yield generation over time
   - Performance benchmarking

4. **Strategy Allocation**
   - Fund distribution across strategies
   - Strategy performance comparison
   - Dynamic allocation tracking

5. **Revenue Analysis**
   - Management and performance fees
   - Cumulative revenue tracking
   - Fee rate optimization

6. **User Retention**
   - Cohort analysis
   - Retention rate tracking
   - User lifecycle metrics

7. **Protocol Health**
   - Comprehensive health indicators
   - Growth metrics
   - Risk assessment

## 📁 File Structure

```
dune/
├── queries/
│   ├── tvl_analysis.sql          # TVL tracking and analysis
│   ├── apy_performance.sql       # APY and yield performance
│   ├── user_activity.sql         # User activity and engagement
│   ├── strategy_allocation.sql   # Strategy allocation tracking
│   ├── revenue_analysis.sql     # Revenue and fee analysis
│   ├── user_retention.sql       # User retention and cohort analysis
│   └── protocol_health.sql      # Protocol health indicators
├── dashboard_setup_guide.md     # Complete setup instructions
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites

- Dune Analytics account ([dune.com](https://dune.com))
- Deployed KYO smart contracts on Kaia blockchain
- Contract addresses and event signatures

### Setup Steps

1. **Create Dune Account**
   ```bash
   # Visit dune.com and create a free account
   # Verify your email and access the query editor
   ```

2. **Deploy Contracts**
   ```bash
   # Deploy your smart contracts to Kaia testnet/mainnet
   npx hardhat run scripts/deploy.ts --network kaiaTestnet
   ```

3. **Update Contract Addresses**
   ```sql
   -- Update all placeholder addresses in SQL queries
   -- Replace '0x1234567890123456789012345678901234567890' with actual addresses
   ```

4. **Create Queries**
   ```bash
   # Copy each SQL query from queries/ directory
   # Paste into Dune query editor
   # Test and save each query
   ```

5. **Build Dashboard**
   ```bash
   # Follow the detailed guide in dashboard_setup_guide.md
   # Create visualizations for each query
   # Arrange in logical dashboard layout
   ```

## 📋 Query Descriptions

### TVL Analysis (`tvl_analysis.sql`)
Tracks Total Value Locked over time by analyzing deposit and withdrawal events from the vault contract.

**Key Metrics:**
- Daily TVL changes
- Deposit vs withdrawal flows
- TVL growth rate
- Cumulative TVL

### APY Performance (`apy_performance.sql`)
Monitors yield generation and APY performance by analyzing harvest events and yield reports.

**Key Metrics:**
- Daily APY calculation
- 7-day and 30-day APY averages
- Yield generation trends
- Performance benchmarking

### User Activity (`user_activity.sql`)
Analyzes user engagement and activity patterns by tracking unique users and transaction volumes.

**Key Metrics:**
- Daily Active Users (DAU)
- New user acquisition
- Transaction volumes
- User growth rates

### Strategy Allocation (`strategy_allocation.sql`)
Tracks fund allocation across different yield strategies and monitors strategy performance.

**Key Metrics:**
- Strategy allocation percentages
- Fund distribution
- Strategy performance comparison
- Allocation changes over time

### Revenue Analysis (`revenue_analysis.sql`)
Monitors protocol revenue from management and performance fees.

**Key Metrics:**
- Daily fee collection
- Cumulative revenue
- Fee rate trends
- Revenue optimization

### User Retention (`user_retention.sql`)
Analyzes user retention patterns and cohort behavior.

**Key Metrics:**
- Cohort analysis
- Retention rates
- User lifecycle metrics
- Engagement patterns

### Protocol Health (`protocol_health.sql`)
Provides comprehensive protocol health indicators and risk assessment.

**Key Metrics:**
- Health status indicators
- Growth metrics
- Risk assessment
- Performance benchmarks

## 🔧 Configuration

### Contract Addresses

Before using the queries, update the following placeholder addresses:

```sql
-- Vault Contract
contract_address = '0xYourVaultAddress'

-- StrategyManager Contract  
contract_address = '0xYourStrategyManagerAddress'

-- Strategy Contracts
strategy_address = '0xYourAaveStrategyAddress'
strategy_address = '0xYourKlaySwapStrategyAddress'
strategy_address = '0xYourCompoundStrategyAddress'
```

### Event Signatures

Update event signatures with actual values from your deployed contracts:

```sql
-- YieldReported event
topic0 = '0xYourYieldReportedEventSignature'

-- HarvestExecuted event
topic0 = '0xYourHarvestExecutedEventSignature'

-- AssetsAllocated event
topic0 = '0xYourAssetsAllocatedEventSignature'
```

## 📊 Dashboard Layout

### Recommended Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Kaia Yield Optimizer Analytics           │
├─────────────────────────────────────────────────────────────┤
│  TVL Over Time        │  APY Performance                   │
├─────────────────────────────────────────────────────────────┤
│  Daily Active Users   │  Strategy Allocation              │
├─────────────────────────────────────────────────────────────┤
│  Revenue Analysis     │  User Retention                   │
├─────────────────────────────────────────────────────────────┤
│  Protocol Health Indicators                               │
└─────────────────────────────────────────────────────────────┘
```

### Visualization Types

- **Line Charts**: TVL, APY, Revenue trends
- **Bar Charts**: User activity, Daily metrics
- **Pie Charts**: Strategy allocation
- **Area Charts**: Cumulative metrics
- **Tables**: Health indicators, Detailed metrics

## 🎯 Key Performance Indicators (KPIs)

### Primary KPIs
- **TVL Growth Rate**: Target >10% monthly growth
- **User Acquisition**: Target >100 new users monthly
- **APY Performance**: Target >8% annual yield
- **Revenue Growth**: Target >20% monthly revenue growth

### Secondary KPIs
- **User Retention**: Target >60% monthly retention
- **Strategy Efficiency**: Target >95% uptime
- **Fee Optimization**: Target <5% total fees
- **Protocol Health**: Target "Excellent" status

## 🔍 Monitoring and Alerts

### Recommended Monitoring
- Daily TVL changes >20%
- APY drops below 5%
- User activity drops >50%
- Revenue drops >30%
- Protocol health status changes

### Alert Thresholds
- **Critical**: Immediate attention required
- **Warning**: Monitor closely
- **Info**: Normal operation

## 📈 Advanced Analytics

### Cross-Protocol Comparison
Compare KYO performance with other Kaia DeFi protocols:
- TVL comparison
- APY benchmarking
- User adoption rates
- Revenue efficiency

### Risk Assessment
- Strategy concentration risk
- User dependency risk
- Revenue sustainability
- Protocol stability

## 🛠️ Troubleshooting

### Common Issues

1. **No Data Showing**
   - Verify contract addresses
   - Check contract deployment status
   - Ensure events are being emitted

2. **Query Errors**
   - Check SQL syntax
   - Verify table references
   - Test with smaller date ranges

3. **Visualization Issues**
   - Check data types
   - Verify axis configurations
   - Ensure proper data ranges

### Support Resources
- [Dune Documentation](https://docs.dune.com)
- [Dune Discord](https://discord.gg/dune)
- [SQL Reference](https://docs.dune.com/query-engine/Functions-and-operators)

## 📝 Submission Requirements

### Hackathon Submission Checklist
- [ ] Dashboard is public and accessible
- [ ] All queries are working correctly
- [ ] Contract addresses are updated
- [ ] Visualizations are properly configured
- [ ] Dashboard URL is provided
- [ ] Documentation is complete

### Public Dashboard URL
Once complete, your dashboard will be available at:
```
https://dune.com/your-username/kaia-yield-optimizer
```

## 🚀 Next Steps

1. **Deploy Contracts**: Deploy to Kaia testnet/mainnet
2. **Update Queries**: Replace placeholder addresses
3. **Test Dashboard**: Verify all functionality
4. **Share URL**: Include in hackathon submission
5. **Monitor**: Regularly check performance and data accuracy

## 📚 Additional Resources

- [Dune Analytics Platform](https://dune.com)
- [Dune Documentation](https://docs.dune.com)
- [Kaia Blockchain Docs](https://docs.kaia.io)
- [DeFi Analytics Best Practices](https://docs.dune.com/dashboards)

---

**Built for the Kaia Wave Stablecoin Summer Hackathon**

This dashboard provides comprehensive analytics for the Kaia Yield Optimizer protocol, showcasing its performance and growth to users, investors, and hackathon judges.
