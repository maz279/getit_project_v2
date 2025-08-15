#!/bin/sh
# Health check script for GetIt Bangladesh Backend
# Performs comprehensive health validation

set -e

# Configuration
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-http://localhost:5000/api/v1/health}"
TIMEOUT="${TIMEOUT:-10}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Perform health check
perform_health_check() {
    log "Starting health check..."
    
    # Basic connectivity check
    if ! curl -f -s --max-time $TIMEOUT "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
        log "${RED}❌ Health endpoint not responding${NC}"
        return 1
    fi
    
    # Get health response
    RESPONSE=$(curl -s --max-time $TIMEOUT "$HEALTH_ENDPOINT" 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        log "${RED}❌ Failed to get health response${NC}"
        return 1
    fi
    
    # Check if response contains expected data
    if echo "$RESPONSE" | grep -q '"status"'; then
        log "${GREEN}✅ Health check passed${NC}"
        return 0
    else
        log "${YELLOW}⚠️ Unexpected health response format${NC}"
        return 1
    fi
}

# Enterprise health check (if available)
perform_enterprise_health_check() {
    ENTERPRISE_ENDPOINT="${HEALTH_ENDPOINT}/enterprise"
    
    if curl -f -s --max-time $TIMEOUT "$ENTERPRISE_ENDPOINT" > /dev/null 2>&1; then
        ENTERPRISE_RESPONSE=$(curl -s --max-time $TIMEOUT "$ENTERPRISE_ENDPOINT" 2>/dev/null)
        
        if echo "$ENTERPRISE_RESPONSE" | grep -q '"enterpriseMode"'; then
            log "${GREEN}✅ Enterprise health check passed${NC}"
            return 0
        fi
    fi
    
    log "${YELLOW}⚠️ Enterprise health check not available${NC}"
    return 0  # Don't fail if enterprise endpoint is not available
}

# Main execution
main() {
    # Perform basic health check
    if ! perform_health_check; then
        exit 1
    fi
    
    # Perform enterprise health check (optional)
    perform_enterprise_health_check
    
    log "${GREEN}🎉 All health checks completed successfully${NC}"
    exit 0
}

# Execute main function
main "$@"