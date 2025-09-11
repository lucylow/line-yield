-- Kaia Yield Optimizer - APY Performance Analysis
-- This query tracks APY performance and yield generation over time

WITH yield_events AS (
  -- Harvest events from vault contract
  SELECT 
    block_time,
    CAST(data AS DECIMAL(38,0)) / 1e6 as yield_amount_usdt,
    'harvest' as event_type
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- Replace with actual vault address
    AND topic0 = '0x...' -- Replace with actual YieldReported event signature
),

daily_yields AS (
  SELECT 
    DATE(block_time) as date,
    SUM(yield_amount_usdt) as daily_yield,
    COUNT(*) as harvest_count
  FROM yield_events
  GROUP BY DATE(block_time)
),

vault_balance AS (
  -- Get vault balance over time
  SELECT 
    DATE(block_time) as date,
    CAST(value AS DECIMAL(38,0)) / 1e6 as vault_balance_usdt
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- Replace with actual vault address
    AND topic0 = '0x...' -- Replace with actual balance update event
),

daily_apy AS (
  SELECT 
    d.date,
    d.daily_yield,
    d.harvest_count,
    v.vault_balance_usdt,
    CASE 
      WHEN v.vault_balance_usdt > 0 
      THEN (d.daily_yield / v.vault_balance_usdt) * 365 * 100
      ELSE 0 
    END as daily_apy_pct,
    CASE 
      WHEN v.vault_balance_usdt > 0 
      THEN (d.daily_yield / v.vault_balance_usdt) * 100
      ELSE 0 
    END as daily_yield_rate_pct
  FROM daily_yields d
  LEFT JOIN vault_balance v ON d.date = v.date
),

apy_metrics AS (
  SELECT 
    date,
    daily_yield,
    harvest_count,
    vault_balance_usdt,
    daily_apy_pct,
    daily_yield_rate_pct,
    AVG(daily_apy_pct) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as apy_7d_avg,
    AVG(daily_apy_pct) OVER (ORDER BY date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as apy_30d_avg,
    SUM(daily_yield) OVER (ORDER BY date) as cumulative_yield
  FROM daily_apy
)

SELECT 
  date,
  daily_yield,
  harvest_count,
  vault_balance_usdt,
  ROUND(daily_apy_pct, 2) as daily_apy_pct,
  ROUND(daily_yield_rate_pct, 4) as daily_yield_rate_pct,
  ROUND(apy_7d_avg, 2) as apy_7d_avg,
  ROUND(apy_30d_avg, 2) as apy_30d_avg,
  ROUND(cumulative_yield, 2) as cumulative_yield
FROM apy_metrics
ORDER BY date DESC;
