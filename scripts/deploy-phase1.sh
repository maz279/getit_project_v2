#!/bin/bash

# Phase 1 Enterprise Infrastructure Deployment Script
# Amazon.com/Shopee.sg-Level Infrastructure Implementation

set -e

echo "🚀 Starting Phase 1 Enterprise Infrastructure Deployment"
echo "============================================================"

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENTERPRISE_MODE=${ENTERPRISE_MODE:-true}
ENVIRONMENT=${ENVIRONMENT:-development}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check kubectl (optional for Kubernetes deployment)
    if command -v kubectl &> /dev/null; then
        log "kubectl found - Kubernetes deployment available"
    else
        warn "kubectl not found - Kubernetes deployment will be skipped"
    fi
    
    # Check available ports
    log "Checking port availability..."
    for port in 5432 6379 9200 9090 3000 5000 80; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            warn "Port $port is already in use"
        fi
    done
    
    log "Prerequisites check completed"
}

# Environment setup
setup_environment() {
    log "Setting up environment variables..."
    
    # Create .env file if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/.env.enterprise" ]; then
        cat > "$PROJECT_ROOT/.env.enterprise" << EOF
# Enterprise Configuration
ENTERPRISE_MODE=true
NODE_ENV=${ENVIRONMENT}

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/getit_enterprise
POSTGRES_PASSWORD=postgres
POSTGRES_REPLICATION_PASSWORD=replicator

# Redis Configuration
REDIS_CLUSTER=true
REDIS_CLUSTER_NODES=localhost:6379,localhost:6380,localhost:6381
REDIS_HOST=localhost
REDIS_PORT=6379

# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200

# Monitoring Configuration
GRAFANA_PASSWORD=admin

# Security Configuration
SESSION_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Application Configuration
PORT=5000
EOF
        log "Created .env.enterprise file"
    fi
    
    # Source environment variables
    source "$PROJECT_ROOT/.env.enterprise"
    export $(cat "$PROJECT_ROOT/.env.enterprise" | grep -v '^#' | xargs)
    
    log "Environment setup completed"
}

# Database migration
run_database_migration() {
    log "Running database migrations..."
    
    # Wait for PostgreSQL to be ready
    log "Waiting for PostgreSQL to be ready..."
    until docker exec getit-postgres-primary pg_isready -U postgres -d getit_enterprise; do
        sleep 2
    done
    
    # Run schema migration
    docker exec -i getit-postgres-primary psql -U postgres -d getit_enterprise < "$PROJECT_ROOT/server/database/schema-migrations.sql"
    
    log "Database migrations completed"
}

# Deploy with Docker Compose
deploy_docker_compose() {
    log "Deploying enterprise infrastructure with Docker Compose..."
    
    cd "$PROJECT_ROOT"
    
    # Create necessary directories
    mkdir -p infrastructure/docker/config/{postgres,redis,nginx,grafana,prometheus,istio}
    
    # Copy configuration files
    log "Setting up configuration files..."
    
    # PostgreSQL configuration
    cat > infrastructure/docker/config/postgres/postgresql-primary.conf << 'EOF'
# PostgreSQL Primary Configuration
listen_addresses = '*'
port = 5432
max_connections = 200
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 16MB
maintenance_work_mem = 256MB
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
wal_keep_size = 1GB
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f'
EOF

    cat > infrastructure/docker/config/postgres/postgresql-replica.conf << 'EOF'
# PostgreSQL Replica Configuration
include '/etc/postgresql/postgresql-primary.conf'
hot_standby = on
max_standby_archive_delay = 30s
max_standby_streaming_delay = 30s
wal_receiver_status_interval = 10s
hot_standby_feedback = on
wal_receiver_timeout = 60s
EOF

    cat > infrastructure/docker/config/postgres/pg_hba.conf << 'EOF'
# PostgreSQL Client Authentication Configuration
local   all             postgres                                trust
local   all             all                                     md5
host    all             postgres        127.0.0.1/32           trust
host    all             all             127.0.0.1/32           md5
host    all             postgres        ::1/128                trust
host    all             all             ::1/128                md5
host    all             all             172.20.0.0/16          md5
host    replication     replicator      172.20.0.0/16          md5
EOF

    # Prometheus configuration
    cat > infrastructure/docker/config/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'getit-backend'
    static_configs:
      - targets: ['172.20.5.10:5000']
    metrics_path: '/api/v1/metrics'

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['172.20.1.10:5432']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['172.20.2.10:6379']
EOF

    # Nginx configuration
    cat > infrastructure/docker/config/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server 172.20.5.10:5000;
    }
    
    upstream frontend {
        server 172.20.5.11:80;
    }
    
    server {
        listen 80;
        
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
EOF
    
    # Deploy the stack
    log "Starting enterprise infrastructure stack..."
    docker-compose -f infrastructure/docker/docker-compose.enterprise.yml up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 60
    
    # Run database migration
    run_database_migration
    
    log "Docker Compose deployment completed"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    if ! command -v kubectl &> /dev/null; then
        warn "kubectl not found, skipping Kubernetes deployment"
        return
    fi
    
    log "Deploying to Kubernetes..."
    
    # Create namespaces
    kubectl create namespace getit-production --dry-run=client -o yaml | kubectl apply -f -
    kubectl create namespace getit-database --dry-run=client -o yaml | kubectl apply -f -
    kubectl create namespace getit-cache --dry-run=client -o yaml | kubectl apply -f -
    kubectl create namespace istio-system --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy PostgreSQL cluster
    kubectl apply -f "$PROJECT_ROOT/infrastructure/kubernetes/databases/postgres-aurora-cluster.yaml"
    
    # Deploy Redis cluster
    kubectl apply -f "$PROJECT_ROOT/infrastructure/kubernetes/databases/redis-cluster.yaml"
    
    # Deploy Istio service mesh
    kubectl apply -f "$PROJECT_ROOT/infrastructure/kubernetes/service-mesh/istio-setup.yaml"
    kubectl apply -f "$PROJECT_ROOT/infrastructure/kubernetes/service-mesh/security-policies.yaml"
    
    log "Kubernetes deployment completed"
}

# Health checks
run_health_checks() {
    log "Running health checks..."
    
    # Check PostgreSQL
    if docker exec getit-postgres-primary pg_isready -U postgres -d getit_enterprise; then
        log "✅ PostgreSQL is healthy"
    else
        error "❌ PostgreSQL is not healthy"
    fi
    
    # Check Redis
    if docker exec getit-redis-node-1 redis-cli ping | grep -q PONG; then
        log "✅ Redis is healthy"
    else
        error "❌ Redis is not healthy"
    fi
    
    # Check Elasticsearch
    if curl -f http://localhost:9200/_cluster/health >/dev/null 2>&1; then
        log "✅ Elasticsearch is healthy"
    else
        error "❌ Elasticsearch is not healthy"
    fi
    
    # Check backend application
    if curl -f http://localhost:5000/api/v1/health >/dev/null 2>&1; then
        log "✅ Backend application is healthy"
    else
        error "❌ Backend application is not healthy"
    fi
    
    log "Health checks completed"
}

# Display deployment summary
show_deployment_summary() {
    log "Phase 1 Enterprise Infrastructure Deployment Summary"
    echo "============================================================"
    echo ""
    echo "🗄️  Database Services:"
    echo "   PostgreSQL Primary: http://localhost:5432"
    echo "   PostgreSQL Replica: http://localhost:5433"
    echo ""
    echo "🔄 Caching Services:"
    echo "   Redis Node 1: http://localhost:6379"
    echo "   Redis Node 2: http://localhost:6380"
    echo "   Redis Node 3: http://localhost:6381"
    echo ""
    echo "🔍 Search Services:"
    echo "   Elasticsearch: http://localhost:9200"
    echo ""
    echo "📊 Monitoring Services:"
    echo "   Prometheus: http://localhost:9090"
    echo "   Grafana: http://localhost:3000 (admin/admin)"
    echo ""
    echo "🚀 Application Services:"
    echo "   Backend API: http://localhost:5000"
    echo "   Frontend: http://localhost:3001"
    echo "   Load Balancer: http://localhost:80"
    echo ""
    echo "📚 API Documentation:"
    echo "   Health Check: http://localhost:5000/api/v1/health"
    echo "   Metrics: http://localhost:5000/api/v1/metrics"
    echo "   API Gateway: http://localhost:5000/api/v1/gateway"
    echo ""
    echo "🔧 Management Commands:"
    echo "   View logs: docker-compose -f infrastructure/docker/docker-compose.enterprise.yml logs -f"
    echo "   Stop services: docker-compose -f infrastructure/docker/docker-compose.enterprise.yml down"
    echo "   Restart services: docker-compose -f infrastructure/docker/docker-compose.enterprise.yml restart"
    echo ""
    log "Enterprise infrastructure is now running!"
}

# Cleanup function
cleanup() {
    log "Cleaning up deployment artifacts..."
    docker-compose -f infrastructure/docker/docker-compose.enterprise.yml down -v
    log "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting Phase 1 Enterprise Infrastructure Deployment"
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            setup_environment
            deploy_docker_compose
            if [ "$2" == "--kubernetes" ]; then
                deploy_kubernetes
            fi
            run_health_checks
            show_deployment_summary
            ;;
        "cleanup")
            cleanup
            ;;
        "health")
            run_health_checks
            ;;
        "logs")
            docker-compose -f infrastructure/docker/docker-compose.enterprise.yml logs -f
            ;;
        *)
            echo "Usage: $0 {deploy|cleanup|health|logs} [--kubernetes]"
            echo ""
            echo "Commands:"
            echo "  deploy      Deploy the enterprise infrastructure"
            echo "  cleanup     Clean up the deployment"
            echo "  health      Run health checks"
            echo "  logs        View service logs"
            echo ""
            echo "Options:"
            echo "  --kubernetes    Also deploy to Kubernetes"
            exit 1
            ;;
    esac
}

# Handle script interruption
trap cleanup INT TERM

# Run main function
main "$@"