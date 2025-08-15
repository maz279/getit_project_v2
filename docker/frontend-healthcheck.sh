#!/bin/sh
# Health check script for GetIt Bangladesh Frontend
# Validates nginx and frontend application availability

set -e

# Configuration
HEALTH_URL="${HEALTH_URL:-http://localhost:80}"
TIMEOUT="${TIMEOUT:-5}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Check nginx status
check_nginx() {
    if ! pgrep nginx > /dev/null; then
        log "${RED}❌ Nginx is not running${NC}"
        return 1
    fi
    
    log "${GREEN}✅ Nginx is running${NC}"
    return 0
}

# Check frontend availability
check_frontend() {
    if ! curl -f -s --max-time $TIMEOUT "$HEALTH_URL" > /dev/null 2>&1; then
        log "${RED}❌ Frontend not responding${NC}"
        return 1
    fi
    
    # Check if the response contains HTML
    RESPONSE=$(curl -s --max-time $TIMEOUT "$HEALTH_URL" 2>/dev/null)
    
    if echo "$RESPONSE" | grep -q "<html"; then
        log "${GREEN}✅ Frontend is serving content${NC}"
        return 0
    else
        log "${YELLOW}⚠️ Frontend response format unexpected${NC}"
        return 1
    fi
}

# Check static assets
check_static_assets() {
    # Try to access a common static asset
    STATIC_URL="${HEALTH_URL}/assets"
    
    if curl -f -s --max-time $TIMEOUT "$STATIC_URL" > /dev/null 2>&1; then
        log "${GREEN}✅ Static assets are accessible${NC}"
        return 0
    else
        log "${YELLOW}⚠️ Static assets check failed (may be normal)${NC}"
        return 0  # Don't fail health check for this
    fi
}

# Main execution
main() {
    log "Starting frontend health check..."
    
    # Check nginx
    if ! check_nginx; then
        exit 1
    fi
    
    # Check frontend availability
    if ! check_frontend; then
        exit 1
    fi
    
    # Check static assets (optional)
    check_static_assets
    
    log "${GREEN}🎉 Frontend health check completed successfully${NC}"
    exit 0
}

# Execute main function
main "$@"