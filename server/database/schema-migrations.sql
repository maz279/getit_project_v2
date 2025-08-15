-- Enterprise Database Schema Migrations for Phase 1
-- Amazon.com/Shopee.sg-Level Database Schema Enhancements

-- ====================================================================
-- API GATEWAY ENTERPRISE TABLES
-- ====================================================================

-- GraphQL Schemas Management
CREATE TABLE IF NOT EXISTS api_gateway_graphql_schemas (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) NOT NULL,
    schema_definition TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_name, schema_version)
);

-- Developer Portal Accounts
CREATE TABLE IF NOT EXISTS api_gateway_developer_accounts (
    id SERIAL PRIMARY KEY,
    developer_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    organization VARCHAR(200),
    api_key VARCHAR(100) UNIQUE NOT NULL,
    rate_limit_tier VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- WebSocket Channels Management
CREATE TABLE IF NOT EXISTS api_gateway_websocket_channels (
    id SERIAL PRIMARY KEY,
    channel_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    max_connections INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- A/B Testing Framework
CREATE TABLE IF NOT EXISTS api_gateway_ab_tests (
    id SERIAL PRIMARY KEY,
    test_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    traffic_split JSONB NOT NULL, -- {"control": 50, "variant_a": 30, "variant_b": 20}
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Service Registry with Enhanced Metadata
CREATE TABLE IF NOT EXISTS api_gateway_service_registry (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    version VARCHAR(20) NOT NULL,
    endpoint_url VARCHAR(500) NOT NULL,
    health_check_url VARCHAR(500),
    load_balancer_config JSONB,
    rate_limit_config JSONB,
    circuit_breaker_config JSONB,
    is_active BOOLEAN DEFAULT true,
    last_health_check TIMESTAMP,
    health_status VARCHAR(20) DEFAULT 'unknown',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Metrics with Route Path
CREATE TABLE IF NOT EXISTS api_gateway_metrics (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    route_path VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    request_size INTEGER DEFAULT 0,
    response_size INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_api_gateway_metrics_service_timestamp (service_name, timestamp),
    INDEX idx_api_gateway_metrics_route_timestamp (route_path, timestamp),
    INDEX idx_api_gateway_metrics_status_timestamp (status_code, timestamp)
);

-- Version Management
CREATE TABLE IF NOT EXISTS api_gateway_versions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    description TEXT,
    deployment_config JSONB,
    rollback_config JSONB,
    is_current BOOLEAN DEFAULT false,
    deployed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, version)
);

-- ====================================================================
-- ENTERPRISE CACHING TABLES
-- ====================================================================

-- Cache Statistics
CREATE TABLE IF NOT EXISTS cache_statistics (
    id SERIAL PRIMARY KEY,
    cache_type VARCHAR(50) NOT NULL, -- 'redis', 'memory', 'cdn'
    cache_key VARCHAR(500) NOT NULL,
    hit_count INTEGER DEFAULT 0,
    miss_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_cache_stats_type_key (cache_type, cache_key),
    INDEX idx_cache_stats_accessed (last_accessed)
);

-- Cache Invalidation Log
CREATE TABLE IF NOT EXISTS cache_invalidation_log (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(500) NOT NULL,
    invalidation_reason VARCHAR(200),
    invalidated_by VARCHAR(100),
    invalidated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_cache_invalidation_key (cache_key),
    INDEX idx_cache_invalidation_date (invalidated_at)
);

-- ====================================================================
-- DATABASE SHARDING METADATA
-- ====================================================================

-- Shard Configuration
CREATE TABLE IF NOT EXISTS shard_configuration (
    id SERIAL PRIMARY KEY,
    shard_name VARCHAR(100) UNIQUE NOT NULL,
    shard_index INTEGER UNIQUE NOT NULL,
    connection_string TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_connections INTEGER DEFAULT 20,
    current_connections INTEGER DEFAULT 0,
    health_status VARCHAR(20) DEFAULT 'unknown',
    last_health_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Shard Mapping Rules
CREATE TABLE IF NOT EXISTS shard_mapping_rules (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    sharding_strategy VARCHAR(50) NOT NULL, -- 'user_based', 'product_based', 'geographic'
    shard_key_column VARCHAR(100) NOT NULL,
    shard_count INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(table_name, sharding_strategy)
);

-- User to Shard Mapping
CREATE TABLE IF NOT EXISTS user_shard_mapping (
    user_id INTEGER PRIMARY KEY,
    shard_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (shard_name) REFERENCES shard_configuration(shard_name)
);

-- Product to Shard Mapping
CREATE TABLE IF NOT EXISTS product_shard_mapping (
    product_id INTEGER PRIMARY KEY,
    shard_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (shard_name) REFERENCES shard_configuration(shard_name)
);

-- ====================================================================
-- PERFORMANCE MONITORING TABLES
-- ====================================================================

-- Database Performance Metrics
CREATE TABLE IF NOT EXISTS database_performance_metrics (
    id SERIAL PRIMARY KEY,
    database_name VARCHAR(100) NOT NULL,
    query_type VARCHAR(50) NOT NULL, -- 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
    execution_time_ms DECIMAL(10,3) NOT NULL,
    affected_rows INTEGER DEFAULT 0,
    query_hash VARCHAR(64), -- Hash of the query for grouping
    timestamp TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_db_performance_database_time (database_name, timestamp),
    INDEX idx_db_performance_query_type (query_type, timestamp),
    INDEX idx_db_performance_hash_time (query_hash, timestamp)
);

-- Service Health Checks
CREATE TABLE IF NOT EXISTS service_health_checks (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    health_status VARCHAR(20) NOT NULL, -- 'healthy', 'degraded', 'unhealthy'
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_service_health_name_time (service_name, checked_at),
    INDEX idx_service_health_status (health_status, checked_at)
);

-- ====================================================================
-- LOAD BALANCING & CIRCUIT BREAKER TABLES
-- ====================================================================

-- Load Balancer Configuration
CREATE TABLE IF NOT EXISTS load_balancer_config (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) UNIQUE NOT NULL,
    algorithm VARCHAR(50) NOT NULL, -- 'round_robin', 'least_connections', 'weighted'
    health_check_interval INTEGER DEFAULT 30, -- seconds
    health_check_timeout INTEGER DEFAULT 5, -- seconds
    max_retries INTEGER DEFAULT 3,
    retry_delay_ms INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Circuit Breaker State
CREATE TABLE IF NOT EXISTS circuit_breaker_state (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(20) NOT NULL, -- 'closed', 'open', 'half_open'
    failure_count INTEGER DEFAULT 0,
    last_failure_time TIMESTAMP,
    next_attempt_time TIMESTAMP,
    failure_threshold INTEGER DEFAULT 5,
    recovery_timeout INTEGER DEFAULT 60, -- seconds
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================================================
-- SECURITY & AUDIT TABLES
-- ====================================================================

-- API Security Events
CREATE TABLE IF NOT EXISTS api_security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'rate_limit_exceeded', 'suspicious_request', 'auth_failure'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    source_ip INET NOT NULL,
    user_agent TEXT,
    request_path VARCHAR(500),
    request_method VARCHAR(10),
    user_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_security_events_type_time (event_type, created_at),
    INDEX idx_security_events_severity_time (severity, created_at),
    INDEX idx_security_events_ip (source_ip, created_at)
);

-- Rate Limiting Buckets
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(200) NOT NULL, -- IP, user_id, or API key
    bucket_type VARCHAR(50) NOT NULL, -- 'ip', 'user', 'api_key'
    current_count INTEGER DEFAULT 0,
    max_count INTEGER NOT NULL,
    window_start TIMESTAMP NOT NULL,
    window_duration INTEGER NOT NULL, -- seconds
    last_request TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(identifier, bucket_type),
    INDEX idx_rate_limit_identifier (identifier, bucket_type),
    INDEX idx_rate_limit_window (window_start)
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================

-- Create additional indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON cart_items(user_id, product_id);

-- ====================================================================
-- INITIAL DATA SEEDING
-- ====================================================================

-- Insert default shard configuration
INSERT INTO shard_configuration (shard_name, shard_index, connection_string, max_connections) 
VALUES 
    ('shard_0', 0, 'postgresql://postgres:postgres@localhost:5432/getit_shard_0', 20),
    ('shard_1', 1, 'postgresql://postgres:postgres@localhost:5432/getit_shard_1', 20),
    ('shard_2', 2, 'postgresql://postgres:postgres@localhost:5432/getit_shard_2', 20),
    ('shard_3', 3, 'postgresql://postgres:postgres@localhost:5432/getit_shard_3', 20)
ON CONFLICT (shard_name) DO NOTHING;

-- Insert default sharding rules
INSERT INTO shard_mapping_rules (table_name, sharding_strategy, shard_key_column, shard_count) 
VALUES 
    ('users', 'user_based', 'id', 4),
    ('products', 'product_based', 'id', 4),
    ('orders', 'user_based', 'user_id', 4),
    ('cart_items', 'user_based', 'user_id', 4)
ON CONFLICT (table_name, sharding_strategy) DO NOTHING;

-- Insert default load balancer configuration
INSERT INTO load_balancer_config (service_name, algorithm, health_check_interval, max_retries) 
VALUES 
    ('user-service', 'round_robin', 30, 3),
    ('product-service', 'least_connections', 30, 3),
    ('order-service', 'weighted', 30, 5),
    ('payment-service', 'round_robin', 15, 5)
ON CONFLICT (service_name) DO NOTHING;

-- Insert default circuit breaker state
INSERT INTO circuit_breaker_state (service_name, state, failure_threshold, recovery_timeout) 
VALUES 
    ('user-service', 'closed', 5, 60),
    ('product-service', 'closed', 5, 60),
    ('order-service', 'closed', 3, 30),
    ('payment-service', 'closed', 3, 30)
ON CONFLICT (service_name) DO NOTHING;

-- Insert default GraphQL schemas
INSERT INTO api_gateway_graphql_schemas (service_name, schema_version, schema_definition) 
VALUES 
    ('user-service', '1.0.0', 'type User { id: ID! email: String! name: String! }'),
    ('product-service', '1.0.0', 'type Product { id: ID! name: String! price: Float! }'),
    ('order-service', '1.0.0', 'type Order { id: ID! userId: ID! status: String! }')
ON CONFLICT (service_name, schema_version) DO NOTHING;

-- Insert default WebSocket channels
INSERT INTO api_gateway_websocket_channels (channel_name, description, max_connections) 
VALUES 
    ('notifications', 'Real-time user notifications', 10000),
    ('live-chat', 'Customer support live chat', 5000),
    ('order-updates', 'Real-time order status updates', 15000),
    ('product-updates', 'Live product availability updates', 20000)
ON CONFLICT (channel_name) DO NOTHING;

-- ====================================================================
-- FUNCTIONS AND TRIGGERS
-- ====================================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_api_gateway_service_registry_updated_at 
    BEFORE UPDATE ON api_gateway_service_registry 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_api_gateway_versions_updated_at 
    BEFORE UPDATE ON api_gateway_versions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_shard_configuration_updated_at 
    BEFORE UPDATE ON shard_configuration 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to calculate shard for user
CREATE OR REPLACE FUNCTION get_user_shard(user_id INTEGER)
RETURNS VARCHAR(100) AS $$
DECLARE
    shard_count INTEGER;
    shard_index INTEGER;
BEGIN
    SELECT sc.shard_count INTO shard_count 
    FROM shard_mapping_rules sc 
    WHERE sc.table_name = 'users' AND sc.is_active = true 
    LIMIT 1;
    
    IF shard_count IS NULL THEN
        RETURN 'shard_0'; -- Default shard
    END IF;
    
    shard_index := user_id % shard_count;
    RETURN 'shard_' || shard_index::text;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate shard for product
CREATE OR REPLACE FUNCTION get_product_shard(product_id INTEGER)
RETURNS VARCHAR(100) AS $$
DECLARE
    shard_count INTEGER;
    shard_index INTEGER;
BEGIN
    SELECT sc.shard_count INTO shard_count 
    FROM shard_mapping_rules sc 
    WHERE sc.table_name = 'products' AND sc.is_active = true 
    LIMIT 1;
    
    IF shard_count IS NULL THEN
        RETURN 'shard_0'; -- Default shard
    END IF;
    
    shard_index := product_id % shard_count;
    RETURN 'shard_' || shard_index::text;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- VIEWS FOR MONITORING AND ANALYTICS
-- ====================================================================

-- API Gateway Performance View
CREATE OR REPLACE VIEW api_performance_summary AS
SELECT 
    service_name,
    route_path,
    method,
    COUNT(*) as request_count,
    AVG(response_time_ms) as avg_response_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
    DATE_TRUNC('hour', timestamp) as hour
FROM api_gateway_metrics 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY service_name, route_path, method, DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

-- Cache Performance View
CREATE OR REPLACE VIEW cache_performance_summary AS
SELECT 
    cache_type,
    COUNT(*) as total_operations,
    SUM(hit_count) as total_hits,
    SUM(miss_count) as total_misses,
    CASE 
        WHEN SUM(hit_count + miss_count) > 0 
        THEN ROUND((SUM(hit_count)::DECIMAL / SUM(hit_count + miss_count)) * 100, 2)
        ELSE 0 
    END as hit_rate_percentage
FROM cache_statistics 
WHERE last_accessed >= NOW() - INTERVAL '24 hours'
GROUP BY cache_type;

-- Service Health Summary View
CREATE OR REPLACE VIEW service_health_summary AS
SELECT 
    service_name,
    health_status,
    COUNT(*) as check_count,
    AVG(response_time_ms) as avg_response_time,
    MAX(checked_at) as last_check
FROM service_health_checks 
WHERE checked_at >= NOW() - INTERVAL '1 hour'
GROUP BY service_name, health_status
ORDER BY service_name, health_status;

COMMIT;