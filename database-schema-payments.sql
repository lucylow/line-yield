-- LINE Yield Payments System Database Schema
-- This schema supports both Stripe and crypto payments with Supabase integration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('stripe', 'crypto')),
    amount DECIMAL(18, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    tx_hash VARCHAR(255), -- Blockchain transaction hash
    metadata JSONB, -- Additional payment data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Methods Table (for storing user payment preferences)
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('stripe', 'crypto')),
    method_data JSONB NOT NULL, -- Encrypted payment method data
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    refund_id VARCHAR(255), -- Stripe refund ID
    amount DECIMAL(18, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Webhooks Table (for tracking webhook events)
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'crypto')),
    event_type VARCHAR(100) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_provider ON payment_webhooks(provider);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_type ON payment_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON payment_webhooks(processed);

-- Create functions for payment management
CREATE OR REPLACE FUNCTION update_payment_status(
    payment_id_param UUID,
    new_status VARCHAR(20),
    tx_hash_param VARCHAR(255) DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE payments 
    SET 
        status = new_status,
        tx_hash = COALESCE(tx_hash_param, tx_hash),
        updated_at = NOW()
    WHERE id = payment_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_payment_stats(user_id_param VARCHAR(255) DEFAULT NULL)
RETURNS TABLE (
    total_payments BIGINT,
    total_amount DECIMAL,
    success_rate DECIMAL,
    stripe_payments BIGINT,
    crypto_payments BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(amount), 0) as total_amount,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100
            ELSE 0 
        END as success_rate,
        COUNT(CASE WHEN type = 'stripe' THEN 1 END) as stripe_payments,
        COUNT(CASE WHEN type = 'crypto' THEN 1 END) as crypto_payments
    FROM payments
    WHERE user_id_param IS NULL OR user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_refund(
    payment_id_param UUID,
    refund_amount DECIMAL,
    refund_reason TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    refund_id UUID;
    payment_record RECORD;
BEGIN
    -- Get payment details
    SELECT * INTO payment_record FROM payments WHERE id = payment_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found';
    END IF;
    
    -- Create refund record
    INSERT INTO refunds (
        payment_id,
        amount,
        currency,
        reason,
        status
    ) VALUES (
        payment_id_param,
        refund_amount,
        payment_record.currency,
        refund_reason,
        'pending'
    ) RETURNING id INTO refund_id;
    
    -- Update payment status
    UPDATE payments 
    SET 
        status = 'refunded',
        updated_at = NOW()
    WHERE id = payment_id_param;
    
    RETURN refund_id;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_refunds_updated_at
    BEFORE UPDATE ON refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for easier querying
CREATE VIEW payment_summary AS
SELECT 
    p.id,
    p.user_id,
    p.type,
    p.amount,
    p.currency,
    p.status,
    p.created_at,
    CASE 
        WHEN p.type = 'stripe' THEN 'Card Payment'
        WHEN p.type = 'crypto' THEN 'Crypto Payment'
        ELSE 'Unknown'
    END as payment_type_display,
    CASE 
        WHEN p.status = 'completed' THEN '✅ Completed'
        WHEN p.status = 'pending' THEN '⏳ Pending'
        WHEN p.status = 'failed' THEN '❌ Failed'
        WHEN p.status = 'refunded' THEN '🔄 Refunded'
        ELSE '❓ Unknown'
    END as status_display
FROM payments p;

CREATE VIEW user_payment_stats AS
SELECT 
    user_id,
    COUNT(*) as total_payments,
    SUM(amount) as total_amount,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_payments,
    COUNT(CASE WHEN type = 'stripe' THEN 1 END) as stripe_payments,
    COUNT(CASE WHEN type = 'crypto' THEN 1 END) as crypto_payments,
    ROUND(
        (COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
        2
    ) as success_rate_percentage
FROM payments
GROUP BY user_id;

-- Row Level Security (RLS) policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Service role can manage all payments" ON payments
    FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their own payment methods" ON payment_methods
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Service role can manage all payment methods" ON payment_methods
    FOR ALL USING (current_setting('role') = 'service_role');

-- RLS Policies for refunds
CREATE POLICY "Users can view their own refunds" ON refunds
    FOR SELECT USING (
        payment_id IN (
            SELECT id FROM payments WHERE user_id = current_setting('app.current_user_id', true)
        )
    );

CREATE POLICY "Service role can manage all refunds" ON refunds
    FOR ALL USING (current_setting('role') = 'service_role');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Comments for documentation
COMMENT ON TABLE payments IS 'Stores all payment transactions (Stripe and crypto)';
COMMENT ON TABLE payment_methods IS 'Stores user payment method preferences';
COMMENT ON TABLE refunds IS 'Tracks refund transactions';
COMMENT ON TABLE payment_webhooks IS 'Logs webhook events from payment providers';

COMMENT ON FUNCTION update_payment_status IS 'Updates payment status and transaction hash';
COMMENT ON FUNCTION get_payment_stats IS 'Returns payment statistics for a user or globally';
COMMENT ON FUNCTION process_refund IS 'Processes a refund for a payment';

-- Sample data for testing (optional)
-- INSERT INTO payments (user_id, type, amount, currency, status, payment_intent_id) VALUES
-- ('user123', 'stripe', 10.00, 'usd', 'completed', 'pi_test_123'),
-- ('user123', 'crypto', 0.1, 'eth', 'completed', NULL),
-- ('user456', 'stripe', 25.00, 'usd', 'pending', 'pi_test_456');


