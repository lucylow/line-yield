-- Loan System Database Schema
-- This extends the existing LINE Yield database with loan management functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Loan Types Table
CREATE TABLE IF NOT EXISTS loan_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_amount DECIMAL(20, 8) NOT NULL,
    min_amount DECIMAL(20, 8) NOT NULL,
    interest_rate_bps INTEGER NOT NULL, -- Annual interest rate in basis points
    collateral_ratio_bps INTEGER NOT NULL, -- Required collateral ratio in basis points
    duration_seconds INTEGER NOT NULL, -- Loan duration in seconds
    liquidation_threshold_bps INTEGER NOT NULL, -- Liquidation threshold in basis points
    penalty_rate_bps INTEGER NOT NULL, -- Penalty rate for late payments in basis points
    active BOOLEAN DEFAULT true,
    requires_kyc BOOLEAN DEFAULT false,
    max_borrowers INTEGER DEFAULT 0, -- 0 means unlimited
    current_borrowers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    loan_type_id INTEGER REFERENCES loan_types(id),
    borrower_address TEXT NOT NULL, -- Wallet address of borrower
    principal_amount DECIMAL(20, 8) NOT NULL,
    collateral_amount DECIMAL(20, 8) NOT NULL,
    start_timestamp INTEGER NOT NULL, -- Unix timestamp
    repaid_amount DECIMAL(20, 8) DEFAULT 0,
    last_payment_timestamp INTEGER,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Repaid', 'Liquidated', 'Defaulted', 'Cancelled')),
    interest_accrued DECIMAL(20, 8) DEFAULT 0,
    is_liquidated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Payments Table
CREATE TABLE IF NOT EXISTS loan_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id INTEGER REFERENCES loans(id),
    amount DECIMAL(20, 8) NOT NULL,
    interest_paid DECIMAL(20, 8) DEFAULT 0,
    principal_paid DECIMAL(20, 8) DEFAULT 0,
    payment_type VARCHAR(20) DEFAULT 'repayment' CHECK (payment_type IN ('repayment', 'partial_repayment', 'full_repayment')),
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Collateral Changes Table
CREATE TABLE IF NOT EXISTS loan_collateral_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id INTEGER REFERENCES loans(id),
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('added', 'withdrawn', 'liquidated')),
    amount DECIMAL(20, 8) NOT NULL,
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Liquidations Table
CREATE TABLE IF NOT EXISTS loan_liquidations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id INTEGER REFERENCES loans(id),
    liquidator_address TEXT NOT NULL,
    collateral_seized DECIMAL(20, 8) NOT NULL,
    debt_amount DECIMAL(20, 8) NOT NULL,
    liquidation_reason VARCHAR(50),
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User KYC Table
CREATE TABLE IF NOT EXISTS user_kyc (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address TEXT UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT false,
    kyc_provider VARCHAR(50),
    kyc_level VARCHAR(20) DEFAULT 'basic',
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Credit Scores Table
CREATE TABLE IF NOT EXISTS user_credit_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address TEXT NOT NULL,
    credit_score INTEGER NOT NULL CHECK (credit_score >= 0 AND credit_score <= 1000),
    score_type VARCHAR(20) DEFAULT 'default' CHECK (score_type IN ('default', 'on_chain', 'off_chain', 'hybrid')),
    factors JSONB, -- Store factors that contributed to the score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token Prices Table (for oracle data)
CREATE TABLE IF NOT EXISTS token_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_address TEXT NOT NULL,
    token_symbol VARCHAR(20),
    price_usd DECIMAL(20, 8) NOT NULL,
    price_source VARCHAR(50) DEFAULT 'oracle',
    timestamp INTEGER NOT NULL, -- Unix timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Logs Table (for audit trail)
CREATE TABLE IF NOT EXISTS loan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id INTEGER REFERENCES loans(id),
    loan_type_id INTEGER REFERENCES loan_types(id),
    borrower_address TEXT,
    action VARCHAR(50) NOT NULL, -- created, repaid, liquidated, etc.
    amount DECIMAL(20, 8),
    metadata JSONB,
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_loans_borrower_address ON loans(borrower_address);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_loan_type_id ON loans(loan_type_id);
CREATE INDEX IF NOT EXISTS idx_loans_start_timestamp ON loans(start_timestamp);
CREATE INDEX IF NOT EXISTS idx_loans_is_liquidated ON loans(is_liquidated);

CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_created_at ON loan_payments(created_at);

CREATE INDEX IF NOT EXISTS idx_loan_collateral_changes_loan_id ON loan_collateral_changes(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_collateral_changes_change_type ON loan_collateral_changes(change_type);

CREATE INDEX IF NOT EXISTS idx_loan_liquidations_loan_id ON loan_liquidations(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_liquidations_liquidator ON loan_liquidations(liquidator_address);

CREATE INDEX IF NOT EXISTS idx_user_kyc_user_address ON user_kyc(user_address);
CREATE INDEX IF NOT EXISTS idx_user_kyc_verified ON user_kyc(verified);

CREATE INDEX IF NOT EXISTS idx_user_credit_scores_user_address ON user_credit_scores(user_address);
CREATE INDEX IF NOT EXISTS idx_user_credit_scores_score ON user_credit_scores(credit_score);

CREATE INDEX IF NOT EXISTS idx_token_prices_token_address ON token_prices(token_address);
CREATE INDEX IF NOT EXISTS idx_token_prices_timestamp ON token_prices(timestamp);

CREATE INDEX IF NOT EXISTS idx_loan_logs_loan_id ON loan_logs(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_logs_action ON loan_logs(action);
CREATE INDEX IF NOT EXISTS idx_loan_logs_borrower_address ON loan_logs(borrower_address);

-- Row Level Security (RLS) policies
ALTER TABLE loan_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_collateral_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_liquidations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loan_types (public read, admin write)
CREATE POLICY "Anyone can view loan types" ON loan_types FOR SELECT USING (true);
CREATE POLICY "Service role can manage loan types" ON loan_types FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for loans (users can view their own loans)
CREATE POLICY "Users can view their own loans" ON loans FOR SELECT USING (borrower_address = current_setting('app.current_user_id', true));
CREATE POLICY "Service role can manage all loans" ON loans FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for loan_payments (users can view their own loan payments)
CREATE POLICY "Users can view their own loan payments" ON loan_payments FOR SELECT USING (
    loan_id IN (SELECT id FROM loans WHERE borrower_address = current_setting('app.current_user_id', true))
);
CREATE POLICY "Service role can manage all loan payments" ON loan_payments FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for loan_collateral_changes (users can view their own changes)
CREATE POLICY "Users can view their own collateral changes" ON loan_collateral_changes FOR SELECT USING (
    loan_id IN (SELECT id FROM loans WHERE borrower_address = current_setting('app.current_user_id', true))
);
CREATE POLICY "Service role can manage all collateral changes" ON loan_collateral_changes FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for loan_liquidations (users can view their own liquidations)
CREATE POLICY "Users can view their own liquidations" ON loan_liquidations FOR SELECT USING (
    loan_id IN (SELECT id FROM loans WHERE borrower_address = current_setting('app.current_user_id', true))
);
CREATE POLICY "Service role can manage all liquidations" ON loan_liquidations FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for user_kyc (users can view their own KYC status)
CREATE POLICY "Users can view their own KYC status" ON user_kyc FOR SELECT USING (user_address = current_setting('app.current_user_id', true));
CREATE POLICY "Service role can manage all KYC" ON user_kyc FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for user_credit_scores (users can view their own credit scores)
CREATE POLICY "Users can view their own credit scores" ON user_credit_scores FOR SELECT USING (user_address = current_setting('app.current_user_id', true));
CREATE POLICY "Service role can manage all credit scores" ON user_credit_scores FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for token_prices (public read, oracle write)
CREATE POLICY "Anyone can view token prices" ON token_prices FOR SELECT USING (true);
CREATE POLICY "Oracle role can manage token prices" ON token_prices FOR ALL USING (current_setting('role') = 'oracle_role');

-- RLS Policies for loan_logs (users can view their own loan logs)
CREATE POLICY "Users can view their own loan logs" ON loan_logs FOR SELECT USING (borrower_address = current_setting('app.current_user_id', true));
CREATE POLICY "Service role can manage all loan logs" ON loan_logs FOR ALL USING (current_setting('role') = 'service_role');

-- Functions for loan management

-- Function to update loan type borrower count
CREATE OR REPLACE FUNCTION update_loan_type_borrower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE loan_types 
        SET current_borrowers = current_borrowers + 1,
            updated_at = NOW()
        WHERE id = NEW.loan_type_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status != NEW.status THEN
            IF OLD.status = 'Active' AND NEW.status != 'Active' THEN
                UPDATE loan_types 
                SET current_borrowers = current_borrowers - 1,
                    updated_at = NOW()
                WHERE id = NEW.loan_type_id;
            ELSIF OLD.status != 'Active' AND NEW.status = 'Active' THEN
                UPDATE loan_types 
                SET current_borrowers = current_borrowers + 1,
                    updated_at = NOW()
                WHERE id = NEW.loan_type_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE loan_types 
        SET current_borrowers = current_borrowers - 1,
            updated_at = NOW()
        WHERE id = OLD.loan_type_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update borrower count
CREATE TRIGGER trigger_update_loan_type_borrower_count
    AFTER INSERT OR UPDATE OR DELETE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_loan_type_borrower_count();

-- Function to calculate loan interest
CREATE OR REPLACE FUNCTION calculate_loan_interest(
    p_loan_id INTEGER,
    p_current_timestamp INTEGER DEFAULT NULL
)
RETURNS DECIMAL(20, 8) AS $$
DECLARE
    v_loan loans%ROWTYPE;
    v_loan_type loan_types%ROWTYPE;
    v_time_elapsed INTEGER;
    v_interest DECIMAL(20, 8);
BEGIN
    -- Get loan details
    SELECT * INTO v_loan FROM loans WHERE id = p_loan_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Loan not found: %', p_loan_id;
    END IF;
    
    -- Get loan type details
    SELECT * INTO v_loan_type FROM loan_types WHERE id = v_loan.loan_type_id;
    
    -- Calculate time elapsed
    v_time_elapsed := COALESCE(p_current_timestamp, EXTRACT(EPOCH FROM NOW())::INTEGER) - v_loan.start_timestamp;
    
    -- Cap at loan duration
    IF v_time_elapsed > v_loan_type.duration_seconds THEN
        v_time_elapsed := v_loan_type.duration_seconds;
    END IF;
    
    -- Calculate interest: principal * rate * time / (10000 * 365 days)
    v_interest := (v_loan.principal_amount * v_loan_type.interest_rate_bps * v_time_elapsed) / (10000 * 365 * 24 * 60 * 60);
    
    RETURN v_interest;
END;
$$ LANGUAGE plpgsql;

-- Function to check if loan is liquidatable
CREATE OR REPLACE FUNCTION is_loan_liquidatable(p_loan_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_loan loans%ROWTYPE;
    v_loan_type loan_types%ROWTYPE;
    v_current_timestamp INTEGER;
    v_total_owed DECIMAL(20, 8);
    v_collateral_value DECIMAL(20, 8);
    v_current_ratio INTEGER;
BEGIN
    -- Get loan details
    SELECT * INTO v_loan FROM loans WHERE id = p_loan_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get loan type details
    SELECT * INTO v_loan_type FROM loan_types WHERE id = v_loan.loan_type_id;
    
    v_current_timestamp := EXTRACT(EPOCH FROM NOW())::INTEGER;
    
    -- Check if overdue
    IF v_current_timestamp > v_loan.start_timestamp + v_loan_type.duration_seconds THEN
        RETURN TRUE;
    END IF;
    
    -- Calculate total owed
    v_total_owed := v_loan.principal_amount + calculate_loan_interest(p_loan_id, v_current_timestamp) - v_loan.repaid_amount;
    
    -- For simplicity, assume 1:1 collateral value (in real implementation, use price oracle)
    v_collateral_value := v_loan.collateral_amount;
    
    -- Calculate current collateral ratio
    v_current_ratio := (v_collateral_value * 10000) / v_total_owed;
    
    -- Check if undercollateralized
    IF v_current_ratio < v_loan_type.liquidation_threshold_bps THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get loan statistics
CREATE OR REPLACE FUNCTION get_loan_statistics(p_user_address TEXT DEFAULT NULL)
RETURNS TABLE (
    total_loans BIGINT,
    active_loans BIGINT,
    repaid_loans BIGINT,
    liquidated_loans BIGINT,
    total_borrowed DECIMAL(20, 8),
    total_repaid DECIMAL(20, 8),
    total_collateral DECIMAL(20, 8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_loans,
        COUNT(*) FILTER (WHERE status = 'Active') as active_loans,
        COUNT(*) FILTER (WHERE status = 'Repaid') as repaid_loans,
        COUNT(*) FILTER (WHERE status = 'Liquidated') as liquidated_loans,
        COALESCE(SUM(principal_amount), 0) as total_borrowed,
        COALESCE(SUM(repaid_amount), 0) as total_repaid,
        COALESCE(SUM(collateral_amount), 0) as total_collateral
    FROM loans
    WHERE (p_user_address IS NULL OR borrower_address = p_user_address);
END;
$$ LANGUAGE plpgsql;

-- Insert default loan types
INSERT INTO loan_types (
    name, description, max_amount, min_amount, interest_rate_bps, 
    collateral_ratio_bps, duration_seconds, liquidation_threshold_bps, 
    penalty_rate_bps, requires_kyc, max_borrowers
) VALUES 
(
    'Quick Cash',
    'Short-term loan for immediate liquidity needs',
    1000.00,
    100.00,
    500, -- 5% APR
    15000, -- 150%
    2592000, -- 30 days
    12000, -- 120%
    1000, -- 10% APR penalty
    false,
    0 -- Unlimited
),
(
    'Business Loan',
    'Medium-term loan for business operations',
    10000.00,
    1000.00,
    800, -- 8% APR
    20000, -- 200%
    7776000, -- 90 days
    15000, -- 150%
    1500, -- 15% APR penalty
    true,
    100
),
(
    'Premium Loan',
    'Long-term loan with competitive rates for high-value borrowers',
    100000.00,
    10000.00,
    300, -- 3% APR
    30000, -- 300%
    31536000, -- 1 year
    25000, -- 250%
    500, -- 5% APR penalty
    true,
    50
);

-- Create views for common queries

-- View for active loans with calculated fields
CREATE OR REPLACE VIEW active_loans_view AS
SELECT 
    l.*,
    lt.name as loan_type_name,
    lt.interest_rate_bps,
    lt.collateral_ratio_bps,
    lt.liquidation_threshold_bps,
    lt.duration_seconds,
    calculate_loan_interest(l.id) as current_interest,
    (l.principal_amount + calculate_loan_interest(l.id) - l.repaid_amount) as total_owed,
    (l.collateral_amount * 10000 / (l.principal_amount + calculate_loan_interest(l.id) - l.repaid_amount)) as current_collateral_ratio,
    (l.start_timestamp + lt.duration_seconds - EXTRACT(EPOCH FROM NOW())::INTEGER) as seconds_remaining,
    CASE 
        WHEN l.start_timestamp + lt.duration_seconds < EXTRACT(EPOCH FROM NOW())::INTEGER THEN true
        ELSE false
    END as is_overdue
FROM loans l
JOIN loan_types lt ON l.loan_type_id = lt.id
WHERE l.status = 'Active';

-- View for loan type statistics
CREATE OR REPLACE VIEW loan_type_stats_view AS
SELECT 
    lt.*,
    COUNT(l.id) as total_loans,
    COUNT(l.id) FILTER (WHERE l.status = 'Active') as active_loans,
    COUNT(l.id) FILTER (WHERE l.status = 'Repaid') as repaid_loans,
    COUNT(l.id) FILTER (WHERE l.status = 'Liquidated') as liquidated_loans,
    COALESCE(SUM(l.principal_amount), 0) as total_volume,
    COALESCE(AVG(l.principal_amount), 0) as avg_loan_size
FROM loan_types lt
LEFT JOIN loans l ON lt.id = l.loan_type_id
GROUP BY lt.id;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION calculate_loan_interest(INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_loan_liquidatable(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_loan_statistics(TEXT) TO anon, authenticated;
