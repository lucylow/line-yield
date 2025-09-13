-- Credit Scoring Database Schema
-- This schema supports the onchain credit scoring system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Credit Events Table
-- Stores all credit-related events for audit and analytics
CREATE TABLE credit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(42) NOT NULL, -- Ethereum address
    type VARCHAR(50) NOT NULL CHECK (type IN ('loan_created', 'loan_repaid', 'loan_defaulted', 'score_updated', 'profile_created')),
    amount DECIMAL(18, 8), -- Amount in wei or USD
    score INTEGER, -- Credit score at time of event
    reason TEXT NOT NULL, -- Description of the event
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tx_hash VARCHAR(66), -- Blockchain transaction hash
    block_number BIGINT, -- Blockchain block number
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Profiles Table
-- Stores user credit profiles and scores
CREATE TABLE credit_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(42) UNIQUE NOT NULL, -- Ethereum address
    score INTEGER NOT NULL DEFAULT 500 CHECK (score >= 0 AND score <= 1000),
    total_borrowed DECIMAL(18, 8) DEFAULT 0,
    total_repaid DECIMAL(18, 8) DEFAULT 0,
    active_loans INTEGER DEFAULT 0,
    completed_loans INTEGER DEFAULT 0,
    late_payments INTEGER DEFAULT 0,
    on_time_payments INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table
-- Stores loan information and status
CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    loan_id BIGINT UNIQUE NOT NULL, -- Onchain loan ID
    borrower VARCHAR(42) NOT NULL, -- Ethereum address
    amount DECIMAL(18, 8) NOT NULL,
    interest_rate INTEGER NOT NULL, -- In basis points (e.g., 500 = 5%)
    duration INTEGER NOT NULL, -- Duration in seconds
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount_repaid DECIMAL(18, 8) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_defaulted BOOLEAN DEFAULT false,
    purpose TEXT NOT NULL,
    collateral_amount DECIMAL(18, 8), -- Optional collateral
    collateral_token VARCHAR(42), -- Token contract address
    tx_hash VARCHAR(66), -- Creation transaction hash
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Repayments Table
-- Tracks individual loan repayments
CREATE TABLE loan_repayments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id BIGINT NOT NULL REFERENCES loans(loan_id),
    amount DECIMAL(18, 8) NOT NULL,
    repayment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tx_hash VARCHAR(66),
    block_number BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Score History Table
-- Tracks credit score changes over time
CREATE TABLE credit_score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(42) NOT NULL,
    old_score INTEGER,
    new_score INTEGER NOT NULL,
    change_reason TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    loan_id BIGINT, -- Reference to loan if applicable
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Score Factors Table
-- Stores configurable credit score factors
CREATE TABLE credit_score_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factor_name VARCHAR(100) UNIQUE NOT NULL,
    factor_value INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default credit score factors
INSERT INTO credit_score_factors (factor_name, factor_value, description) VALUES
('on_time_payment_bonus', 20, 'Points added for on-time payments'),
('late_payment_penalty', 50, 'Points deducted for late payments'),
('default_penalty', 200, 'Points deducted for loan defaults'),
('completion_bonus', 30, 'Points added for completing loans'),
('activity_bonus', 5, 'Points added for account activity'),
('score_decay_amount', 10, 'Points deducted for inactivity'),
('score_decay_period', 2592000, 'Inactivity period in seconds (30 days)');

-- Credit Analytics Table
-- Stores aggregated analytics data
CREATE TABLE credit_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    total_loans INTEGER DEFAULT 0,
    total_borrowed DECIMAL(18, 8) DEFAULT 0,
    total_repaid DECIMAL(18, 8) DEFAULT 0,
    active_loans INTEGER DEFAULT 0,
    defaulted_loans INTEGER DEFAULT 0,
    avg_credit_score DECIMAL(5, 2) DEFAULT 0,
    avg_interest_rate DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Indexes for performance
CREATE INDEX idx_credit_events_user_id ON credit_events(user_id);
CREATE INDEX idx_credit_events_type ON credit_events(type);
CREATE INDEX idx_credit_events_timestamp ON credit_events(timestamp);
CREATE INDEX idx_credit_events_tx_hash ON credit_events(tx_hash);

CREATE INDEX idx_credit_profiles_user_id ON credit_profiles(user_id);
CREATE INDEX idx_credit_profiles_score ON credit_profiles(score);
CREATE INDEX idx_credit_profiles_is_active ON credit_profiles(is_active);

CREATE INDEX idx_loans_borrower ON loans(borrower);
CREATE INDEX idx_loans_loan_id ON loans(loan_id);
CREATE INDEX idx_loans_is_active ON loans(is_active);
CREATE INDEX idx_loans_due_date ON loans(due_date);

CREATE INDEX idx_loan_repayments_loan_id ON loan_repayments(loan_id);
CREATE INDEX idx_loan_repayments_date ON loan_repayments(repayment_date);

CREATE INDEX idx_credit_score_history_user_id ON credit_score_history(user_id);
CREATE INDEX idx_credit_score_history_timestamp ON credit_score_history(timestamp);

CREATE INDEX idx_credit_analytics_date ON credit_analytics(date);

-- Functions for credit scoring operations

-- Function to update credit profile after events
CREATE OR REPLACE FUNCTION update_credit_profile(
    p_user_id VARCHAR(42),
    p_event_type VARCHAR(50),
    p_amount DECIMAL(18, 8) DEFAULT 0,
    p_loan_id BIGINT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_profile RECORD;
BEGIN
    -- Get current profile
    SELECT * INTO v_profile FROM credit_profiles WHERE user_id = p_user_id;
    
    -- Update profile based on event type
    CASE p_event_type
        WHEN 'loan_created' THEN
            UPDATE credit_profiles 
            SET total_borrowed = total_borrowed + p_amount,
                active_loans = active_loans + 1,
                last_activity = NOW(),
                updated_at = NOW()
            WHERE user_id = p_user_id;
            
        WHEN 'loan_repaid' THEN
            UPDATE credit_profiles 
            SET total_repaid = total_repaid + p_amount,
                on_time_payments = on_time_payments + 1,
                last_activity = NOW(),
                updated_at = NOW()
            WHERE user_id = p_user_id;
            
        WHEN 'loan_defaulted' THEN
            UPDATE credit_profiles 
            SET active_loans = GREATEST(active_loans - 1, 0),
                late_payments = late_payments + 1,
                last_activity = NOW(),
                updated_at = NOW()
            WHERE user_id = p_user_id;
            
        WHEN 'loan_completed' THEN
            UPDATE credit_profiles 
            SET active_loans = GREATEST(active_loans - 1, 0),
                completed_loans = completed_loans + 1,
                last_activity = NOW(),
                updated_at = NOW()
            WHERE user_id = p_user_id;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate credit score
CREATE OR REPLACE FUNCTION calculate_credit_score(
    p_user_id VARCHAR(42)
) RETURNS INTEGER AS $$
DECLARE
    v_profile RECORD;
    v_score INTEGER := 500; -- Base score
    v_factors RECORD;
BEGIN
    -- Get user profile
    SELECT * INTO v_profile FROM credit_profiles WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN 500; -- Default score for new users
    END IF;
    
    -- Get credit score factors
    SELECT * INTO v_factors FROM credit_score_factors WHERE is_active = true;
    
    -- Calculate score based on factors
    v_score := v_score + (v_profile.on_time_payments * v_factors.on_time_payment_bonus);
    v_score := v_score - (v_profile.late_payments * v_factors.late_payment_penalty);
    
    -- Apply completion bonus
    IF v_profile.completed_loans > 0 THEN
        v_score := v_score + (v_profile.completed_loans * v_factors.completion_bonus);
    END IF;
    
    -- Apply activity bonus (if user was active in last 30 days)
    IF v_profile.last_activity > NOW() - INTERVAL '30 days' THEN
        v_score := v_score + v_factors.activity_bonus;
    END IF;
    
    -- Ensure score is within bounds
    v_score := GREATEST(0, LEAST(1000, v_score));
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Function to apply score decay
CREATE OR REPLACE FUNCTION apply_score_decay(
    p_user_id VARCHAR(42)
) RETURNS VOID AS $$
DECLARE
    v_profile RECORD;
    v_decay_period INTEGER;
    v_decay_amount INTEGER;
BEGIN
    -- Get decay parameters
    SELECT factor_value INTO v_decay_period FROM credit_score_factors WHERE factor_name = 'score_decay_period';
    SELECT factor_value INTO v_decay_amount FROM credit_score_factors WHERE factor_name = 'score_decay_amount';
    
    -- Get user profile
    SELECT * INTO v_profile FROM credit_profiles WHERE user_id = p_user_id;
    
    -- Apply decay if user has been inactive
    IF v_profile.last_activity < NOW() - INTERVAL '1 second' * v_decay_period THEN
        UPDATE credit_profiles 
        SET score = GREATEST(score - v_decay_amount, 0),
            last_activity = NOW(),
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get loan statistics
CREATE OR REPLACE FUNCTION get_loan_statistics()
RETURNS TABLE(
    total_loans BIGINT,
    active_loans BIGINT,
    total_borrowed DECIMAL(18, 8),
    total_repaid DECIMAL(18, 8),
    defaulted_loans BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_loans,
        COUNT(*) FILTER (WHERE is_active = true) as active_loans,
        COALESCE(SUM(amount), 0) as total_borrowed,
        COALESCE(SUM(amount_repaid), 0) as total_repaid,
        COUNT(*) FILTER (WHERE is_defaulted = true) as defaulted_loans
    FROM loans;
END;
$$ LANGUAGE plpgsql;

-- Function to get user credit summary
CREATE OR REPLACE FUNCTION get_user_credit_summary(p_user_id VARCHAR(42))
RETURNS TABLE(
    credit_score INTEGER,
    tier VARCHAR(20),
    total_borrowed DECIMAL(18, 8),
    total_repaid DECIMAL(18, 8),
    active_loans INTEGER,
    completed_loans INTEGER,
    on_time_payments INTEGER,
    late_payments INTEGER
) AS $$
DECLARE
    v_profile RECORD;
    v_tier VARCHAR(20);
BEGIN
    -- Get user profile
    SELECT * INTO v_profile FROM credit_profiles WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Determine credit tier
    CASE 
        WHEN v_profile.score >= 800 THEN v_tier := 'Excellent';
        WHEN v_profile.score >= 700 THEN v_tier := 'Good';
        WHEN v_profile.score >= 600 THEN v_tier := 'Fair';
        WHEN v_profile.score >= 500 THEN v_tier := 'Poor';
        ELSE v_tier := 'Very Poor';
    END CASE;
    
    RETURN QUERY
    SELECT 
        v_profile.score,
        v_tier,
        v_profile.total_borrowed,
        v_profile.total_repaid,
        v_profile.active_loans,
        v_profile.completed_loans,
        v_profile.on_time_payments,
        v_profile.late_payments;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updates

-- Trigger to update credit profile when events are inserted
CREATE OR REPLACE FUNCTION trigger_update_credit_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Update credit profile based on event
    PERFORM update_credit_profile(NEW.user_id, NEW.type, NEW.amount, NULL);
    
    -- Insert into credit score history if score changed
    IF NEW.type = 'score_updated' AND NEW.score IS NOT NULL THEN
        INSERT INTO credit_score_history (user_id, new_score, change_reason, event_type, tx_hash)
        VALUES (NEW.user_id, NEW.score, NEW.reason, NEW.type, NEW.tx_hash);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_credit_events_update_profile
    AFTER INSERT ON credit_events
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_credit_profile();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_credit_profiles_update_timestamp
    BEFORE UPDATE ON credit_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER trigger_loans_update_timestamp
    BEFORE UPDATE ON loans
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER trigger_credit_score_factors_update_timestamp
    BEFORE UPDATE ON credit_score_factors
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER trigger_credit_analytics_update_timestamp
    BEFORE UPDATE ON credit_analytics
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE credit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_score_history ENABLE ROW LEVEL SECURITY;

-- Policies for credit_events
CREATE POLICY "Users can view their own credit events" ON credit_events
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Service role can manage all credit events" ON credit_events
    FOR ALL USING (current_setting('app.current_user_role', true) = 'service_role');

-- Policies for credit_profiles
CREATE POLICY "Users can view their own credit profile" ON credit_profiles
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Service role can manage all credit profiles" ON credit_profiles
    FOR ALL USING (current_setting('app.current_user_role', true) = 'service_role');

-- Policies for loans
CREATE POLICY "Users can view their own loans" ON loans
    FOR SELECT USING (borrower = current_setting('app.current_user_id', true));

CREATE POLICY "Service role can manage all loans" ON loans
    FOR ALL USING (current_setting('app.current_user_role', true) = 'service_role');

-- Policies for loan_repayments
CREATE POLICY "Users can view repayments for their loans" ON loan_repayments
    FOR SELECT USING (
        loan_id IN (
            SELECT loan_id FROM loans 
            WHERE borrower = current_setting('app.current_user_id', true)
        )
    );

CREATE POLICY "Service role can manage all loan repayments" ON loan_repayments
    FOR ALL USING (current_setting('app.current_user_role', true) = 'service_role');

-- Policies for credit_score_history
CREATE POLICY "Users can view their own credit score history" ON credit_score_history
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Service role can manage all credit score history" ON credit_score_history
    FOR ALL USING (current_setting('app.current_user_role', true) = 'service_role');

-- Views for common queries

-- View for user credit dashboard
CREATE VIEW user_credit_dashboard AS
SELECT 
    cp.user_id,
    cp.score,
    CASE 
        WHEN cp.score >= 800 THEN 'Excellent'
        WHEN cp.score >= 700 THEN 'Good'
        WHEN cp.score >= 600 THEN 'Fair'
        WHEN cp.score >= 500 THEN 'Poor'
        ELSE 'Very Poor'
    END as tier,
    cp.total_borrowed,
    cp.total_repaid,
    cp.active_loans,
    cp.completed_loans,
    cp.on_time_payments,
    cp.late_payments,
    cp.last_activity,
    cp.is_active,
    COUNT(l.loan_id) as total_loans,
    COUNT(l.loan_id) FILTER (WHERE l.is_active = true) as current_active_loans,
    COUNT(l.loan_id) FILTER (WHERE l.is_defaulted = true) as defaulted_loans
FROM credit_profiles cp
LEFT JOIN loans l ON cp.user_id = l.borrower
GROUP BY cp.user_id, cp.score, cp.total_borrowed, cp.total_repaid, 
         cp.active_loans, cp.completed_loans, cp.on_time_payments, 
         cp.late_payments, cp.last_activity, cp.is_active;

-- View for loan analytics
CREATE VIEW loan_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as loans_created,
    SUM(amount) as total_amount,
    AVG(interest_rate) as avg_interest_rate,
    COUNT(*) FILTER (WHERE is_active = true) as active_loans,
    COUNT(*) FILTER (WHERE is_defaulted = true) as defaulted_loans
FROM loans
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE credit_events IS 'Stores all credit-related events for audit and analytics';
COMMENT ON TABLE credit_profiles IS 'Stores user credit profiles and scores';
COMMENT ON TABLE loans IS 'Stores loan information and status';
COMMENT ON TABLE loan_repayments IS 'Tracks individual loan repayments';
COMMENT ON TABLE credit_score_history IS 'Tracks credit score changes over time';
COMMENT ON TABLE credit_score_factors IS 'Stores configurable credit score factors';
COMMENT ON TABLE credit_analytics IS 'Stores aggregated analytics data';

COMMENT ON FUNCTION update_credit_profile IS 'Updates credit profile after events';
COMMENT ON FUNCTION calculate_credit_score IS 'Calculates credit score based on user behavior';
COMMENT ON FUNCTION apply_score_decay IS 'Applies score decay for inactive users';
COMMENT ON FUNCTION get_loan_statistics IS 'Returns loan statistics';
COMMENT ON FUNCTION get_user_credit_summary IS 'Returns user credit summary';
