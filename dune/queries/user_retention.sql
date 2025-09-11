-- Kaia Yield Optimizer - User Retention Analysis
-- This query analyzes user retention, cohort behavior, and engagement patterns

WITH user_transactions AS (
  -- All user transactions with detailed information
  SELECT 
    block_time,
    CASE 
      WHEN topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000' 
      THEN 'deposit'
      WHEN topic2 = '0x0000000000000000000000000000000000000000000000000000000000000000' 
      THEN 'withdraw'
      ELSE 'other'
    END as transaction_type,
    CONCAT('0x', SUBSTRING(topic1, 27, 40)) as user_address,
    CAST(value AS DECIMAL(38,0)) / 1e6 as amount_usdt,
    DATE(block_time) as transaction_date
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- Replace with vault address
    AND topic0 = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' -- Transfer event
    AND (topic1 = '0x0000000000000000000000000000000000000000000000000000000000000000' -- Mint
         OR topic2 = '0x0000000000000000000000000000000000000000000000000000000000000000') -- Burn
    AND block_time > '2025-09-01'
),

user_cohorts AS (
  -- Define user cohorts based on first transaction date
  SELECT 
    user_address,
    MIN(transaction_date) as cohort_date,
    MAX(transaction_date) as last_transaction_date,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN transaction_type = 'deposit' THEN amount_usdt ELSE 0 END) as total_deposited,
    SUM(CASE WHEN transaction_type = 'withdraw' THEN amount_usdt ELSE 0 END) as total_withdrawn,
    COUNT(DISTINCT transaction_date) as active_days,
    CASE 
      WHEN MAX(transaction_date) - MIN(transaction_date) = 0 THEN 'single_day'
      WHEN MAX(transaction_date) - MIN(transaction_date) <= 7 THEN 'week_1'
      WHEN MAX(transaction_date) - MIN(transaction_date) <= 30 THEN 'month_1'
      ELSE 'long_term'
    END as user_type
  FROM user_transactions
  GROUP BY user_address
),

cohort_analysis AS (
  SELECT 
    cohort_date,
    COUNT(DISTINCT user_address) as cohort_size,
    COUNT(DISTINCT CASE WHEN user_type = 'single_day' THEN user_address END) as single_day_users,
    COUNT(DISTINCT CASE WHEN user_type = 'week_1' THEN user_address END) as week_1_users,
    COUNT(DISTINCT CASE WHEN user_type = 'month_1' THEN user_address END) as month_1_users,
    COUNT(DISTINCT CASE WHEN user_type = 'long_term' THEN user_address END) as long_term_users,
    AVG(total_transactions) as avg_transactions_per_user,
    AVG(total_deposited) as avg_deposited_per_user,
    AVG(total_withdrawn) as avg_withdrawn_per_user,
    AVG(active_days) as avg_active_days_per_user,
    SUM(total_deposited) as cohort_total_deposited,
    SUM(total_withdrawn) as cohort_total_withdrawn
  FROM user_cohorts
  GROUP BY cohort_date
),

retention_metrics AS (
  SELECT 
    cohort_date,
    cohort_size,
    single_day_users,
    week_1_users,
    month_1_users,
    long_term_users,
    ROUND(avg_transactions_per_user, 2) as avg_transactions_per_user,
    ROUND(avg_deposited_per_user, 2) as avg_deposited_per_user,
    ROUND(avg_withdrawn_per_user, 2) as avg_withdrawn_per_user,
    ROUND(avg_active_days_per_user, 2) as avg_active_days_per_user,
    ROUND(cohort_total_deposited, 2) as cohort_total_deposited,
    ROUND(cohort_total_withdrawn, 2) as cohort_total_withdrawn,
    CASE 
      WHEN cohort_size > 0 
      THEN ROUND((long_term_users / cohort_size) * 100, 2)
      ELSE 0 
    END as retention_rate_pct,
    CASE 
      WHEN cohort_size > 0 
      THEN ROUND(((week_1_users + month_1_users + long_term_users) / cohort_size) * 100, 2)
      ELSE 0 
    END as engagement_rate_pct
  FROM cohort_analysis
),

daily_retention AS (
  SELECT 
    DATE(block_time) as date,
    COUNT(DISTINCT user_address) as daily_active_users,
    COUNT(DISTINCT CASE WHEN DATE(block_time) = MIN(DATE(block_time)) OVER (PARTITION BY user_address) THEN user_address END) as new_users,
    COUNT(DISTINCT CASE WHEN DATE(block_time) > MIN(DATE(block_time)) OVER (PARTITION BY user_address) THEN user_address END) as returning_users
  FROM user_transactions
  GROUP BY DATE(block_time)
)

SELECT 
  r.cohort_date,
  r.cohort_size,
  r.single_day_users,
  r.week_1_users,
  r.month_1_users,
  r.long_term_users,
  r.avg_transactions_per_user,
  r.avg_deposited_per_user,
  r.avg_withdrawn_per_user,
  r.avg_active_days_per_user,
  r.cohort_total_deposited,
  r.cohort_total_withdrawn,
  r.retention_rate_pct,
  r.engagement_rate_pct,
  d.daily_active_users,
  d.new_users,
  d.returning_users
FROM retention_metrics r
LEFT JOIN daily_retention d ON r.cohort_date = d.date
ORDER BY r.cohort_date DESC;
