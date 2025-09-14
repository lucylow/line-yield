-- KAIA Payments Database Schema
-- This schema supports the KAIA payment system with comprehensive fee structure

-- KAIA Payments table
CREATE TABLE IF NOT EXISTS kaia_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id INTEGER UNIQUE NOT NULL,
    buyer_address VARCHAR(42) NOT NULL,
    seller_address VARCHAR(42) NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    platform_fee DECIMAL(36, 18) DEFAULT 0,
    loyalty_fee DECIMAL(36, 18) DEFAULT 0,
    seller_payout DECIMAL(36, 18) DEFAULT 0,
    product_id VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    order_hash VARCHAR(66) UNIQUE NOT NULL,
    tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kaia_payments_buyer ON kaia_payments(buyer_address);
CREATE INDEX IF NOT EXISTS idx_kaia_payments_seller ON kaia_payments(seller_address);
CREATE INDEX IF NOT EXISTS idx_kaia_payments_status ON kaia_payments(status);
CREATE INDEX IF NOT EXISTS idx_kaia_payments_created_at ON kaia_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_kaia_payments_payment_id ON kaia_payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_kaia_payments_order_hash ON kaia_payments(order_hash);
CREATE INDEX IF NOT EXISTS idx_kaia_payments_tx_hash ON kaia_payments(tx_hash);

-- Payment fee structure table
CREATE TABLE IF NOT EXISTS kaia_fee_structure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_fee_percent INTEGER NOT NULL DEFAULT 250, -- 2.5% in basis points
    loyalty_fee_percent INTEGER NOT NULL DEFAULT 100,   -- 1.0% in basis points
    gas_fee_percent INTEGER NOT NULL DEFAULT 50,        -- 0.5% in basis points
    platform_wallet VARCHAR(42) NOT NULL,
    loyalty_wallet VARCHAR(42) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment statistics table
CREATE TABLE IF NOT EXISTS kaia_payment_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_volume_processed DECIMAL(36, 18) DEFAULT 0,
    total_fees_collected DECIMAL(36, 18) DEFAULT 0,
    total_payments INTEGER DEFAULT 0,
    platform_fees_collected DECIMAL(36, 18) DEFAULT 0,
    loyalty_fees_collected DECIMAL(36, 18) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment refunds table
CREATE TABLE IF NOT EXISTS kaia_payment_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id INTEGER NOT NULL REFERENCES kaia_payments(payment_id),
    refund_amount DECIMAL(36, 18) NOT NULL,
    refund_reason TEXT,
    refunded_by VARCHAR(42) NOT NULL,
    tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for refunds
CREATE INDEX IF NOT EXISTS idx_kaia_refunds_payment_id ON kaia_payment_refunds(payment_id);

-- Payment disputes table
CREATE TABLE IF NOT EXISTS kaia_payment_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id INTEGER NOT NULL REFERENCES kaia_payments(payment_id),
    dispute_type VARCHAR(50) NOT NULL, -- 'quality', 'delivery', 'fraud', 'other'
    description TEXT NOT NULL,
    raised_by VARCHAR(42) NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'resolved', 'closed'
    resolution TEXT,
    resolved_by VARCHAR(42),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for disputes
CREATE INDEX IF NOT EXISTS idx_kaia_disputes_payment_id ON kaia_payment_disputes(payment_id);
CREATE INDEX IF NOT EXISTS idx_kaia_disputes_status ON kaia_payment_disputes(status);

-- Payment analytics table for reporting
CREATE TABLE IF NOT EXISTS kaia_payment_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_volume DECIMAL(36, 18) DEFAULT 0,
    total_payments INTEGER DEFAULT 0,
    platform_fees DECIMAL(36, 18) DEFAULT 0,
    loyalty_fees DECIMAL(36, 18) DEFAULT 0,
    avg_payment_amount DECIMAL(36, 18) DEFAULT 0,
    unique_buyers INTEGER DEFAULT 0,
    unique_sellers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_kaia_analytics_date ON kaia_payment_analytics(date);

-- Insert default fee structure
INSERT INTO kaia_fee_structure (
    platform_fee_percent,
    loyalty_fee_percent,
    gas_fee_percent,
    platform_wallet,
    loyalty_wallet
) VALUES (
    250,  -- 2.5%
    100,  -- 1.0%
    50,   -- 0.5%
    '0x0000000000000000000000000000000000000000', -- Replace with actual platform wallet
    '0x0000000000000000000000000000000000000000'  -- Replace with actual loyalty wallet
) ON CONFLICT DO NOTHING;

-- Insert initial stats record
INSERT INTO kaia_payment_stats (
    total_volume_processed,
    total_fees_collected,
    total_payments,
    platform_fees_collected,
    loyalty_fees_collected
) VALUES (0, 0, 0, 0, 0) ON CONFLICT DO NOTHING;

-- Function to update payment statistics
CREATE OR REPLACE FUNCTION update_kaia_payment_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily analytics
    INSERT INTO kaia_payment_analytics (
        date,
        total_volume,
        total_payments,
        platform_fees,
        loyalty_fees,
        avg_payment_amount,
        unique_buyers,
        unique_sellers
    )
    SELECT 
        CURRENT_DATE,
        COALESCE(SUM(amount), 0),
        COUNT(*),
        COALESCE(SUM(platform_fee), 0),
        COALESCE(SUM(loyalty_fee), 0),
        COALESCE(AVG(amount), 0),
        COUNT(DISTINCT buyer_address),
        COUNT(DISTINCT seller_address)
    FROM kaia_payments
    WHERE DATE(created_at) = CURRENT_DATE
    ON CONFLICT (date) DO UPDATE SET
        total_volume = EXCLUDED.total_volume,
        total_payments = EXCLUDED.total_payments,
        platform_fees = EXCLUDED.platform_fees,
        loyalty_fees = EXCLUDED.loyalty_fees,
        avg_payment_amount = EXCLUDED.avg_payment_amount,
        unique_buyers = EXCLUDED.unique_buyers,
        unique_sellers = EXCLUDED.unique_sellers;

    -- Update overall stats
    UPDATE kaia_payment_stats SET
        total_volume_processed = (
            SELECT COALESCE(SUM(amount), 0) FROM kaia_payments
        ),
        total_fees_collected = (
            SELECT COALESCE(SUM(platform_fee + loyalty_fee), 0) FROM kaia_payments
        ),
        total_payments = (
            SELECT COUNT(*) FROM kaia_payments
        ),
        platform_fees_collected = (
            SELECT COALESCE(SUM(platform_fee), 0) FROM kaia_payments
        ),
        loyalty_fees_collected = (
            SELECT COALESCE(SUM(loyalty_fee), 0) FROM kaia_payments
        ),
        last_updated = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats when payments are created
CREATE TRIGGER trigger_update_kaia_payment_stats
    AFTER INSERT ON kaia_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_kaia_payment_stats();

-- Function to validate payment amount
CREATE OR REPLACE FUNCTION validate_kaia_payment_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- Minimum payment amount (0.001 KAIA)
    IF NEW.amount < 0.001 THEN
        RAISE EXCEPTION 'Payment amount must be at least 0.001 KAIA';
    END IF;
    
    -- Validate fee calculations
    IF NEW.platform_fee + NEW.loyalty_fee + NEW.seller_payout != NEW.amount THEN
        RAISE EXCEPTION 'Fee calculation mismatch: platform_fee + loyalty_fee + seller_payout must equal amount';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate payment amounts
CREATE TRIGGER trigger_validate_kaia_payment_amount
    BEFORE INSERT OR UPDATE ON kaia_payments
    FOR EACH ROW
    EXECUTE FUNCTION validate_kaia_payment_amount();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_kaia_payments_updated_at
    BEFORE UPDATE ON kaia_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_kaia_fee_structure_updated_at
    BEFORE UPDATE ON kaia_fee_structure
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_kaia_payment_disputes_updated_at
    BEFORE UPDATE ON kaia_payment_disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW kaia_payment_summary AS
SELECT 
    p.payment_id,
    p.buyer_address,
    p.seller_address,
    p.amount,
    p.platform_fee,
    p.loyalty_fee,
    p.seller_payout,
    p.product_id,
    p.status,
    p.created_at,
    p.completed_at,
    CASE 
        WHEN p.status = 'completed' THEN 'Completed'
        WHEN p.status = 'pending' THEN 'Pending'
        WHEN p.status = 'cancelled' THEN 'Cancelled'
        WHEN p.status = 'refunded' THEN 'Refunded'
        ELSE 'Unknown'
    END as status_display
FROM kaia_payments p;

-- View for fee structure
CREATE OR REPLACE VIEW current_kaia_fee_structure AS
SELECT 
    platform_fee_percent,
    loyalty_fee_percent,
    gas_fee_percent,
    platform_wallet,
    loyalty_wallet,
    ROUND(platform_fee_percent / 100.0, 2) as platform_fee_percentage,
    ROUND(loyalty_fee_percent / 100.0, 2) as loyalty_fee_percentage,
    ROUND(gas_fee_percent / 100.0, 2) as gas_fee_percentage
FROM kaia_fee_structure
WHERE is_active = TRUE
ORDER BY created_at DESC
LIMIT 1;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON kaia_payments TO your_app_user;
-- GRANT SELECT ON kaia_payment_summary TO your_app_user;
-- GRANT SELECT ON current_kaia_fee_structure TO your_app_user;
