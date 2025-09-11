-- Kaia Yield Optimizer - User Activity Analysis
-- This query tracks user growth, activity, and engagement metrics

WITH user_transactions AS (
  -- All user transactions (deposits and withdrawals)
  SELECT 
    block_time,
    CASE 
      WHEN topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000' 
      THEN 'deposit'
      WHEN topic2 = '0x0000000000000000000000000000000000000000000000000000000000000000' 
      THEN 'withdraw'
      ELSE 'other'
    END as transaction_type,
    CONCAT('0x', SUBSTRING(topic1, 27, 40)) as user_address, -- Extract user address from topic1
    CAST(value AS DECIMAL(38,0)) / 1e6 as amount_usdt
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- Replace with actual vault address
    AND topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' -- Transfer event
    AND (topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000' -- Mint
         OR topic2 = '0x0000000000000000000000000000000000000000000000000000000000000000') -- Burn
),

daily_user_activity AS (
  SELECT 
    DATE(block_time) as date,
    COUNT(DISTINCT user_address) as unique_users,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN transaction_type = 'deposit' THEN 1 ELSE 0 END) as deposit_count,
    SUM(CASE WHEN transaction_type = 'withdraw' THEN 1 ELSE 0 END) as withdraw_count,
    SUM(CASE WHEN transaction_type = 'deposit' THEN amount_usdt ELSE 0 END) as total_deposits,
    SUM(CASE WHEN transaction_type = 'withdraw' THEN amount_usdt ELSE 0 END) as total_withdrawals,
    AVG(CASE WHEN transaction_type = 'deposit' THEN amount_usdt END) as avg_deposit_size,
    AVG(CASE WHEN transaction_type = 'withdraw' THEN amount_usdt END) as avg_withdrawal_size
  FROM user_transactions
  GROUP BY DATE(block_time)
),

user_retention AS (
  SELECT 
    user_address,
    MIN(DATE(block_time)) as first_transaction_date,
    MAX(DATE(block_time)) as last_transaction_date,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN transaction_type = 'deposit' THEN amount_usdt ELSE 0 END) as total_deposited,
    SUM(CASE WHEN transaction_type = 'withdraw' THEN amount_usdt ELSE 0 END) as total_withdrawn
  FROM user_transactions
  GROUP BY user_address
),

daily_metrics AS (
  SELECT 
    d.date,
    d.unique_users,
    d.total_transactions,
    d.deposit_count,
    d.withdraw_count,
    d.total_deposits,
    d.total_withdrawals,
    d.avg_deposit_size,
    d.avg_withdrawal_size,
    COUNT(DISTINCT r.user_address) as new_users,
    LAG(d.unique_users, 1) OVER (ORDER BY d.date) as prev_day_users,
    LAG(d.unique_users, 7) OVER (ORDER BY d.date) as prev_week_users
  FROM daily_user_activity d
  LEFT JOIN user_retention r ON d.date = r.first_transaction_date
  GROUP BY d.date, d.unique_users, d.total_transactions, d.deposit_count, d.withdraw_count, 
           d.total_deposits, d.total_withdrawals, d.avg_deposit_size, d.avg_withdrawal_size
)

SELECT 
  date,
  unique_users,
  new_users,
  total_transactions,
  deposit_count,
  withdraw_count,
  ROUND(total_deposits, 2) as total_deposits,
  ROUND(total_withdrawals, 2) as total_withdrawals,
  ROUND(avg_deposit_size, 2) as avg_deposit_size,
  ROUND(avg_withdrawal_size, 2) as avg_withdrawal_size,
  CASE 
    WHEN prev_day_users > 0 
    THEN ROUND((unique_users - prev_day_users) / prev_day_users * 100, 2)
    ELSE 0 
  END as user_growth_daily_pct,
  CASE 
    WHEN prev_week_users > 0 
    THEN ROUND((unique_users - prev_week_users) / prev_week_users * 100, 2)
    ELSE 0 
  END as user_growth_weekly_pct
FROM daily_metrics
ORDER BY date DESC;
