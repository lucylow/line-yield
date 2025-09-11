-- Kaia Yield Optimizer - Protocol Health Metrics
-- This query provides comprehensive protocol health indicators

WITH vault_metrics AS (
  -- Core vault metrics
  SELECT 
    DATE(block_time) as date,
    COUNT(DISTINCT CONCAT('0x', SUBSTRING(topic1, 27, 40))) as unique_users,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000' 
             THEN CAST(value AS DECIMAL(38,0)) / 1e6 ELSE 0 END) as daily_deposits,
    SUM(CASE WHEN topic2 = '0x0000000000000000000000000000000000000000000000000000000000000000' 
             THEN CAST(value AS DECIMAL(38,0)) / 1e6 ELSE 0 END) as daily_withdrawals
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- Replace with vault address
    AND topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' -- Transfer event
    AND block_time > '2025-09-01'
  GROUP BY DATE(block_time)
),

yield_metrics AS (
  -- Yield generation metrics
  SELECT 
    DATE(block_time) as date,
    COUNT(*) as harvest_count,
    SUM(CAST(SUBSTRING(data, 1, 32) AS DECIMAL(38,0)) / 1e6) as daily_yield,
    SUM(CAST(SUBSTRING(data, 33, 32) AS DECIMAL(38,0)) / 1e6) as daily_fees
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- Replace with vault address
    AND topic0 = '0x...' -- Replace with YieldReported event signature
    AND block_time > '2025-09-01'
  GROUP BY DATE(block_time)
),

strategy_metrics AS (
  -- Strategy performance metrics
  SELECT 
    DATE(block_time) as date,
    COUNT(DISTINCT CONCAT('0x', SUBSTRING(topic1, 27, 40))) as active_strategies,
    SUM(CAST(data AS DECIMAL(38,0)) / 1e6) as strategy_allocations
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- Replace with StrategyManager address
    AND topic0 = '0x...' -- Replace with AssetsAllocated event signature
    AND block_time > '2025-09-01'
  GROUP BY DATE(block_time)
),

daily_health AS (
  SELECT 
    COALESCE(v.date, y.date, s.date) as date,
    COALESCE(v.unique_users, 0) as unique_users,
    COALESCE(v.total_transactions, 0) as total_transactions,
    COALESCE(v.daily_deposits, 0) as daily_deposits,
    COALESCE(v.daily_withdrawals, 0) as daily_withdrawals,
    COALESCE(y.harvest_count, 0) as harvest_count,
    COALESCE(y.daily_yield, 0) as daily_yield,
    COALESCE(y.daily_fees, 0) as daily_fees,
    COALESCE(s.active_strategies, 0) as active_strategies,
    COALESCE(s.strategy_allocations, 0) as strategy_allocations,
    COALESCE(v.daily_deposits, 0) - COALESCE(v.daily_withdrawals, 0) as net_flow
  FROM vault_metrics v
  FULL OUTER JOIN yield_metrics y ON v.date = y.date
  FULL OUTER JOIN strategy_metrics s ON COALESCE(v.date, y.date) = s.date
),

health_indicators AS (
  SELECT 
    date,
    unique_users,
    total_transactions,
    daily_deposits,
    daily_withdrawals,
    harvest_count,
    daily_yield,
    daily_fees,
    active_strategies,
    strategy_allocations,
    net_flow,
    SUM(net_flow) OVER (ORDER BY date) as cumulative_tvl,
    AVG(unique_users) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as avg_users_7d,
    AVG(total_transactions) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as avg_transactions_7d,
    AVG(daily_yield) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as avg_yield_7d,
    AVG(daily_fees) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as avg_fees_7d,
    LAG(unique_users, 1) OVER (ORDER BY date) as prev_day_users,
    LAG(total_transactions, 1) OVER (ORDER BY date) as prev_day_transactions,
    LAG(daily_yield, 1) OVER (ORDER BY date) as prev_day_yield
  FROM daily_health
),

health_scores AS (
  SELECT 
    date,
    unique_users,
    total_transactions,
    daily_deposits,
    daily_withdrawals,
    harvest_count,
    daily_yield,
    daily_fees,
    active_strategies,
    strategy_allocations,
    net_flow,
    cumulative_tvl,
    avg_users_7d,
    avg_transactions_7d,
    avg_yield_7d,
    avg_fees_7d,
    prev_day_users,
    prev_day_transactions,
    prev_day_yield,
    CASE 
      WHEN prev_day_users > 0 
      THEN ROUND((unique_users - prev_day_users) / prev_day_users * 100, 2)
      ELSE 0 
    END as user_growth_pct,
    CASE 
      WHEN prev_day_transactions > 0 
      THEN ROUND((total_transactions - prev_day_transactions) / prev_day_transactions * 100, 2)
      ELSE 0 
    END as transaction_growth_pct,
    CASE 
      WHEN prev_day_yield > 0 
      THEN ROUND((daily_yield - prev_day_yield) / prev_day_yield * 100, 2)
      ELSE 0 
    END as yield_growth_pct,
    CASE 
      WHEN cumulative_tvl > 0 AND daily_yield > 0
      THEN ROUND((daily_yield / cumulative_tvl) * 365 * 100, 2)
      ELSE 0 
    END as current_apy_pct
  FROM health_indicators
)

SELECT 
  date,
  unique_users,
  total_transactions,
  ROUND(daily_deposits, 2) as daily_deposits,
  ROUND(daily_withdrawals, 2) as daily_withdrawals,
  harvest_count,
  ROUND(daily_yield, 2) as daily_yield,
  ROUND(daily_fees, 2) as daily_fees,
  active_strategies,
  ROUND(strategy_allocations, 2) as strategy_allocations,
  ROUND(net_flow, 2) as net_flow,
  ROUND(cumulative_tvl, 2) as cumulative_tvl,
  ROUND(avg_users_7d, 2) as avg_users_7d,
  ROUND(avg_transactions_7d, 2) as avg_transactions_7d,
  ROUND(avg_yield_7d, 2) as avg_yield_7d,
  ROUND(avg_fees_7d, 2) as avg_fees_7d,
  user_growth_pct,
  transaction_growth_pct,
  yield_growth_pct,
  current_apy_pct,
  CASE 
    WHEN user_growth_pct > 0 AND transaction_growth_pct > 0 AND yield_growth_pct > 0 THEN 'Excellent'
    WHEN user_growth_pct > 0 AND transaction_growth_pct > 0 THEN 'Good'
    WHEN user_growth_pct > 0 OR transaction_growth_pct > 0 THEN 'Fair'
    ELSE 'Poor'
  END as health_status
FROM health_scores
ORDER BY date DESC;
