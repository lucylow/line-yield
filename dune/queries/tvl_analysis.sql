-- Kaia Yield Optimizer - TVL Analysis
-- This query tracks Total Value Locked (TVL) over time for the KYO protocol
-- 
-- IMPORTANT: Update the contract address below with your actual deployed vault address
-- Replace '0x1234567890123456789012345678901234567890' with your vault contract address

WITH vault_events AS (
  -- Deposit events (mint events from ERC-4626 vault)
  SELECT 
    block_time,
    'deposit' as event_type,
    CAST(value AS DECIMAL(38,0)) / 1e6 as amount_usdt, -- USDT has 6 decimals
    'in' as direction,
    CONCAT('0x', SUBSTRING(topic2, 27, 40)) as user_address -- Extract user from 'to' field
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- REPLACE WITH ACTUAL VAULT ADDRESS
    AND topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' -- Transfer event
    AND topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000' -- From zero address (mint)
    AND block_time > '2025-09-01' -- Adjust start date as needed
  
  UNION ALL
  
  -- Withdrawal events (burn events from ERC-4626 vault)
  SELECT 
    block_time,
    'withdraw' as event_type,
    CAST(value AS DECIMAL(38,0)) / 1e6 as amount_usdt,
    'out' as direction,
    CONCAT('0x', SUBSTRING(topic1, 27, 40)) as user_address -- Extract user from 'from' field
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- REPLACE WITH ACTUAL VAULT ADDRESS
    AND topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' -- Transfer event
    AND topic2 = '0x0000000000000000000000000000000000000000000000000000000000000000' -- To zero address (burn)
    AND block_time > '2025-09-01' -- Adjust start date as needed
),

daily_flows AS (
  SELECT 
    DATE(block_time) as date,
    SUM(CASE WHEN direction = 'in' THEN amount_usdt ELSE 0 END) as daily_deposits,
    SUM(CASE WHEN direction = 'out' THEN amount_usdt ELSE 0 END) as daily_withdrawals,
    SUM(CASE WHEN direction = 'in' THEN amount_usdt ELSE -amount_usdt END) as net_flow,
    COUNT(DISTINCT CASE WHEN direction = 'in' THEN user_address END) as unique_depositors,
    COUNT(DISTINCT CASE WHEN direction = 'out' THEN user_address END) as unique_withdrawers,
    COUNT(DISTINCT user_address) as unique_users
  FROM vault_events
  GROUP BY DATE(block_time)
),

tvl_cumulative AS (
  SELECT 
    date,
    daily_deposits,
    daily_withdrawals,
    net_flow,
    unique_depositors,
    unique_withdrawers,
    unique_users,
    SUM(net_flow) OVER (ORDER BY date) as tvl,
    AVG(net_flow) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as avg_daily_flow_7d,
    AVG(net_flow) OVER (ORDER BY date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as avg_daily_flow_30d
  FROM daily_flows
  ORDER BY date
)

SELECT 
  date,
  ROUND(daily_deposits, 2) as daily_deposits,
  ROUND(daily_withdrawals, 2) as daily_withdrawals,
  ROUND(net_flow, 2) as net_flow,
  unique_depositors,
  unique_withdrawers,
  unique_users,
  ROUND(tvl, 2) as tvl,
  ROUND(avg_daily_flow_7d, 2) as avg_daily_flow_7d,
  ROUND(avg_daily_flow_30d, 2) as avg_daily_flow_30d,
  LAG(tvl, 1) OVER (ORDER BY date) as tvl_previous_day,
  CASE 
    WHEN LAG(tvl, 1) OVER (ORDER BY date) > 0 
    THEN ROUND((tvl - LAG(tvl, 1) OVER (ORDER BY date)) / LAG(tvl, 1) OVER (ORDER BY date) * 100, 2)
    ELSE 0 
  END as tvl_change_pct,
  CASE 
    WHEN LAG(tvl, 7) OVER (ORDER BY date) > 0 
    THEN ROUND((tvl - LAG(tvl, 7) OVER (ORDER BY date)) / LAG(tvl, 7) OVER (ORDER BY date) * 100, 2)
    ELSE 0 
  END as tvl_change_7d_pct,
  CASE 
    WHEN LAG(tvl, 30) OVER (ORDER BY date) > 0 
    THEN ROUND((tvl - LAG(tvl, 30) OVER (ORDER BY date)) / LAG(tvl, 30) OVER (ORDER BY date) * 100, 2)
    ELSE 0 
  END as tvl_change_30d_pct
FROM tvl_cumulative
ORDER BY date DESC;
