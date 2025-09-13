-- LINE Yield Referral System Database Schema
-- This schema extends the existing database with referral functionality

-- Add referral fields to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_level INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_earnings TEXT DEFAULT '0';

-- Create indexes for referral fields
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_referral_level ON users(referral_level);

-- Referral rewards table (extends existing rewards table)
-- The existing rewards table already supports referral type rewards

-- Referral tracking table for detailed analytics
CREATE TABLE IF NOT EXISTS referral_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_address VARCHAR(255) NOT NULL,
    referred_address VARCHAR(255) NOT NULL,
    referral_code VARCHAR(8) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('signup', 'deposit', 'withdraw', 'yield_earned')),
    points_awarded INTEGER DEFAULT 0,
    amount VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (referrer_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
    FOREIGN KEY (referred_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- Referral campaigns table for managing different referral programs
CREATE TABLE IF NOT EXISTS referral_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    referrer_rewards JSONB NOT NULL DEFAULT '{}',
    referred_rewards JSONB NOT NULL DEFAULT '{}',
    max_referrals_per_user INTEGER,
    max_total_referrals INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral campaign participants
CREATE TABLE IF NOT EXISTS referral_campaign_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES referral_campaigns(id) ON DELETE CASCADE,
    user_address VARCHAR(255) NOT NULL,
    referral_code VARCHAR(8) NOT NULL,
    total_referrals INTEGER DEFAULT 0,
    total_earnings INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
    UNIQUE(campaign_id, user_address)
);

-- Create indexes for referral tracking
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer ON referral_tracking(referrer_address);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referred ON referral_tracking(referred_address);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_event_type ON referral_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_created_at ON referral_tracking(created_at DESC);

-- Create indexes for referral campaigns
CREATE INDEX IF NOT EXISTS idx_referral_campaigns_active ON referral_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_referral_campaigns_dates ON referral_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign ON referral_campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_user ON referral_campaign_participants(user_address);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    code VARCHAR(8);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate random 8-character hex code
        code := encode(gen_random_bytes(4), 'hex');
        
        -- Check if code already exists
        SELECT COUNT(*) INTO exists_count
        FROM users
        WHERE referral_code = code;
        
        -- If code doesn't exist, return it
        IF exists_count = 0 THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to award referral rewards
CREATE OR REPLACE FUNCTION award_referral_reward(
    referrer_addr VARCHAR(255),
    referred_addr VARCHAR(255),
    event_type VARCHAR(50),
    points INTEGER,
    amount VARCHAR(255) DEFAULT NULL,
    metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Insert into referral tracking
    INSERT INTO referral_tracking (
        referrer_address,
        referred_address,
        referral_code,
        event_type,
        points_awarded,
        amount,
        metadata
    ) VALUES (
        referrer_addr,
        referred_addr,
        (SELECT referral_code FROM users WHERE wallet_address = referrer_addr),
        event_type,
        points,
        amount,
        metadata
    );
    
    -- Update referrer's earnings
    UPDATE users 
    SET referral_earnings = (
        COALESCE(referral_earnings::NUMERIC, 0) + points
    )::TEXT
    WHERE wallet_address = referrer_addr;
    
    -- Create reward record
    INSERT INTO rewards (
        user_id,
        type,
        points,
        description,
        metadata,
        status
    ) VALUES (
        referrer_addr,
        'referral',
        points,
        'Referral reward: ' || event_type,
        COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
            'referred_address', referred_addr,
            'event_type', event_type
        ),
        'pending'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get referral statistics
CREATE OR REPLACE FUNCTION get_referral_stats(user_addr VARCHAR(255))
RETURNS TABLE (
    total_referrals BIGINT,
    active_referrals BIGINT,
    total_earnings NUMERIC,
    pending_rewards NUMERIC,
    referral_code VARCHAR(8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT u.wallet_address) as total_referrals,
        COUNT(DISTINCT CASE WHEN u.total_deposited::NUMERIC > 0 THEN u.wallet_address END) as active_referrals,
        COALESCE(SUM(rt.points_awarded), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN r.status = 'pending' THEN r.points ELSE 0 END), 0) as pending_rewards,
        u2.referral_code
    FROM users u2
    LEFT JOIN users u ON u.referred_by = u2.wallet_address
    LEFT JOIN referral_tracking rt ON rt.referrer_address = u2.wallet_address
    LEFT JOIN rewards r ON r.user_id = u2.wallet_address AND r.type = 'referral'
    WHERE u2.wallet_address = user_addr
    GROUP BY u2.wallet_address, u2.referral_code;
END;
$$ LANGUAGE plpgsql;

-- Function to validate referral code
CREATE OR REPLACE FUNCTION validate_referral_code(code VARCHAR(8))
RETURNS TABLE (
    is_valid BOOLEAN,
    referrer_address VARCHAR(255),
    referral_code VARCHAR(8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE WHEN u.wallet_address IS NOT NULL THEN true ELSE false END as is_valid,
        u.wallet_address as referrer_address,
        u.referral_code
    FROM users u
    WHERE u.referral_code = code;
END;
$$ LANGUAGE plpgsql;

-- Function to get referral leaderboard
CREATE OR REPLACE FUNCTION get_referral_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    rank BIGINT,
    wallet_address VARCHAR(255),
    referral_code VARCHAR(8),
    total_referrals BIGINT,
    active_referrals BIGINT,
    total_earnings NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT u.wallet_address) DESC) as rank,
        u2.wallet_address,
        u2.referral_code,
        COUNT(DISTINCT u.wallet_address) as total_referrals,
        COUNT(DISTINCT CASE WHEN u.total_deposited::NUMERIC > 0 THEN u.wallet_address END) as active_referrals,
        COALESCE(SUM(rt.points_awarded), 0) as total_earnings
    FROM users u2
    LEFT JOIN users u ON u.referred_by = u2.wallet_address
    LEFT JOIN referral_tracking rt ON rt.referrer_address = u2.wallet_address
    WHERE u2.referral_code IS NOT NULL
    GROUP BY u2.wallet_address, u2.referral_code
    ORDER BY total_referrals DESC, total_earnings DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate referral code for new users
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_referral_code();

-- Insert default referral campaign
INSERT INTO referral_campaigns (
    name,
    description,
    start_date,
    end_date,
    is_active,
    referrer_rewards,
    referred_rewards,
    max_referrals_per_user,
    max_total_referrals
) VALUES (
    'LINE Yield Launch Campaign',
    'Initial referral campaign for LINE Yield launch',
    NOW(),
    NOW() + INTERVAL '1 year',
    true,
    '{"signup": 100, "deposit": 50, "yield_share": 0.1}'::jsonb,
    '{"signup": 100, "deposit": 50, "apy_boost": 0.02}'::jsonb,
    100,
    10000
) ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) Policies for new tables
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_campaign_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_tracking
CREATE POLICY "Users can view their own referral tracking" ON referral_tracking
    FOR SELECT USING (
        referrer_address = current_setting('app.current_user_address', true) OR
        referred_address = current_setting('app.current_user_address', true)
    );

CREATE POLICY "Service role can manage all referral tracking" ON referral_tracking
    FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for referral_campaigns
CREATE POLICY "Anyone can view active campaigns" ON referral_campaigns
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage all campaigns" ON referral_campaigns
    FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for referral_campaign_participants
CREATE POLICY "Users can view their own campaign participation" ON referral_campaign_participants
    FOR SELECT USING (user_address = current_setting('app.current_user_address', true));

CREATE POLICY "Service role can manage all campaign participants" ON referral_campaign_participants
    FOR ALL USING (current_setting('role') = 'service_role');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Comments for documentation
COMMENT ON TABLE referral_tracking IS 'Detailed tracking of referral events and rewards';
COMMENT ON TABLE referral_campaigns IS 'Referral campaigns with different reward structures';
COMMENT ON TABLE referral_campaign_participants IS 'Users participating in referral campaigns';

COMMENT ON FUNCTION generate_referral_code IS 'Generates a unique 8-character referral code';
COMMENT ON FUNCTION award_referral_reward IS 'Awards referral rewards and tracks the event';
COMMENT ON FUNCTION get_referral_stats IS 'Returns comprehensive referral statistics for a user';
COMMENT ON FUNCTION validate_referral_code IS 'Validates if a referral code exists and returns referrer info';
COMMENT ON FUNCTION get_referral_leaderboard IS 'Returns the top referrers by referral count and earnings';


