#!/bin/sh
# Startup Script for GetIt Bangladesh Backend Container
# Amazon.com/Shopee.sg-Level Production Startup Process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NODE_ENV="${NODE_ENV:-production}"
PORT="${PORT:-3000}"
WORKERS="${WORKERS:-4}"
MAX_STARTUP_TIME=60
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_DELAY=5

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Error function
error() {
    echo "${RED}[ERROR]${NC} $1" >&2
}

# Success function
success() {
    echo "${GREEN}[SUCCESS]${NC} $1"
}

# Warning function
warning() {
    echo "${YELLOW}[WARNING]${NC} $1"
}

# Info function
info() {
    echo "${BLUE}[INFO]${NC} $1"
}

# Signal handlers
cleanup() {
    log "Received shutdown signal, stopping GetIt Bangladesh backend..."
    
    # Kill all child processes
    if [ ! -z "$NODE_PID" ]; then
        log "Stopping Node.js process (PID: $NODE_PID)..."
        kill -TERM "$NODE_PID" 2>/dev/null || true
        
        # Wait for graceful shutdown
        local count=0
        while [ $count -lt 10 ] && kill -0 "$NODE_PID" 2>/dev/null; do
            sleep 1
            count=$((count + 1))
        done
        
        # Force kill if still running
        if kill -0 "$NODE_PID" 2>/dev/null; then
            warning "Forcing Node.js process shutdown..."
            kill -KILL "$NODE_PID" 2>/dev/null || true
        fi
    fi
    
    success "GetIt Bangladesh backend stopped gracefully"
    exit 0
}

# Set up signal handlers
trap cleanup TERM INT

# Pre-flight checks
preflight_checks() {
    log "Starting pre-flight checks for GetIt Bangladesh backend..."
    
    # Check Node.js version
    NODE_VERSION=$(node --version)
    log "Node.js version: $NODE_VERSION"
    
    # Check if required environment variables are set
    local required_vars="DATABASE_URL"
    for var in $required_vars; do
        eval "value=\$$var"
        if [ -z "$value" ]; then
            error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Check if required files exist
    if [ ! -f "/app/dist/server.js" ]; then
        error "Application bundle not found at /app/dist/server.js"
        exit 1
    fi
    
    # Check disk space
    DISK_USAGE=$(df /app | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        error "Insufficient disk space: ${DISK_USAGE}% used"
        exit 1
    fi
    
    # Check memory
    if [ -f "/proc/meminfo" ]; then
        MEMORY_TOTAL=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        MEMORY_AVAILABLE=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
        MEMORY_USAGE=$(awk "BEGIN {printf \"%.0f\", (($MEMORY_TOTAL - $MEMORY_AVAILABLE) / $MEMORY_TOTAL) * 100}")
        
        log "Memory usage: ${MEMORY_USAGE}%"
        
        if [ "$MEMORY_USAGE" -gt 95 ]; then
            error "Insufficient memory: ${MEMORY_USAGE}% used"
            exit 1
        fi
    fi
    
    success "Pre-flight checks completed successfully"
}

# Database connectivity check
check_database() {
    log "Checking database connectivity..."
    
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        if node -e "
            const { Client } = require('pg');
            const client = new Client({ connectionString: process.env.DATABASE_URL });
            client.connect()
              .then(() => { console.log('Database connected'); client.end(); process.exit(0); })
              .catch((err) => { console.error('Database connection failed:', err.message); process.exit(1); });
        " 2>/dev/null; then
            success "Database connection established"
            return 0
        fi
        
        retries=$((retries + 1))
        warning "Database connection attempt $retries/$max_retries failed"
        
        if [ $retries -lt $max_retries ]; then
            log "Retrying database connection in 2s..."
            sleep 2
        fi
    done
    
    error "Failed to connect to database after $max_retries attempts"
    return 1
}

# Redis connectivity check (optional)
check_redis() {
    if [ ! -z "$REDIS_URL" ]; then
        log "Checking Redis connectivity..."
        
        if node -e "
            const redis = require('ioredis');
            const client = new redis(process.env.REDIS_URL);
            client.ping()
              .then(() => { console.log('Redis connected'); client.disconnect(); process.exit(0); })
              .catch((err) => { console.log('Redis connection failed (optional):', err.message); process.exit(0); });
        " 2>/dev/null; then
            success "Redis connection established"
        else
            warning "Redis connection failed (continuing without Redis)"
        fi
    else
        info "Redis URL not configured, skipping Redis check"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    if [ -f "/app/package.json" ] && grep -q "db:migrate" /app/package.json; then
        if npm run db:migrate; then
            success "Database migrations completed successfully"
        else
            error "Database migrations failed"
            return 1
        fi
    else
        info "No database migrations configured"
    fi
}

# Health check function
health_check() {
    local url="http://localhost:$PORT/health"
    
    if command -v curl >/dev/null 2>&1; then
        curl -f -s --max-time 5 "$url" >/dev/null 2>&1
    else
        # Fallback using node
        node -e "
            const http = require('http');
            const options = { hostname: 'localhost', port: $PORT, path: '/health', timeout: 5000 };
            const req = http.request(options, (res) => {
                process.exit(res.statusCode === 200 ? 0 : 1);
            });
            req.on('error', () => process.exit(1));
            req.on('timeout', () => { req.destroy(); process.exit(1); });
            req.end();
        " 2>/dev/null
    fi
}

# Wait for application to be ready
wait_for_ready() {
    log "Waiting for application to be ready..."
    
    local retries=0
    
    while [ $retries -lt $HEALTH_CHECK_RETRIES ]; do
        if health_check; then
            success "Application is ready and responding to health checks"
            return 0
        fi
        
        retries=$((retries + 1))
        log "Health check attempt $retries/$HEALTH_CHECK_RETRIES..."
        sleep $HEALTH_CHECK_DELAY
    done
    
    error "Application failed to become ready after $((HEALTH_CHECK_RETRIES * HEALTH_CHECK_DELAY)) seconds"
    return 1
}

# Start the application
start_application() {
    log "Starting GetIt Bangladesh backend application..."
    
    # Set NODE_OPTIONS for production optimization
    export NODE_OPTIONS="--max-old-space-size=1024 --optimize-for-size"
    
    # Bangladesh-specific configuration
    export TZ="Asia/Dhaka"
    export LANG="en_US.UTF-8"
    
    info "Environment: $NODE_ENV"
    info "Port: $PORT"
    info "Workers: $WORKERS"
    info "Timezone: Asia/Dhaka"
    
    # Start the Node.js application
    cd /app
    
    if [ "$NODE_ENV" = "production" ]; then
        # Production mode with cluster support
        log "Starting in production mode with $WORKERS workers..."
        node dist/server.js &
        NODE_PID=$!
    else
        # Development mode
        log "Starting in development mode..."
        npm run dev &
        NODE_PID=$!
    fi
    
    log "Application started with PID: $NODE_PID"
    
    # Wait for the application to be ready
    if wait_for_ready; then
        success "GetIt Bangladesh backend is running and healthy"
        
        # Log startup metrics
        log "Startup completed in $(date '+%Y-%m-%d %H:%M:%S')"
        log "Memory usage: $(cat /proc/meminfo | grep MemAvailable | awk '{printf "%.1f MB", ($2/1024)}')"
        log "Application URL: http://localhost:$PORT"
        log "Health check URL: http://localhost:$PORT/health"
        
        # Keep the script running and monitor the process
        while kill -0 "$NODE_PID" 2>/dev/null; do
            sleep 10
            
            # Optional: Periodic health monitoring
            if ! health_check; then
                warning "Health check failed during runtime"
            fi
        done
        
        error "Node.js process exited unexpectedly"
        exit 1
    else
        error "Application startup failed"
        
        # Cleanup on failure
        if [ ! -z "$NODE_PID" ]; then
            kill -TERM "$NODE_PID" 2>/dev/null || true
        fi
        
        exit 1
    fi
}

# Main startup function
main() {
    log "================================================================"
    log "Starting GetIt Bangladesh Backend Container"
    log "Version: 1.0.0"
    log "Environment: $NODE_ENV"
    log "================================================================"
    
    # Run pre-flight checks
    preflight_checks
    
    # Check database connectivity
    if ! check_database; then
        exit 1
    fi
    
    # Check Redis connectivity (optional)
    check_redis
    
    # Run database migrations
    if ! run_migrations; then
        exit 1
    fi
    
    # Start the application
    start_application
}

# Execute main function
main "$@"