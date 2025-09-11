-- Kaia Yield Optimizer - Strategy Allocation Analysis
-- This query tracks fund allocation across different yield strategies

WITH strategy_events AS (
  -- Strategy allocation events from StrategyManager
  SELECT 
    block_time,
    CONCAT('0x', SUBSTRING(topic1, 27, 40)) as strategy_address,
    CAST(data AS DECIMAL(38,0)) / 1e6 as amount_usdt,
    'allocate' as event_type
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- Replace with StrategyManager address
    AND topic0 = '0x...' -- Replace with AssetsAllocated event signature
    AND block_time > '2025-09-01'
  
  UNION ALL
  
  -- Strategy deallocation events
  SELECT 
    block_time,
    CONCAT('0x', SUBSTRING(topic1, 27, 40)) as strategy_address,
    CAST(data AS DECIMAL(38,0)) / 1e6 as amount_usdt,
    'deallocate' as event_type
  FROM ethereum.logs
  WHERE 
    contract_address = '0x1234567890123456789012345678901234567890' -- Replace with StrategyManager address
    AND topic0 = '0x...' -- Replace with AssetsDeallocated event signature
    AND block_time > '2025-09-01'
),

strategy_balances AS (
  SELECT 
    strategy_address,
    SUM(CASE WHEN event_type = 'allocate' THEN amount_usdt ELSE -amount_usdt END) as current_allocation,
    COUNT(CASE WHEN event_type = 'allocate' THEN 1 END) as allocation_count,
    COUNT(CASE WHEN event_type = 'deallocate' THEN 1 END) as deallocation_count,
    MAX(block_time) as last_activity
  FROM strategy_events
  GROUP BY strategy_address
),

strategy_names AS (
  SELECT 
    strategy_address,
    CASE 
      WHEN strategy_address = '0x...' THEN 'Aave Strategy'
      WHEN strategy_address = '0x...' THEN 'KlaySwap Strategy' 
      WHEN strategy_address = '0x...' THEN 'Compound Strategy'
      ELSE CONCAT('Strategy ', SUBSTRING(strategy_address, 1, 8))
    END as strategy_name,
    CASE 
      WHEN strategy_address = '0x...' THEN 'Lending'
      WHEN strategy_address = '0x...' THEN 'Liquidity Pool'
      WHEN strategy_address = '0x...' THEN 'Lending'
      ELSE 'Unknown'
    END as strategy_type
  FROM strategy_balances
),

total_allocation AS (
  SELECT SUM(current_allocation) as total_usdt
  FROM strategy_balances
  WHERE current_allocation > 0
)

SELECT 
  s.strategy_name,
  s.strategy_type,
  s.strategy_address,
  ROUND(b.current_allocation, 2) as allocation_usdt,
  ROUND(b.allocation_count, 0) as allocation_count,
  ROUND(b.deallocation_count, 0) as deallocation_count,
  CASE 
    WHEN t.total_usdt > 0 
    THEN ROUND((b.current_allocation / t.total_usdt) * 100, 2)
    ELSE 0 
  END as allocation_percentage,
  b.last_activity
FROM strategy_names s
JOIN strategy_balances b ON s.strategy_address = b.strategy_address
CROSS JOIN total_allocation t
WHERE b.current_allocation > 0
ORDER BY b.current_allocation DESC;
