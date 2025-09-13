-- LINE Yield Rewards System Database Schema
-- This schema supports the comprehensive rewards system including:
-- - User points and loyalty levels
-- - Reward tracking and history
-- - Item draw system
-- - KAIA-specific rewards

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Points Table
CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    total_points INTEGER NOT NULL DEFAULT 0,
    available_points INTEGER NOT NULL DEFAULT 0,
    used_points INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    tier VARCHAR(20) NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rewards Table
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('signup_bonus', 'loyalty', 'kaia_reward', 'item_draw', 'referral', 'achievement')),
    points INTEGER NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'credited', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES user_points(user_id) ON DELETE CASCADE
);

-- Draw Items Table
CREATE TABLE IF NOT EXISTS draw_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    points_cost INTEGER NOT NULL,
    image_url TEXT,
    metadata JSONB,
    draw_type VARCHAR(20) NOT NULL DEFAULT 'common' CHECK (draw_type IN ('common', 'premium')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Draw History Table
CREATE TABLE IF NOT EXISTS draw_history (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    item_id UUID NOT NULL,
    points_cost INTEGER NOT NULL,
    draw_type VARCHAR(20) NOT NULL CHECK (draw_type IN ('common', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES user_points(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES draw_items(id) ON DELETE CASCADE
);

-- User Nonces Table (for transaction ordering)
CREATE TABLE IF NOT EXISTS user_nonces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address VARCHAR(255) NOT NULL UNIQUE,
    nonce INTEGER NOT NULL DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction Logs Table (for audit trail)
CREATE TABLE IF NOT EXISTS transaction_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address VARCHAR(255) NOT NULL,
    method VARCHAR(50) NOT NULL,
    amount VARCHAR(255),
    tx_hash VARCHAR(255),
    nonce INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_tier ON user_points(tier);
CREATE INDEX IF NOT EXISTS idx_user_points_level ON user_points(level);

CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_type ON rewards(type);
CREATE INDEX IF NOT EXISTS idx_rewards_status ON rewards(status);
CREATE INDEX IF NOT EXISTS idx_rewards_created_at ON rewards(created_at);

CREATE INDEX IF NOT EXISTS idx_draw_items_rarity ON draw_items(rarity);
CREATE INDEX IF NOT EXISTS idx_draw_items_draw_type ON draw_items(draw_type);
CREATE INDEX IF NOT EXISTS idx_draw_items_is_active ON draw_items(is_active);

CREATE INDEX IF NOT EXISTS idx_draw_history_user_id ON draw_history(user_id);
CREATE INDEX IF NOT EXISTS idx_draw_history_created_at ON draw_history(created_at);

CREATE INDEX IF NOT EXISTS idx_user_nonces_user_address ON user_nonces(user_address);

CREATE INDEX IF NOT EXISTS idx_transaction_logs_user_address ON transaction_logs(user_address);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_created_at ON transaction_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Create functions for point management
CREATE OR REPLACE FUNCTION credit_user_points(
    user_id_param VARCHAR(255),
    points_to_add INTEGER,
    source_type VARCHAR(50)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_points (user_id, total_points, available_points, used_points, level, tier, last_updated)
    VALUES (user_id_param, points_to_add, points_to_add, 0, 1, 'bronze', NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = user_points.total_points + points_to_add,
        available_points = user_points.available_points + points_to_add,
        last_updated = NOW();
    
    -- Update reward status
    UPDATE rewards 
    SET status = 'credited' 
    WHERE user_id = user_id_param 
    AND type = source_type 
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deduct_user_points(
    user_id_param VARCHAR(255),
    points_to_deduct INTEGER,
    source_type VARCHAR(50)
) RETURNS VOID AS $$
BEGIN
    UPDATE user_points 
    SET 
        available_points = available_points - points_to_deduct,
        used_points = used_points + points_to_deduct,
        last_updated = NOW()
    WHERE user_id = user_id_param 
    AND available_points >= points_to_deduct;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient points for user %', user_id_param;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_nonce() RETURNS INTEGER AS $$
BEGIN
    RETURN 1;
END;
$$ LANGUAGE plpgsql;

-- Insert sample draw items
INSERT INTO draw_items (name, description, rarity, points_cost, draw_type, is_active) VALUES
-- Common items
('Basic Shield', 'A simple protective shield', 'common', 500, 'common', true),
('Health Potion', 'Restores health points', 'common', 500, 'common', true),
('Speed Boots', 'Increases movement speed', 'common', 500, 'common', true),
('Magic Ring', 'A ring with minor magical properties', 'common', 500, 'common', true),
('Iron Sword', 'A sturdy iron sword', 'common', 500, 'common', true),

-- Rare items
('Silver Armor', 'Lightweight silver armor', 'rare', 500, 'common', true),
('Fire Staff', 'A staff that channels fire magic', 'rare', 500, 'common', true),
('Crystal Orb', 'A mystical crystal orb', 'rare', 500, 'common', true),
('Elven Bow', 'An elegant elven bow', 'rare', 500, 'common', true),
('Dragon Scale', 'A scale from an ancient dragon', 'rare', 500, 'common', true),

-- Epic items
('Thunder Hammer', 'A hammer that strikes with thunder', 'epic', 1000, 'premium', true),
('Phoenix Feather', 'A feather from the legendary phoenix', 'epic', 1000, 'premium', true),
('Shadow Cloak', 'A cloak that grants invisibility', 'epic', 1000, 'premium', true),
('Ice Crown', 'A crown that controls ice', 'epic', 1000, 'premium', true),
('Storm Blade', 'A blade that commands storms', 'epic', 1000, 'premium', true),

-- Legendary items
('Excalibur', 'The legendary sword of kings', 'legendary', 1000, 'premium', true),
('Holy Grail', 'The sacred cup of eternal life', 'legendary', 1000, 'premium', true),
('Dragon Heart', 'The heart of an ancient dragon', 'legendary', 1000, 'premium', true),
('Phoenix Egg', 'An egg that contains a phoenix', 'legendary', 1000, 'premium', true),
('World Tree Branch', 'A branch from the world tree', 'legendary', 1000, 'premium', true);

-- Create Row Level Security (RLS) policies
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_points
CREATE POLICY "Users can view their own points" ON user_points
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Service role can manage all points" ON user_points
    FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for rewards
CREATE POLICY "Users can view their own rewards" ON rewards
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Service role can manage all rewards" ON rewards
    FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for draw_history
CREATE POLICY "Users can view their own draw history" ON draw_history
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Service role can manage all draw history" ON draw_history
    FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for analytics_events
CREATE POLICY "Users can view their own analytics" ON analytics_events
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Service role can manage all analytics" ON analytics_events
    FOR ALL USING (current_setting('role') = 'service_role');

-- Create views for easier querying
CREATE VIEW user_rewards_summary AS
SELECT 
    up.user_id,
    up.total_points,
    up.available_points,
    up.level,
    up.tier,
    COUNT(r.id) as total_rewards,
    COUNT(CASE WHEN r.status = 'credited' THEN 1 END) as credited_rewards,
    COUNT(CASE WHEN r.type = 'signup_bonus' THEN 1 END) as signup_bonuses,
    COUNT(CASE WHEN r.type = 'loyalty' THEN 1 END) as loyalty_rewards,
    COUNT(CASE WHEN r.type = 'kaia_reward' THEN 1 END) as kaia_rewards
FROM user_points up
LEFT JOIN rewards r ON up.user_id = r.user_id
GROUP BY up.user_id, up.total_points, up.available_points, up.level, up.tier;

CREATE VIEW draw_statistics AS
SELECT 
    di.rarity,
    di.draw_type,
    COUNT(dh.id) as total_draws,
    COUNT(CASE WHEN dh.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as draws_last_24h,
    COUNT(CASE WHEN dh.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as draws_last_7d
FROM draw_items di
LEFT JOIN draw_history dh ON di.id = dh.item_id
GROUP BY di.rarity, di.draw_type;

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_user_level() RETURNS TRIGGER AS $$
DECLARE
    new_level INTEGER;
    new_tier VARCHAR(20);
BEGIN
    -- Calculate new level based on total points
    new_level := 1;
    new_tier := 'bronze';
    
    IF NEW.total_points >= 10000 THEN
        new_level := 5;
        new_tier := 'diamond';
    ELSIF NEW.total_points >= 5000 THEN
        new_level := 4;
        new_tier := 'platinum';
    ELSIF NEW.total_points >= 2500 THEN
        new_level := 3;
        new_tier := 'gold';
    ELSIF NEW.total_points >= 1000 THEN
        new_level := 2;
        new_tier := 'silver';
    END IF;
    
    NEW.level := new_level;
    NEW.tier := new_tier;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
    BEFORE UPDATE ON user_points
    FOR EACH ROW
    EXECUTE FUNCTION update_user_level();

-- Create a function to clean up expired rewards
CREATE OR REPLACE FUNCTION cleanup_expired_rewards() RETURNS VOID AS $$
BEGIN
    UPDATE rewards 
    SET status = 'expired' 
    WHERE expires_at < NOW() 
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Create a function to get leaderboard
CREATE OR REPLACE FUNCTION get_points_leaderboard(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
    rank BIGINT,
    user_id VARCHAR(255),
    total_points INTEGER,
    level INTEGER,
    tier VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as rank,
        up.user_id,
        up.total_points,
        up.level,
        up.tier
    FROM user_points up
    ORDER BY up.total_points DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Comments for documentation
COMMENT ON TABLE user_points IS 'Stores user points, levels, and loyalty tiers';
COMMENT ON TABLE rewards IS 'Tracks all reward transactions and their status';
COMMENT ON TABLE draw_items IS 'Available items for the draw system';
COMMENT ON TABLE draw_history IS 'History of item draws performed by users';
COMMENT ON TABLE user_nonces IS 'Transaction nonces for user ordering';
COMMENT ON TABLE transaction_logs IS 'Audit trail for all transactions';
COMMENT ON TABLE analytics_events IS 'User activity and event tracking';

COMMENT ON FUNCTION credit_user_points IS 'Credits points to a user account';
COMMENT ON FUNCTION deduct_user_points IS 'Deducts points from a user account';
COMMENT ON FUNCTION cleanup_expired_rewards IS 'Marks expired rewards as expired';
COMMENT ON FUNCTION get_points_leaderboard IS 'Returns the points leaderboard';


