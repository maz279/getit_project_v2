#!/bin/sh
# Health Check Script for GetIt Bangladesh Frontend Container
# Amazon.com/Shopee.sg-Level Health Monitoring

set -e

# Configuration
NGINX_STATUS_URL="http://localhost/health"
TIMEOUT=5
MAX_RETRIES=3
RETRY_DELAY=1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if curl is available
if ! command -v curl >/dev/null 2>&1; then
    error "curl is not available"
    exit 1
fi

# Health check function
check_health() {
    local url="$1"
    local timeout="$2"
    
    if curl -f -s --max-time "$timeout" --connect-timeout "$timeout" "$url" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Main health check with retries
main() {
    log "Starting health check for GetIt Bangladesh frontend..."
    
    local retry_count=0
    local health_status=1
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        retry_count=$((retry_count + 1))
        
        log "Health check attempt $retry_count/$MAX_RETRIES"
        
        # Check nginx status endpoint
        if check_health "$NGINX_STATUS_URL" "$TIMEOUT"; then
            success "Nginx health check passed"
            health_status=0
            break
        else
            warning "Nginx health check failed (attempt $retry_count/$MAX_RETRIES)"
            
            if [ $retry_count -lt $MAX_RETRIES ]; then
                log "Retrying in ${RETRY_DELAY}s..."
                sleep $RETRY_DELAY
            fi
        fi
    done
    
    # Additional checks
    if [ $health_status -eq 0 ]; then
        # Check if nginx process is running
        if pgrep nginx >/dev/null 2>&1; then
            success "Nginx process is running"
        else
            warning "Nginx process not found"
            health_status=1
        fi
        
        # Check if nginx can serve static files
        if [ -f "/usr/share/nginx/html/index.html" ]; then
            success "Static files are accessible"
        else
            warning "Static files not found"
            health_status=1
        fi
        
        # Check disk space
        DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
        if [ "$DISK_USAGE" -gt 90 ]; then
            warning "Disk usage is high: ${DISK_USAGE}%"
            health_status=1
        else
            success "Disk usage is acceptable: ${DISK_USAGE}%"
        fi
        
        # Check memory usage
        if [ -f "/proc/meminfo" ]; then
            MEMORY_TOTAL=$(grep MemTotal /proc/meminfo | awk '{print $2}')
            MEMORY_AVAILABLE=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
            MEMORY_USAGE=$(awk "BEGIN {printf \"%.0f\", (($MEMORY_TOTAL - $MEMORY_AVAILABLE) / $MEMORY_TOTAL) * 100}")
            
            if [ "$MEMORY_USAGE" -gt 90 ]; then
                warning "Memory usage is high: ${MEMORY_USAGE}%"
                health_status=1
            else
                success "Memory usage is acceptable: ${MEMORY_USAGE}%"
            fi
        fi
    fi
    
    # Final status
    if [ $health_status -eq 0 ]; then
        success "GetIt Bangladesh frontend is healthy"
        exit 0
    else
        error "GetIt Bangladesh frontend health check failed"
        exit 1
    fi
}

# Execute main function
main "$@"