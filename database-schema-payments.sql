-- Payments and Inventory Database Schema for LINE Yield
-- This schema supports in-app purchases, inventory management, and payment processing

-- User inventory table
CREATE TABLE IF NOT EXISTS user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL, -- Can be wallet address or email
    item_id VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id, purchased_at) -- Allow multiple purchases of same item
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    amount VARCHAR(78) NOT NULL, -- Large number for token amounts
    currency VARCHAR(10) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('crypto', 'stripe')),
    transaction_hash VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id VARCHAR(100),
    stripe_customer_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stripe customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_customer_id VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item usage tracking
CREATE TABLE IF NOT EXISTS item_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('purchased', 'activated', 'used', 'expired', 'deactivated')),
    quantity INTEGER NOT NULL DEFAULT 1,
    metadata JSONB, -- Store additional data like effects applied, duration, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active effects tracking
CREATE TABLE IF NOT EXISTS active_effects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    effect_type VARCHAR(50) NOT NULL,
    effect_value DECIMAL(10,4) NOT NULL,
    effect_duration INTEGER, -- Duration in seconds
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment analytics table (daily snapshots)
CREATE TABLE IF NOT EXISTS payment_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_revenue DECIMAL(20,2) NOT NULL DEFAULT 0,
    crypto_payments INTEGER NOT NULL DEFAULT 0,
    stripe_payments INTEGER NOT NULL DEFAULT 0,
    total_transactions INTEGER NOT NULL DEFAULT 0,
    average_order_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    unique_customers INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item popularity tracking
CREATE TABLE IF NOT EXISTS item_popularity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    purchases INTEGER NOT NULL DEFAULT 0,
    revenue DECIMAL(20,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, date)
);

-- Refund requests table
CREATE TABLE IF NOT EXISTS refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
    refund_amount VARCHAR(78),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_id ON user_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_active ON user_inventory(is_active);
CREATE INDEX IF NOT EXISTS idx_user_inventory_expires ON user_inventory(expires_at);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_method ON payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_item_usage_log_user_id ON item_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_item_usage_log_item_id ON item_usage_log(item_id);
CREATE INDEX IF NOT EXISTS idx_item_usage_log_action ON item_usage_log(action);

CREATE INDEX IF NOT EXISTS idx_active_effects_user_id ON active_effects(user_id);
CREATE INDEX IF NOT EXISTS idx_active_effects_active ON active_effects(is_active);
CREATE INDEX IF NOT EXISTS idx_active_effects_expires ON active_effects(expires_at);

CREATE INDEX IF NOT EXISTS idx_payment_analytics_date ON payment_analytics(date);
CREATE INDEX IF NOT EXISTS idx_item_popularity_item_id ON item_popularity(item_id);
CREATE INDEX IF NOT EXISTS idx_item_popularity_date ON item_popularity(date);

CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);

-- Row Level Security (RLS) policies
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own inventory
CREATE POLICY "Users can view own inventory" ON user_inventory
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only see their own payment transactions
CREATE POLICY "Users can view own payments" ON payment_transactions
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only see their own item usage
CREATE POLICY "Users can view own item usage" ON item_usage_log
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only see their own active effects
CREATE POLICY "Users can view own effects" ON active_effects
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only see their own refund requests
CREATE POLICY "Users can view own refunds" ON refund_requests
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Functions for inventory management
CREATE OR REPLACE FUNCTION add_item_to_inventory(
    p_user_id VARCHAR(255),
    p_item_id VARCHAR(100),
    p_quantity INTEGER DEFAULT 1,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_inventory (user_id, item_id, quantity, expires_at)
    VALUES (p_user_id, p_item_id, p_quantity, p_expires_at)
    ON CONFLICT (user_id, item_id, purchased_at) DO UPDATE
    SET quantity = user_inventory.quantity + p_quantity,
        updated_at = NOW();
    
    -- Log the purchase
    INSERT INTO item_usage_log (user_id, item_id, action, quantity)
    VALUES (p_user_id, p_item_id, 'purchased', p_quantity);
END;
$$ LANGUAGE plpgsql;

-- Function to activate an item
CREATE OR REPLACE FUNCTION activate_item(
    p_user_id VARCHAR(255),
    p_item_id VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
    item_exists BOOLEAN;
BEGIN
    -- Check if user has the item
    SELECT EXISTS(
        SELECT 1 FROM user_inventory 
        WHERE user_id = p_user_id 
        AND item_id = p_item_id 
        AND quantity > 0
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO item_exists;
    
    IF NOT item_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Update inventory to mark as active
    UPDATE user_inventory 
    SET is_active = TRUE, updated_at = NOW()
    WHERE user_id = p_user_id AND item_id = p_item_id;
    
    -- Log the activation
    INSERT INTO item_usage_log (user_id, item_id, action)
    VALUES (p_user_id, p_item_id, 'activated');
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to use a consumable item
CREATE OR REPLACE FUNCTION use_item(
    p_user_id VARCHAR(255),
    p_item_id VARCHAR(100),
    p_quantity INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    available_quantity INTEGER;
BEGIN
    -- Check available quantity
    SELECT quantity INTO available_quantity
    FROM user_inventory
    WHERE user_id = p_user_id AND item_id = p_item_id;
    
    IF available_quantity IS NULL OR available_quantity < p_quantity THEN
        RETURN FALSE;
    END IF;
    
    -- Reduce quantity
    UPDATE user_inventory 
    SET quantity = quantity - p_quantity, updated_at = NOW()
    WHERE user_id = p_user_id AND item_id = p_item_id;
    
    -- Log the usage
    INSERT INTO item_usage_log (user_id, item_id, action, quantity)
    VALUES (p_user_id, p_item_id, 'used', p_quantity);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active effects
CREATE OR REPLACE FUNCTION get_user_active_effects(p_user_id VARCHAR(255))
RETURNS TABLE (
    effect_type VARCHAR(50),
    total_value DECIMAL(10,4),
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ae.effect_type,
        SUM(ae.effect_value) as total_value,
        MAX(ae.expires_at) as expires_at
    FROM active_effects ae
    WHERE ae.user_id = p_user_id 
    AND ae.is_active = TRUE
    AND (ae.expires_at IS NULL OR ae.expires_at > NOW())
    GROUP BY ae.effect_type, ae.expires_at
    ORDER BY ae.effect_type;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired items
CREATE OR REPLACE FUNCTION cleanup_expired_items()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Deactivate expired items
    UPDATE user_inventory 
    SET is_active = FALSE, updated_at = NOW()
    WHERE expires_at IS NOT NULL 
    AND expires_at <= NOW() 
    AND is_active = TRUE;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Log expired items
    INSERT INTO item_usage_log (user_id, item_id, action)
    SELECT user_id, item_id, 'expired'
    FROM user_inventory
    WHERE expires_at IS NOT NULL 
    AND expires_at <= NOW() 
    AND is_active = FALSE;
    
    -- Clean up expired effects
    UPDATE active_effects 
    SET is_active = FALSE
    WHERE expires_at IS NOT NULL 
    AND expires_at <= NOW() 
    AND is_active = TRUE;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get payment statistics
CREATE OR REPLACE FUNCTION get_payment_stats()
RETURNS TABLE (
    total_revenue DECIMAL(20,2),
    crypto_payments INTEGER,
    stripe_payments INTEGER,
    total_transactions INTEGER,
    average_order_value DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as total_revenue,
        COUNT(*) FILTER (WHERE payment_method = 'crypto') as crypto_payments,
        COUNT(*) FILTER (WHERE payment_method = 'stripe') as stripe_payments,
        COUNT(*) as total_transactions,
        COALESCE(AVG(CAST(amount AS NUMERIC)), 0) as average_order_value
    FROM payment_transactions
    WHERE status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics when payment is completed
CREATE OR REPLACE FUNCTION update_payment_analytics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update daily analytics
        INSERT INTO payment_analytics (date, total_revenue, crypto_payments, stripe_payments, total_transactions, average_order_value, unique_customers)
        SELECT 
            CURRENT_DATE,
            COALESCE(SUM(CAST(amount AS NUMERIC)), 0),
            COUNT(*) FILTER (WHERE payment_method = 'crypto'),
            COUNT(*) FILTER (WHERE payment_method = 'stripe'),
            COUNT(*),
            COALESCE(AVG(CAST(amount AS NUMERIC)), 0),
            COUNT(DISTINCT user_id)
        FROM payment_transactions
        WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE
        ON CONFLICT (date) DO UPDATE SET
            total_revenue = EXCLUDED.total_revenue,
            crypto_payments = EXCLUDED.crypto_payments,
            stripe_payments = EXCLUDED.stripe_payments,
            total_transactions = EXCLUDED.total_transactions,
            average_order_value = EXCLUDED.average_order_value,
            unique_customers = EXCLUDED.unique_customers;
        
        -- Update item popularity
        INSERT INTO item_popularity (item_id, date, purchases, revenue)
        SELECT 
            NEW.item_id,
            CURRENT_DATE,
            1,
            CAST(NEW.amount AS NUMERIC)
        ON CONFLICT (item_id, date) DO UPDATE SET
            purchases = item_popularity.purchases + 1,
            revenue = item_popularity.revenue + EXCLUDED.revenue;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_analytics_trigger
    AFTER UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_analytics();

-- Sample data for testing
INSERT INTO user_inventory (user_id, item_id, quantity, expires_at) VALUES
('0x1234567890123456789012345678901234567890', 'nft_yield_master', 1, NULL),
('0x1234567890123456789012345678901234567890', 'booster_apy_24h', 3, NOW() + INTERVAL '30 days'),
('0x1234567890123456789012345678901234567890', 'premium_analytics', 1, NOW() + INTERVAL '30 days'),
('user@example.com', 'nft_diamond_hands', 1, NULL),
('user@example.com', 'cosmetic_profile_frame_gold', 1, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO payment_transactions (user_id, item_id, amount, currency, payment_method, transaction_hash, status) VALUES
('0x1234567890123456789012345678901234567890', 'nft_yield_master', '1000', 'YIELD', 'crypto', '0xabc123...', 'completed'),
('0x1234567890123456789012345678901234567890', 'booster_apy_24h', '50', 'YIELD', 'crypto', '0xdef456...', 'completed'),
('user@example.com', 'nft_diamond_hands', '12.50', 'USD', 'stripe', 'pi_1234567890', 'completed')
ON CONFLICT DO NOTHING;