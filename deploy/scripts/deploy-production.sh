#!/bin/bash

# GetIt Bangladesh Production Deployment Script
# Complete infrastructure deployment with Bangladesh optimizations

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${ENVIRONMENT:-production}
NAMESPACE=${NAMESPACE:-getit-production}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-registry.getit.com.bd}
DOMAIN=${DOMAIN:-getit.com.bd}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking deployment prerequisites..."
    
    # Check if required commands exist
    for cmd in docker docker-compose kubectl helm; do
        if ! command -v $cmd &> /dev/null; then
            print_error "$cmd is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check if .env file exists
    if [[ ! -f ".env.production" ]]; then
        print_error ".env.production file not found"
        print_status "Creating template .env.production file..."
        create_env_template
        print_warning "Please configure .env.production before proceeding"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to create environment template
create_env_template() {
    cat > .env.production << EOF
# GetIt Bangladesh Production Environment Configuration

# Database Configuration
DATABASE_URL=postgresql://getit_admin:your_password@postgres-master:5432/getit_production
POSTGRES_DB=getit_production
POSTGRES_USER=getit_admin
POSTGRES_PASSWORD=your_secure_password

# Redis Configuration
REDIS_PASSWORD=your_redis_password

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_mongo_password
MONGO_DATABASE=getit_analytics

# JWT Configuration
JWT_SECRET=your_jwt_secret_256_bit_key

# Bangladesh Payment Gateways
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret

NAGAD_MERCHANT_ID=your_nagad_merchant_id
NAGAD_MERCHANT_PRIVATE_KEY=your_nagad_private_key

ROCKET_MERCHANT_ID=your_rocket_merchant_id
ROCKET_MERCHANT_SECRET=your_rocket_secret

SSLCOMMERZ_STORE_ID=your_sslcommerz_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sslcommerz_password

# Bangladesh Shipping Partners
PATHAO_CLIENT_ID=your_pathao_client_id
PATHAO_CLIENT_SECRET=your_pathao_client_secret

PAPERFLY_USERNAME=your_paperfly_username
PAPERFLY_PASSWORD=your_paperfly_password

REDX_CLIENT_ID=your_redx_client_id
REDX_CLIENT_SECRET=your_redx_client_secret

ECOURIER_API_KEY=your_ecourier_api_key
ECOURIER_USER_ID=your_ecourier_user_id

SUNDARBAN_API_KEY=your_sundarban_api_key

# Communication Services
SENDGRID_API_KEY=your_sendgrid_api_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

SSL_WIRELESS_USERNAME=your_ssl_wireless_username
SSL_WIRELESS_PASSWORD=your_ssl_wireless_password

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_key

# Monitoring
GRAFANA_ADMIN_PASSWORD=your_grafana_password

# Domain Configuration
DOMAIN=getit.com.bd
API_DOMAIN=api.getit.com.bd
ADMIN_DOMAIN=admin.getit.com.bd
EOF
}

# Function to build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    # Source environment variables
    source .env.production
    
    # Build API Gateway
    print_status "Building API Gateway image..."
    docker build -f deploy/docker/Dockerfile.api-gateway -t $DOCKER_REGISTRY/getit-api-gateway:latest .
    docker push $DOCKER_REGISTRY/getit-api-gateway:latest
    
    # Build Microservices
    print_status "Building Microservices image..."
    docker build -f deploy/docker/Dockerfile.microservice -t $DOCKER_REGISTRY/getit-microservice:latest .
    docker push $DOCKER_REGISTRY/getit-microservice:latest
    
    # Build Frontend
    print_status "Building Frontend image..."
    docker build -f deploy/docker/Dockerfile.frontend -t $DOCKER_REGISTRY/getit-frontend:latest .
    docker push $DOCKER_REGISTRY/getit-frontend:latest
    
    print_success "Docker images built and pushed"
}

# Function to deploy with Docker Compose
deploy_docker_compose() {
    print_status "Deploying with Docker Compose..."
    
    # Copy environment file
    cp .env.production .env
    
    # Deploy services
    docker-compose -f deploy/docker/docker-compose.production.yml up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to become healthy..."
    sleep 60
    
    # Check service health
    check_service_health
    
    print_success "Docker Compose deployment completed"
}

# Function to deploy with Kubernetes
deploy_kubernetes() {
    print_status "Deploying with Kubernetes..."
    
    # Create namespace
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Create secrets
    create_kubernetes_secrets
    
    # Apply Kubernetes manifests
    kubectl apply -f deploy/kubernetes/ -n $NAMESPACE
    
    # Wait for deployments
    print_status "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=600s deployment --all -n $NAMESPACE
    
    print_success "Kubernetes deployment completed"
}

# Function to create Kubernetes secrets
create_kubernetes_secrets() {
    print_status "Creating Kubernetes secrets..."
    
    # Database secrets
    kubectl create secret generic database-secrets \
        --from-env-file=.env.production \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Payment gateway secrets
    kubectl create secret generic payment-secrets \
        --from-env-file=.env.production \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Shipping partner secrets
    kubectl create secret generic shipping-secrets \
        --from-env-file=.env.production \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Kubernetes secrets created"
}

# Function to check service health
check_service_health() {
    print_status "Checking service health..."
    
    # Check API Gateway
    if curl -f http://localhost:8080/health &> /dev/null; then
        print_success "API Gateway is healthy"
    else
        print_warning "API Gateway health check failed"
    fi
    
    # Check databases
    if docker-compose -f deploy/docker/docker-compose.production.yml exec -T postgres-master pg_isready &> /dev/null; then
        print_success "PostgreSQL is healthy"
    else
        print_warning "PostgreSQL health check failed"
    fi
    
    if docker-compose -f deploy/docker/docker-compose.production.yml exec -T redis-master redis-cli ping &> /dev/null; then
        print_success "Redis is healthy"
    else
        print_warning "Redis health check failed"
    fi
    
    print_success "Health checks completed"
}

# Function to setup SSL certificates
setup_ssl_certificates() {
    print_status "Setting up SSL certificates..."
    
    # Create SSL directory
    mkdir -p config/nginx/ssl
    
    # Check if certificates exist
    if [[ ! -f "config/nginx/ssl/getit.com.bd.crt" ]]; then
        print_warning "SSL certificates not found"
        print_status "Generating self-signed certificates for development..."
        
        # Generate self-signed certificates
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout config/nginx/ssl/getit.com.bd.key \
            -out config/nginx/ssl/getit.com.bd.crt \
            -subj "/C=BD/ST=Dhaka/L=Dhaka/O=GetIt/OU=IT/CN=getit.com.bd"
        
        # Copy for subdomains
        cp config/nginx/ssl/getit.com.bd.crt config/nginx/ssl/api.getit.com.bd.crt
        cp config/nginx/ssl/getit.com.bd.key config/nginx/ssl/api.getit.com.bd.key
        cp config/nginx/ssl/getit.com.bd.crt config/nginx/ssl/admin.getit.com.bd.crt
        cp config/nginx/ssl/getit.com.bd.key config/nginx/ssl/admin.getit.com.bd.key
        cp config/nginx/ssl/getit.com.bd.crt config/nginx/ssl/monitoring.getit.com.bd.crt
        cp config/nginx/ssl/getit.com.bd.key config/nginx/ssl/monitoring.getit.com.bd.key
        
        print_success "Self-signed certificates generated"
    else
        print_success "SSL certificates found"
    fi
}

# Function to run database migrations
run_database_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    sleep 30
    
    # Run migrations
    if docker-compose -f deploy/docker/docker-compose.production.yml exec -T api-gateway npm run db:push; then
        print_success "Database migrations completed"
    else
        print_warning "Database migrations failed"
    fi
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring and observability..."
    
    # Apply monitoring configurations
    if [[ $DEPLOYMENT_TYPE == "kubernetes" ]]; then
        kubectl apply -f deploy/kubernetes/monitoring/ -n $NAMESPACE
    fi
    
    print_success "Monitoring setup completed"
}

# Function to display deployment information
display_deployment_info() {
    print_success "🎉 GetIt Bangladesh deployment completed successfully!"
    echo ""
    print_status "Deployment Information:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Namespace: $NAMESPACE"
    echo "  Domain: $DOMAIN"
    echo ""
    print_status "Access URLs:"
    echo "  Frontend: https://$DOMAIN"
    echo "  API: https://api.$DOMAIN"
    echo "  Admin: https://admin.$DOMAIN"
    echo "  Monitoring: https://monitoring.$DOMAIN/grafana"
    echo ""
    print_status "Next Steps:"
    echo "  1. Configure DNS records to point to your load balancer"
    echo "  2. Update SSL certificates with valid ones from Let's Encrypt or CA"
    echo "  3. Configure payment gateway webhooks"
    echo "  4. Setup monitoring alerts"
    echo "  5. Run performance tests"
}

# Main deployment function
main() {
    print_status "🚀 Starting GetIt Bangladesh Production Deployment"
    echo ""
    
    # Parse command line arguments
    DEPLOYMENT_TYPE=${1:-docker-compose}
    
    # Check prerequisites
    check_prerequisites
    
    # Setup SSL certificates
    setup_ssl_certificates
    
    # Build and push images (for Kubernetes deployment)
    if [[ $DEPLOYMENT_TYPE == "kubernetes" ]]; then
        build_and_push_images
    fi
    
    # Deploy based on type
    case $DEPLOYMENT_TYPE in
        "docker-compose")
            deploy_docker_compose
            ;;
        "kubernetes")
            deploy_kubernetes
            ;;
        *)
            print_error "Invalid deployment type. Use 'docker-compose' or 'kubernetes'"
            exit 1
            ;;
    esac
    
    # Run database migrations
    run_database_migrations
    
    # Setup monitoring
    setup_monitoring
    
    # Display deployment information
    display_deployment_info
}

# Script usage
usage() {
    echo "Usage: $0 [docker-compose|kubernetes]"
    echo ""
    echo "Deployment Types:"
    echo "  docker-compose  Deploy using Docker Compose (default)"
    echo "  kubernetes      Deploy using Kubernetes"
    echo ""
    echo "Environment Variables:"
    echo "  ENVIRONMENT     Deployment environment (default: production)"
    echo "  NAMESPACE       Kubernetes namespace (default: getit-production)"
    echo "  DOCKER_REGISTRY Docker registry URL (default: registry.getit.com.bd)"
    echo "  DOMAIN          Primary domain (default: getit.com.bd)"
}

# Handle help flag
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    usage
    exit 0
fi

# Run main function
main "$@"