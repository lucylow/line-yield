-- QR Payment System Database Schema
-- This schema extends the existing Line Yield database with QR payment functionality

-- QR Payment Sessions Table
CREATE TABLE IF NOT EXISTS qr_payment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
    token VARCHAR(20) NOT NULL DEFAULT 'USDT',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
    user_address VARCHAR(42) NOT NULL,
    vault_address VARCHAR(42) NOT NULL,
    payer_address VARCHAR(42),
    transaction_hash VARCHAR(66),
    qr_code_data TEXT NOT NULL,
    description TEXT,
    reference VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_qr_sessions_user_address (user_address),
    INDEX idx_qr_sessions_status (status),
    INDEX idx_qr_sessions_created_at (created_at),
    INDEX idx_qr_sessions_expires_at (expires_at),
    INDEX idx_qr_sessions_session_id (session_id)
);

-- QR Payment Transactions Table (for detailed transaction tracking)
CREATE TABLE IF NOT EXISTS qr_payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL REFERENCES qr_payment_sessions(session_id) ON DELETE CASCADE,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    token VARCHAR(20) NOT NULL,
    gas_used BIGINT,
    gas_price DECIMAL(20, 8),
    block_number BIGINT,
    block_hash VARCHAR(66),
    transaction_index INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for performance
    INDEX idx_qr_transactions_session_id (session_id),
    INDEX idx_qr_transactions_hash (transaction_hash),
    INDEX idx_qr_transactions_from_address (from_address),
    INDEX idx_qr_transactions_to_address (to_address),
    INDEX idx_qr_transactions_status (status),
    INDEX idx_qr_transactions_created_at (created_at)
);

-- QR Payment Events Table (for audit trail and webhooks)
CREATE TABLE IF NOT EXISTS qr_payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL REFERENCES qr_payment_sessions(session_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'session_created',
        'session_expired',
        'session_cancelled',
        'payment_initiated',
        'payment_confirmed',
        'payment_failed',
        'webhook_received',
        'status_updated'
    )),
    event_data JSONB,
    source VARCHAR(50) NOT NULL DEFAULT 'system' CHECK (source IN ('system', 'webhook', 'user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_qr_events_session_id (session_id),
    INDEX idx_qr_events_event_type (event_type),
    INDEX idx_qr_events_created_at (created_at),
    INDEX idx_qr_events_source (source)
);

-- QR Payment Statistics Table (for analytics and reporting)
CREATE TABLE IF NOT EXISTS qr_payment_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    pending_sessions INTEGER NOT NULL DEFAULT 0,
    paid_sessions INTEGER NOT NULL DEFAULT 0,
    expired_sessions INTEGER NOT NULL DEFAULT 0,
    cancelled_sessions INTEGER NOT NULL DEFAULT 0,
    total_volume DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_fees DECIMAL(20, 8) NOT NULL DEFAULT 0,
    avg_session_amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate daily stats
    UNIQUE(date)
);

-- QR Payment Webhooks Table (for webhook management)
CREATE TABLE IF NOT EXISTS qr_payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL REFERENCES qr_payment_sessions(session_id) ON DELETE CASCADE,
    webhook_url TEXT NOT NULL,
    webhook_secret VARCHAR(255),
    event_types TEXT[] NOT NULL DEFAULT ARRAY['payment_confirmed'],
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'failed')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    last_success_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_qr_webhooks_session_id (session_id),
    INDEX idx_qr_webhooks_status (status),
    INDEX idx_qr_webhooks_created_at (created_at)
);

-- QR Payment Webhook Logs Table (for webhook delivery tracking)
CREATE TABLE IF NOT EXISTS qr_payment_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES qr_payment_webhooks(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    error_message TEXT,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_qr_webhook_logs_webhook_id (webhook_id),
    INDEX idx_qr_webhook_logs_session_id (session_id),
    INDEX idx_qr_webhook_logs_created_at (created_at)
);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_qr_payment_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_qr_payment_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_qr_payment_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER trigger_qr_payment_sessions_updated_at
    BEFORE UPDATE ON qr_payment_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_qr_payment_sessions_updated_at();

CREATE TRIGGER trigger_qr_payment_statistics_updated_at
    BEFORE UPDATE ON qr_payment_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_qr_payment_statistics_updated_at();

CREATE TRIGGER trigger_qr_payment_webhooks_updated_at
    BEFORE UPDATE ON qr_payment_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_qr_payment_webhooks_updated_at();

-- Function to automatically expire sessions
CREATE OR REPLACE FUNCTION expire_qr_payment_sessions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE qr_payment_sessions 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Log the expiration event
    INSERT INTO qr_payment_events (session_id, event_type, event_data, source)
    SELECT 
        session_id,
        'session_expired',
        jsonb_build_object('expired_count', expired_count),
        'system'
    FROM qr_payment_sessions 
    WHERE status = 'expired' 
    AND updated_at > NOW() - INTERVAL '1 minute';
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily statistics
CREATE OR REPLACE FUNCTION update_qr_payment_daily_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO qr_payment_statistics (
        date,
        total_sessions,
        pending_sessions,
        paid_sessions,
        expired_sessions,
        cancelled_sessions,
        total_volume,
        avg_session_amount
    )
    SELECT 
        target_date,
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'pending'),
        COUNT(*) FILTER (WHERE status = 'paid'),
        COUNT(*) FILTER (WHERE status = 'expired'),
        COUNT(*) FILTER (WHERE status = 'cancelled'),
        COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0),
        COALESCE(AVG(amount) FILTER (WHERE status = 'paid'), 0)
    FROM qr_payment_sessions
    WHERE DATE(created_at) = target_date
    ON CONFLICT (date) DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        pending_sessions = EXCLUDED.pending_sessions,
        paid_sessions = EXCLUDED.paid_sessions,
        expired_sessions = EXCLUDED.expired_sessions,
        cancelled_sessions = EXCLUDED.cancelled_sessions,
        total_volume = EXCLUDED.total_volume,
        avg_session_amount = EXCLUDED.avg_session_amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Views for common queries
CREATE OR REPLACE VIEW qr_payment_session_summary AS
SELECT 
    s.session_id,
    s.amount,
    s.token,
    s.status,
    s.user_address,
    s.vault_address,
    s.payer_address,
    s.transaction_hash,
    s.description,
    s.reference,
    s.expires_at,
    s.created_at,
    s.updated_at,
    CASE 
        WHEN s.status = 'pending' AND s.expires_at < NOW() THEN 'expired'
        ELSE s.status
    END as actual_status,
    EXTRACT(EPOCH FROM (s.expires_at - s.created_at)) as duration_seconds,
    EXTRACT(EPOCH FROM (NOW() - s.created_at)) as age_seconds,
    CASE 
        WHEN s.expires_at > NOW() THEN EXTRACT(EPOCH FROM (s.expires_at - NOW()))
        ELSE 0
    END as remaining_seconds
FROM qr_payment_sessions s;

-- View for user payment history
CREATE OR REPLACE VIEW qr_payment_user_history AS
SELECT 
    s.session_id,
    s.amount,
    s.token,
    s.status,
    s.description,
    s.reference,
    s.created_at,
    s.expires_at,
    s.payer_address,
    s.transaction_hash,
    t.gas_used,
    t.gas_price,
    t.block_number,
    t.confirmed_at
FROM qr_payment_sessions s
LEFT JOIN qr_payment_transactions t ON s.session_id = t.session_id
ORDER BY s.created_at DESC;

-- Sample data for testing (optional)
-- INSERT INTO qr_payment_sessions (
--     session_id,
--     amount,
--     token,
--     user_address,
--     vault_address,
--     qr_code_data,
--     description,
--     expires_at
-- ) VALUES (
--     'test-session-001',
--     100.50,
--     'USDT',
--     '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4',
--     '0x1234567890123456789012345678901234567890',
--     '{"type":"line-yield-payment","sessionId":"test-session-001","amount":"100.50","token":"USDT"}',
--     'Test payment session',
--     NOW() + INTERVAL '15 minutes'
-- );

-- Comments for documentation
COMMENT ON TABLE qr_payment_sessions IS 'Stores QR payment session data including amounts, status, and metadata';
COMMENT ON TABLE qr_payment_transactions IS 'Detailed transaction records for confirmed payments';
COMMENT ON TABLE qr_payment_events IS 'Audit trail of all payment-related events';
COMMENT ON TABLE qr_payment_statistics IS 'Daily aggregated statistics for analytics';
COMMENT ON TABLE qr_payment_webhooks IS 'Webhook configuration for payment notifications';
COMMENT ON TABLE qr_payment_webhook_logs IS 'Logs of webhook delivery attempts and responses';

COMMENT ON FUNCTION expire_qr_payment_sessions() IS 'Automatically expires pending sessions that have passed their expiry time';
COMMENT ON FUNCTION update_qr_payment_daily_stats(DATE) IS 'Updates daily statistics for QR payment sessions';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON qr_payment_sessions TO line_yield_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON qr_payment_transactions TO line_yield_app;
-- GRANT SELECT, INSERT ON qr_payment_events TO line_yield_app;
-- GRANT SELECT, INSERT, UPDATE ON qr_payment_statistics TO line_yield_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON qr_payment_webhooks TO line_yield_app;
-- GRANT SELECT, INSERT ON qr_payment_webhook_logs TO line_yield_app;



