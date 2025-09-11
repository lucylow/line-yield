-- Kaia Yield Optimizer - Revenue Analysis
-- This query tracks protocol revenue from management and performance fees

WITH fee_events AS (
  -- YieldReported events containing fee information
  SELECT 
    block_time,
    CAST(SUBSTRING(data, 1, 32) AS DECIMAL(38,0)) / 1e6 as total_yield_usdt,
    CAST(SUBSTRING(data, 33, 32) AS DECIMAL(38,0)) / 1e6 as management_fee_usdt,
    CAST(SUBSTRING(data, 65, 32) AS DECIMAL(38,0)) / 1e6 as performance_fee_usdt,
    'yield_report' as event_type
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- Replace with vault address
    AND topic0 = '0x...' -- Replace with YieldReported event signature
    AND block_time > '2025-09-01'
  
  UNION ALL
  
  -- HarvestExecuted events
  SELECT 
    block_time,
    CAST(SUBSTRING(data, 1, 32) AS DECIMAL(38,0)) / 1e6 as total_yield_usdt,
    0 as management_fee_usdt,
    CAST(SUBSTRING(data, 33, 32) AS DECIMAL(38,0)) / 1e6 as performance_fee_usdt,
    'harvest' as event_type
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- Replace with vault address
    AND topic0 = '0x...' -- Replace with HarvestExecuted event signature
    AND block_time > '2025-09-01'
),

daily_fees AS (
  SELECT 
    DATE(block_time) as date,
    SUM(total_yield_usdt) as daily_yield,
    SUM(management_fee_usdt) as daily_management_fees,
    SUM(performance_fee_usdt) as daily_performance_fees,
    SUM(management_fee_usdt + performance_fee_usdt) as daily_total_fees,
    COUNT(*) as harvest_count
  FROM fee_events
  GROUP BY DATE(block_time)
),

cumulative_metrics AS (
  SELECT 
    date,
    daily_yield,
    daily_management_fees,
    daily_performance_fees,
    daily_total_fees,
    harvest_count,
    SUM(daily_yield) OVER (ORDER BY date) as cumulative_yield,
    SUM(daily_management_fees) OVER (ORDER BY date) as cumulative_management_fees,
    SUM(daily_performance_fees) OVER (ORDER BY date) as cumulative_performance_fees,
    SUM(daily_total_fees) OVER (ORDER BY date) as cumulative_total_fees,
    AVG(daily_total_fees) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as avg_daily_fees_7d,
    AVG(daily_total_fees) OVER (ORDER BY date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as avg_daily_fees_30d
  FROM daily_fees
),

fee_ratios AS (
  SELECT 
    date,
    daily_yield,
    daily_management_fees,
    daily_performance_fees,
    daily_total_fees,
    harvest_count,
    cumulative_yield,
    cumulative_management_fees,
    cumulative_performance_fees,
    cumulative_total_fees,
    avg_daily_fees_7d,
    avg_daily_fees_30d,
    CASE 
      WHEN daily_yield > 0 
      THEN ROUND((daily_total_fees / daily_yield) * 100, 2)
      ELSE 0 
    END as daily_fee_rate_pct,
    CASE 
      WHEN cumulative_yield > 0 
      THEN ROUND((cumulative_total_fees / cumulative_yield) * 100, 2)
      ELSE 0 
    END as cumulative_fee_rate_pct
  FROM cumulative_metrics
)

SELECT 
  date,
  ROUND(daily_yield, 2) as daily_yield,
  ROUND(daily_management_fees, 2) as daily_management_fees,
  ROUND(daily_performance_fees, 2) as daily_performance_fees,
  ROUND(daily_total_fees, 2) as daily_total_fees,
  harvest_count,
  ROUND(cumulative_yield, 2) as cumulative_yield,
  ROUND(cumulative_management_fees, 2) as cumulative_management_fees,
  ROUND(cumulative_performance_fees, 2) as cumulative_performance_fees,
  ROUND(cumulative_total_fees, 2) as cumulative_total_fees,
  ROUND(avg_daily_fees_7d, 2) as avg_daily_fees_7d,
  ROUND(avg_daily_fees_30d, 2) as avg_daily_fees_30d,
  daily_fee_rate_pct,
  cumulative_fee_rate_pct
FROM fee_ratios
ORDER BY date DESC;
