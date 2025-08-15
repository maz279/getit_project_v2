#!/bin/sh
# Health Check Script for GetIt Bangladesh Backend Container
# Amazon.com/Shopee.sg-Level Backend Health Monitoring

set -e

# Configuration
API_HEALTH_URL="http://localhost:3000/health"
API_READY_URL="http://localhost:3000/ready"
TIMEOUT=10
MAX_RETRIES=3
RETRY_DELAY=2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if curl is available
if ! command -v curl >/dev/null 2>&1; then
    error "curl is not available"
    exit 1
fi

# Health check function
check_endpoint() {
    local url="$1"
    local timeout="$2"
    local expected_status="${3:-200}"
    
    local response
    local status_code
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" --max-time "$timeout" --connect-timeout "$timeout" "$url" 2>/dev/null)
    status_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$status_code" = "$expected_status" ]; then
        return 0
    else
        return 1
    fi
}

# Check database connectivity
check_database() {
    info "Checking database connectivity..."
    
    # Check if we can connect to the database through the application
    if check_endpoint "http://localhost:3000/api/v1/health/database" "$TIMEOUT"; then
        success "Database connectivity check passed"
        return 0
    else
        error "Database connectivity check failed"
        return 1
    fi
}

# Check Redis connectivity
check_redis() {
    info "Checking Redis connectivity..."
    
    # Check if we can connect to Redis through the application
    if check_endpoint "http://localhost:3000/api/v1/health/redis" "$TIMEOUT"; then
        success "Redis connectivity check passed"
        return 0
    else
        warning "Redis connectivity check failed (non-critical)"
        return 0  # Redis failure is not critical for basic functionality
    fi
}

# Check application dependencies
check_dependencies() {
    info "Checking application dependencies..."
    
    local deps_status=0
    
    # Check database
    if ! check_database; then
        deps_status=1
    fi
    
    # Check Redis
    check_redis
    
    # Check external APIs (Bangladesh mobile banking)
    info "Checking external API connectivity..."
    
    # Check if external APIs are reachable (non-blocking)
    if check_endpoint "http://localhost:3000/api/v1/health/external" "$TIMEOUT"; then
        success "External APIs connectivity check passed"
    else
        warning "Some external APIs may be unreachable (non-critical)"
    fi
    
    return $deps_status
}

# Check application performance
check_performance() {
    info "Checking application performance..."
    
    local start_time=$(date +%s%N)
    
    if check_endpoint "$API_HEALTH_URL" "$TIMEOUT"; then
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
        
        if [ $response_time -gt 5000 ]; then
            warning "High response time: ${response_time}ms"
            return 1
        elif [ $response_time -gt 2000 ]; then
            warning "Elevated response time: ${response_time}ms"
        else
            success "Response time is good: ${response_time}ms"
        fi
        return 0
    else
        error "Performance check failed"
        return 1
    fi
}

# Check system resources
check_resources() {
    info "Checking system resources..."
    
    local resource_status=0
    
    # Check disk space
    if command -v df >/dev/null 2>&1; then
        DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
        if [ "$DISK_USAGE" -gt 90 ]; then
            error "Critical disk usage: ${DISK_USAGE}%"
            resource_status=1
        elif [ "$DISK_USAGE" -gt 80 ]; then
            warning "High disk usage: ${DISK_USAGE}%"
        else
            success "Disk usage is acceptable: ${DISK_USAGE}%"
        fi
    fi
    
    # Check memory usage
    if [ -f "/proc/meminfo" ]; then
        MEMORY_TOTAL=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        MEMORY_AVAILABLE=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
        MEMORY_USAGE=$(awk "BEGIN {printf \"%.0f\", (($MEMORY_TOTAL - $MEMORY_AVAILABLE) / $MEMORY_TOTAL) * 100}")
        
        if [ "$MEMORY_USAGE" -gt 90 ]; then
            error "Critical memory usage: ${MEMORY_USAGE}%"
            resource_status=1
        elif [ "$MEMORY_USAGE" -gt 80 ]; then
            warning "High memory usage: ${MEMORY_USAGE}%"
        else
            success "Memory usage is acceptable: ${MEMORY_USAGE}%"
        fi
    fi
    
    # Check if Node.js process is running
    if pgrep node >/dev/null 2>&1; then
        success "Node.js process is running"
    else
        error "Node.js process not found"
        resource_status=1
    fi
    
    return $resource_status
}

# Check application-specific health
check_application_health() {
    info "Checking application-specific health..."
    
    local app_status=0
    
    # Check critical services
    local services="user-service product-service order-service payment-service"
    
    for service in $services; do
        if check_endpoint "http://localhost:3000/api/v1/health/service/$service" "$TIMEOUT"; then
            success "$service is healthy"
        else
            warning "$service health check failed"
            app_status=1
        fi
    done
    
    # Check Bangladesh-specific services
    info "Checking Bangladesh-specific services..."
    
    if check_endpoint "http://localhost:3000/api/v1/health/bangladesh/mobile-banking" "$TIMEOUT"; then
        success "Mobile banking services are healthy"
    else
        warning "Mobile banking services health check failed"
    fi
    
    if check_endpoint "http://localhost:3000/api/v1/health/bangladesh/courier" "$TIMEOUT"; then
        success "Courier services are healthy"
    else
        warning "Courier services health check failed"
    fi
    
    return $app_status
}

# Main health check with retries
main() {
    log "Starting comprehensive health check for GetIt Bangladesh backend..."
    
    local retry_count=0
    local overall_status=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        retry_count=$((retry_count + 1))
        
        log "Health check attempt $retry_count/$MAX_RETRIES"
        
        local current_status=0
        
        # 1. Basic health endpoint check
        info "Checking basic health endpoint..."
        if check_endpoint "$API_HEALTH_URL" "$TIMEOUT"; then
            success "Basic health check passed"
        else
            error "Basic health check failed"
            current_status=1
        fi
        
        # 2. Readiness check
        info "Checking readiness endpoint..."
        if check_endpoint "$API_READY_URL" "$TIMEOUT"; then
            success "Readiness check passed"
        else
            error "Readiness check failed"
            current_status=1
        fi
        
        # If basic checks pass, perform detailed checks
        if [ $current_status -eq 0 ]; then
            # 3. Check dependencies
            if ! check_dependencies; then
                current_status=1
            fi
            
            # 4. Check performance
            if ! check_performance; then
                current_status=1
            fi
            
            # 5. Check system resources
            if ! check_resources; then
                current_status=1
            fi
            
            # 6. Check application-specific health
            if ! check_application_health; then
                # Application-specific failures are warnings, not critical
                warning "Some application services may have issues"
            fi
            
            # If all checks pass, exit successfully
            if [ $current_status -eq 0 ]; then
                overall_status=0
                break
            fi
        fi
        
        # If this wasn't the last attempt, wait before retrying
        if [ $retry_count -lt $MAX_RETRIES ]; then
            warning "Health check failed (attempt $retry_count/$MAX_RETRIES)"
            log "Retrying in ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        else
            overall_status=1
        fi
    done
    
    # Final status report
    if [ $overall_status -eq 0 ]; then
        success "GetIt Bangladesh backend is healthy and ready"
        log "All health checks passed successfully"
        exit 0
    else
        error "GetIt Bangladesh backend health check failed"
        log "Critical health checks failed after $MAX_RETRIES attempts"
        exit 1
    fi
}

# Handle signals for graceful shutdown
trap 'log "Health check interrupted"; exit 1' INT TERM

# Execute main function
main "$@"