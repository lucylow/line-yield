-- Tokenomics Database Schema for LINE Yield
-- This schema supports tokenomics, staking, governance, and rewards tracking

-- Staking events table
CREATE TABLE IF NOT EXISTS staking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address VARCHAR(42) NOT NULL,
    amount VARCHAR(78) NOT NULL, -- Large number for token amounts
    action VARCHAR(20) NOT NULL CHECK (action IN ('stake', 'unstake', 'claim')),
    transaction_hash VARCHAR(66) NOT NULL,
    timestamp INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staking leaderboard table (updated periodically)
CREATE TABLE IF NOT EXISTS staking_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address VARCHAR(42) NOT NULL UNIQUE,
    staked_balance VARCHAR(78) NOT NULL DEFAULT '0',
    voting_power VARCHAR(78) NOT NULL DEFAULT '0',
    pending_rewards VARCHAR(78) NOT NULL DEFAULT '0',
    last_stake_time INTEGER,
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Governance proposals table
CREATE TABLE IF NOT EXISTS governance_proposals (
    id SERIAL PRIMARY KEY,
    proposer VARCHAR(42) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    for_votes VARCHAR(78) NOT NULL DEFAULT '0',
    against_votes VARCHAR(78) NOT NULL DEFAULT '0',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'passed', 'rejected', 'executed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Governance votes table
CREATE TABLE IF NOT EXISTS governance_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id INTEGER NOT NULL REFERENCES governance_proposals(id) ON DELETE CASCADE,
    voter VARCHAR(42) NOT NULL,
    support BOOLEAN NOT NULL,
    voting_power VARCHAR(78) NOT NULL,
    timestamp INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, voter) -- One vote per user per proposal
);

-- Token distribution tracking
CREATE TABLE IF NOT EXISTS token_distribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    total_amount VARCHAR(78) NOT NULL,
    distributed_amount VARCHAR(78) NOT NULL DEFAULT '0',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token transfers tracking
CREATE TABLE IF NOT EXISTS token_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_address VARCHAR(42),
    to_address VARCHAR(42) NOT NULL,
    amount VARCHAR(78) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    block_number INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    transfer_type VARCHAR(20) NOT NULL CHECK (transfer_type IN ('transfer', 'mint', 'burn', 'stake', 'unstake')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token price history
CREATE TABLE IF NOT EXISTS token_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_usd DECIMAL(20,8) NOT NULL,
    market_cap_usd DECIMAL(20,2),
    volume_24h_usd DECIMAL(20,2),
    price_change_24h DECIMAL(8,4),
    timestamp INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User token balances (cached for performance)
CREATE TABLE IF NOT EXISTS user_token_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address VARCHAR(42) NOT NULL UNIQUE,
    balance VARCHAR(78) NOT NULL DEFAULT '0',
    staked_balance VARCHAR(78) NOT NULL DEFAULT '0',
    voting_power VARCHAR(78) NOT NULL DEFAULT '0',
    total_earned VARCHAR(78) NOT NULL DEFAULT '0',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tokenomics metrics (daily snapshots)
CREATE TABLE IF NOT EXISTS tokenomics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_supply VARCHAR(78) NOT NULL,
    circulating_supply VARCHAR(78) NOT NULL,
    total_staked VARCHAR(78) NOT NULL,
    total_voting_power VARCHAR(78) NOT NULL,
    staking_rate DECIMAL(8,4) NOT NULL,
    price_usd DECIMAL(20,8),
    market_cap_usd DECIMAL(20,2),
    volume_24h_usd DECIMAL(20,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rewards distribution history
CREATE TABLE IF NOT EXISTS rewards_distribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address VARCHAR(42) NOT NULL,
    reward_amount VARCHAR(78) NOT NULL,
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('staking', 'referral', 'nft', 'liquidity', 'governance')),
    transaction_hash VARCHAR(66),
    block_number INTEGER,
    timestamp INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token utility tracking
CREATE TABLE IF NOT EXISTS token_utility_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address VARCHAR(42) NOT NULL,
    utility_type VARCHAR(50) NOT NULL CHECK (utility_type IN ('governance_vote', 'fee_discount', 'premium_access', 'staking_reward')),
    amount_used VARCHAR(78),
    description TEXT,
    timestamp INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staking_events_user_address ON staking_events(user_address);
CREATE INDEX IF NOT EXISTS idx_staking_events_timestamp ON staking_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_staking_events_action ON staking_events(action);

CREATE INDEX IF NOT EXISTS idx_staking_leaderboard_staked_balance ON staking_leaderboard(staked_balance DESC);
CREATE INDEX IF NOT EXISTS idx_staking_leaderboard_address ON staking_leaderboard(address);

CREATE INDEX IF NOT EXISTS idx_governance_proposals_status ON governance_proposals(status);
CREATE INDEX IF NOT EXISTS idx_governance_proposals_end_time ON governance_proposals(end_time);
CREATE INDEX IF NOT EXISTS idx_governance_votes_proposal_id ON governance_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_governance_votes_voter ON governance_votes(voter);

CREATE INDEX IF NOT EXISTS idx_token_transfers_from_address ON token_transfers(from_address);
CREATE INDEX IF NOT EXISTS idx_token_transfers_to_address ON token_transfers(to_address);
CREATE INDEX IF NOT EXISTS idx_token_transfers_timestamp ON token_transfers(timestamp);
CREATE INDEX IF NOT EXISTS idx_token_transfers_type ON token_transfers(transfer_type);

CREATE INDEX IF NOT EXISTS idx_token_price_history_timestamp ON token_price_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_address ON user_token_balances(user_address);

CREATE INDEX IF NOT EXISTS idx_rewards_distribution_user_address ON rewards_distribution(user_address);
CREATE INDEX IF NOT EXISTS idx_rewards_distribution_type ON rewards_distribution(reward_type);
CREATE INDEX IF NOT EXISTS idx_rewards_distribution_timestamp ON rewards_distribution(timestamp);

CREATE INDEX IF NOT EXISTS idx_token_utility_usage_user_address ON token_utility_usage(user_address);
CREATE INDEX IF NOT EXISTS idx_token_utility_usage_type ON token_utility_usage(utility_type);

-- Row Level Security (RLS) policies
ALTER TABLE staking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_utility_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own staking events
CREATE POLICY "Users can view own staking events" ON staking_events
    FOR SELECT USING (user_address = current_setting('app.current_user_address', true));

-- Policy: Users can only see their own votes
CREATE POLICY "Users can view own votes" ON governance_votes
    FOR SELECT USING (voter = current_setting('app.current_user_address', true));

-- Policy: Users can only see their own balances
CREATE POLICY "Users can view own balances" ON user_token_balances
    FOR SELECT USING (user_address = current_setting('app.current_user_address', true));

-- Policy: Users can only see their own rewards
CREATE POLICY "Users can view own rewards" ON rewards_distribution
    FOR SELECT USING (user_address = current_setting('app.current_user_address', true));

-- Policy: Users can only see their own utility usage
CREATE POLICY "Users can view own utility usage" ON token_utility_usage
    FOR SELECT USING (user_address = current_setting('app.current_user_address', true));

-- Functions for tokenomics calculations
CREATE OR REPLACE FUNCTION calculate_staking_rate()
RETURNS DECIMAL(8,4) AS $$
DECLARE
    total_supply VARCHAR(78);
    total_staked VARCHAR(78);
    rate DECIMAL(8,4);
BEGIN
    SELECT 
        COALESCE(SUM(CAST(balance AS NUMERIC)), 0) + COALESCE(SUM(CAST(staked_balance AS NUMERIC)), 0),
        COALESCE(SUM(CAST(staked_balance AS NUMERIC)), 0)
    INTO total_supply, total_staked
    FROM user_token_balances;
    
    IF total_supply = 0 THEN
        RETURN 0;
    END IF;
    
    rate := (total_staked / total_supply) * 100;
    RETURN rate;
END;
$$ LANGUAGE plpgsql;

-- Function to update staking leaderboard
CREATE OR REPLACE FUNCTION update_staking_leaderboard()
RETURNS VOID AS $$
BEGIN
    -- Clear existing leaderboard
    DELETE FROM staking_leaderboard;
    
    -- Insert updated leaderboard with rankings
    INSERT INTO staking_leaderboard (address, staked_balance, voting_power, pending_rewards, last_stake_time, rank)
    SELECT 
        user_address,
        staked_balance,
        voting_power,
        '0', -- pending_rewards would be calculated separately
        EXTRACT(EPOCH FROM last_updated)::INTEGER,
        ROW_NUMBER() OVER (ORDER BY CAST(staked_balance AS NUMERIC) DESC)
    FROM user_token_balances
    WHERE CAST(staked_balance AS NUMERIC) > 0
    ORDER BY CAST(staked_balance AS NUMERIC) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get tokenomics summary
CREATE OR REPLACE FUNCTION get_tokenomics_summary()
RETURNS TABLE (
    total_supply VARCHAR(78),
    circulating_supply VARCHAR(78),
    total_staked VARCHAR(78),
    total_voting_power VARCHAR(78),
    staking_rate DECIMAL(8,4),
    total_holders INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CAST(balance AS NUMERIC))::VARCHAR(78), '0'),
        COALESCE(SUM(CAST(balance AS NUMERIC))::VARCHAR(78), '0'),
        COALESCE(SUM(CAST(staked_balance AS NUMERIC))::VARCHAR(78), '0'),
        COALESCE(SUM(CAST(voting_power AS NUMERIC))::VARCHAR(78), '0'),
        calculate_staking_rate(),
        COUNT(*)::INTEGER
    FROM user_token_balances
    WHERE CAST(balance AS NUMERIC) > 0 OR CAST(staked_balance AS NUMERIC) > 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leaderboard when staking events occur
CREATE OR REPLACE FUNCTION trigger_update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_staking_leaderboard();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leaderboard_trigger
    AFTER INSERT OR UPDATE OR DELETE ON staking_events
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_update_leaderboard();

-- Insert initial token distribution data
INSERT INTO token_distribution (category, percentage, total_amount, description) VALUES
('Liquidity Mining', 30.00, '300000000000000000000000000', 'Rewards for providing liquidity and staking'),
('Team & Development', 20.00, '200000000000000000000000000', 'Team allocation with 2-year vesting'),
('Ecosystem Development', 25.00, '250000000000000000000000000', 'Partnerships, integrations, and ecosystem growth'),
('Community Rewards', 15.00, '150000000000000000000000000', 'Referral bonuses, NFT rewards, and community incentives'),
('Reserve Fund', 10.00, '100000000000000000000000000', 'Emergency fund and future development')
ON CONFLICT DO NOTHING;

-- Insert sample governance proposals
INSERT INTO governance_proposals (proposer, title, description, start_time, end_time, for_votes, against_votes, status) VALUES
('0x1234567890123456789012345678901234567890', 'Increase Staking APY to 12%', 'Proposal to increase the staking rewards from 10% to 12% APY to attract more stakers and improve token utility.', EXTRACT(EPOCH FROM NOW())::INTEGER, EXTRACT(EPOCH FROM NOW() + INTERVAL '7 days')::INTEGER, '1250000000000000000000000', '450000000000000000000000', 'active'),
('0x2345678901234567890123456789012345678901', 'Add New Collateral Types', 'Proposal to add USDC and WBTC as collateral types for loans to increase platform utility and attract more users.', EXTRACT(EPOCH FROM NOW())::INTEGER, EXTRACT(EPOCH FROM NOW() + INTERVAL '7 days')::INTEGER, '890000000000000000000000', '210000000000000000000000', 'active')
ON CONFLICT DO NOTHING;

