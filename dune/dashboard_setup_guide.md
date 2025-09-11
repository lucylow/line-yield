# Kaia Yield Optimizer - Dune Analytics Dashboard Setup Guide

## Overview

This guide provides step-by-step instructions for creating a comprehensive Dune Analytics dashboard for the Kaia Yield Optimizer (KYO) protocol. The dashboard will track key metrics including TVL, user activity, APY performance, revenue generation, and protocol health.

## Dashboard Structure

### Core Metrics Dashboard
- **Title**: Kaia Yield Optimizer Analytics
- **Description**: Comprehensive analytics for the KYO DeFi protocol on Kaia blockchain
- **Public URL**: `https://dune.com/your-username/kaia-yield-optimizer`

### Key Visualizations

1. **TVL Analysis** (Line Chart)
   - Total Value Locked over time
   - Daily deposits vs withdrawals
   - TVL growth rate

2. **User Activity** (Bar Chart)
   - Daily Active Users (DAU)
   - New vs returning users
   - User growth trends

3. **APY Performance** (Line Chart)
   - Current APY trends
   - 7-day and 30-day averages
   - Yield generation over time

4. **Strategy Allocation** (Pie Chart)
   - Fund distribution across strategies
   - Strategy performance comparison
   - Allocation percentages

5. **Revenue Analysis** (Area Chart)
   - Management and performance fees
   - Cumulative revenue
   - Fee rate trends

6. **Protocol Health** (Table)
   - Key health indicators
   - Growth metrics
   - Status assessment

## Step-by-Step Setup

### Step 1: Create Dune Account and Environment

1. **Sign up for Dune Analytics**
   - Visit [dune.com](https://dune.com)
   - Create a free account
   - Verify your email address

2. **Access Query Editor**
   - Navigate to the Query Editor
   - Select "Ethereum" as the blockchain (or Kaia if available)
   - Familiarize yourself with the interface

### Step 2: Create Individual Queries

#### Query 1: TVL Analysis
```sql
-- Copy the contents of dune/queries/tvl_analysis.sql
-- Update contract addresses with actual deployed addresses
-- Test the query to ensure it works correctly
```

#### Query 2: APY Performance
```sql
-- Copy the contents of dune/queries/apy_performance.sql
-- Update event signatures with actual contract events
-- Verify yield calculation logic
```

#### Query 3: User Activity
```sql
-- Copy the contents of dune/queries/user_activity.sql
-- Update contract address and event signatures
-- Test user address extraction logic
```

#### Query 4: Strategy Allocation
```sql
-- Copy the contents of dune/queries/strategy_allocation.sql
-- Update strategy addresses with actual deployed contracts
-- Verify allocation calculation logic
```

#### Query 5: Revenue Analysis
```sql
-- Copy the contents of dune/queries/revenue_analysis.sql
-- Update fee event signatures
-- Test revenue calculation accuracy
```

#### Query 6: User Retention
```sql
-- Copy the contents of dune/queries/user_retention.sql
-- Update contract addresses
-- Verify cohort analysis logic
```

#### Query 7: Protocol Health
```sql
-- Copy the contents of dune/queries/protocol_health.sql
-- Update all contract addresses and event signatures
-- Test health indicator calculations
```

### Step 3: Create Visualizations

For each query, create appropriate visualizations:

1. **TVL Analysis** → Line Chart
   - X-axis: date
   - Y-axis: tvl
   - Title: "Total Value Locked Over Time"

2. **APY Performance** → Line Chart
   - X-axis: date
   - Y-axis: daily_apy_pct
   - Title: "APY Performance Trends"

3. **User Activity** → Bar Chart
   - X-axis: date
   - Y-axis: unique_users
   - Title: "Daily Active Users"

4. **Strategy Allocation** → Pie Chart
   - Series: allocation_percentage
   - Labels: strategy_name
   - Title: "Strategy Allocation Distribution"

5. **Revenue Analysis** → Area Chart
   - X-axis: date
   - Y-axis: cumulative_total_fees
   - Title: "Cumulative Protocol Revenue"

6. **User Retention** → Table
   - Display: cohort_date, cohort_size, retention_rate_pct
   - Title: "User Retention Analysis"

7. **Protocol Health** → Table
   - Display: date, health_status, key metrics
   - Title: "Protocol Health Indicators"

### Step 4: Build the Dashboard

1. **Create New Dashboard**
   - Click "Create" → "Dashboard" → "New Dashboard"
   - Name: "Kaia Yield Optimizer Analytics"
   - Description: "Comprehensive analytics for the KYO DeFi protocol"

2. **Add Visualizations**
   - Add all created visualizations to the dashboard
   - Arrange them in a logical order:
     - Top row: TVL and APY charts
     - Middle row: User metrics and strategy allocation
     - Bottom row: Revenue and health indicators

3. **Add Text Widgets**
   - Add explanatory text for each section
   - Include protocol description and key metrics explanation
   - Add links to documentation and resources

4. **Configure Dashboard Settings**
   - Set refresh interval to 24 hours
   - Enable public access
   - Add relevant tags (DeFi, Kaia, Yield Farming, etc.)

### Step 5: Update Contract Addresses

**Important**: Before the dashboard can work with real data, you need to update all contract addresses in the SQL queries with your actual deployed contract addresses.

#### Required Updates:

1. **Vault Contract Address**
   ```sql
   -- Replace this placeholder:
   contract_address = '0x1234567890123456789012345678901234567890'
   
   -- With your actual vault address:
   contract_address = '0xYourActualVaultAddress'
   ```

2. **StrategyManager Contract Address**
   ```sql
   -- Replace this placeholder:
   contract_address = '0x1234567890123456789012345678901234567890'
   
   -- With your actual StrategyManager address:
   contract_address = '0xYourActualStrategyManagerAddress'
   ```

3. **Strategy Contract Addresses**
   ```sql
   -- Update strategy addresses in strategy_allocation.sql
   WHEN strategy_address = '0x...' THEN 'Aave Strategy'
   WHEN strategy_address = '0x...' THEN 'KlaySwap Strategy'
   WHEN strategy_address = '0x...' THEN 'Compound Strategy'
   ```

4. **Event Signatures**
   ```sql
   -- Update event signatures with actual values from your contracts
   AND topic0 = '0x...' -- Replace with actual event signature
   ```

### Step 6: Test and Validate

1. **Test Each Query**
   - Run each query individually
   - Verify data accuracy
   - Check for any errors or missing data

2. **Validate Visualizations**
   - Ensure charts display correctly
   - Verify data ranges and scales
   - Check for any visualization errors

3. **Test Dashboard**
   - Refresh the dashboard
   - Verify all visualizations update correctly
   - Check public access functionality

### Step 7: Schedule Updates

1. **Set Refresh Schedule**
   - Click the clock icon on each query
   - Set refresh interval to 24 hours
   - Enable automatic updates

2. **Monitor Performance**
   - Check query execution times
   - Optimize slow queries if needed
   - Monitor data freshness

## Dashboard Features

### Real-time Metrics
- TVL tracking with historical trends
- User activity and growth analysis
- APY performance monitoring
- Revenue and fee tracking
- Strategy allocation visualization
- Protocol health indicators

### Advanced Analytics
- User retention and cohort analysis
- Cross-protocol comparisons
- Performance benchmarking
- Risk assessment metrics
- Yield optimization insights

### Public Access
- Shareable dashboard URL
- Embeddable widgets
- Export functionality
- API access for developers

## Troubleshooting

### Common Issues

1. **No Data Showing**
   - Verify contract addresses are correct
   - Check if contracts are deployed and active
   - Ensure event signatures match contract events

2. **Query Errors**
   - Check SQL syntax
   - Verify table names and column references
   - Test with smaller date ranges

3. **Visualization Issues**
   - Check data types and formats
   - Verify axis configurations
   - Ensure data ranges are appropriate

### Getting Help

- Dune Analytics Documentation: [docs.dune.com](https://docs.dune.com)
- Community Discord: [Dune Discord](https://discord.gg/dune)
- Support Email: support@dune.com

## Submission Checklist

- [ ] All queries created and tested
- [ ] Visualizations configured correctly
- [ ] Dashboard is public and accessible
- [ ] Contract addresses updated with real values
- [ ] Refresh schedule configured
- [ ] Documentation and descriptions added
- [ ] Public URL obtained and tested

## Next Steps

1. **Deploy Contracts**: Deploy your smart contracts to Kaia testnet/mainnet
2. **Update Addresses**: Update all contract addresses in queries
3. **Test Dashboard**: Verify all functionality works with real data
4. **Share URL**: Use the public dashboard URL in your hackathon submission
5. **Monitor**: Regularly check dashboard performance and data accuracy

## Resources

- [Dune Analytics Platform](https://dune.com)
- [Dune Documentation](https://docs.dune.com)
- [SQL Reference](https://docs.dune.com/query-engine/Functions-and-operators)
- [Visualization Guide](https://docs.dune.com/visualizations)
- [Dashboard Best Practices](https://docs.dune.com/dashboards)

---

**Note**: This dashboard will provide comprehensive analytics for your Kaia Yield Optimizer protocol, showcasing its performance and growth to users, investors, and hackathon judges.
