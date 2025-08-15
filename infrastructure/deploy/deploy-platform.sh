#!/bin/bash

# GetIt Platform - Comprehensive Deployment Automation Script
# Amazon.com/Shopee.sg-Level Infrastructure Deployment
# Phase 1: Critical Infrastructure Foundation

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOYMENT_LOG="$PROJECT_ROOT/logs/deployment-$(date +%Y%m%d-%H%M%S).log"
ENVIRONMENT="${ENVIRONMENT:-development}"
DRY_RUN="${DRY_RUN:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)  echo -e "${BLUE}[INFO]${NC} $message" | tee -a "$DEPLOYMENT_LOG" ;;
        WARN)  echo -e "${YELLOW}[WARN]${NC} $message" | tee -a "$DEPLOYMENT_LOG" ;;
        ERROR) echo -e "${RED}[ERROR]${NC} $message" | tee -a "$DEPLOYMENT_LOG" ;;
        SUCCESS) echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "$DEPLOYMENT_LOG" ;;
    esac
}

# Error handling
error_exit() {
    log ERROR "$1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log INFO "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        error_exit "kubectl is not installed or not in PATH"
    fi
    
    # Check kubectl connectivity
    if ! kubectl cluster-info &> /dev/null; then
        error_exit "Cannot connect to Kubernetes cluster"
    fi
    
    # Check docker (for image builds)
    if ! command -v docker &> /dev/null; then
        error_exit "docker is not installed or not in PATH"
    fi
    
    log SUCCESS "All prerequisites met"
}

# Create namespaces
create_namespaces() {
    log INFO "Creating Kubernetes namespaces..."
    
    local namespaces=(
        "getit-development"
        "getit-production" 
        "getit-monitoring"
        "getit-security"
    )
    
    for namespace in "${namespaces[@]}"; do
        if [[ "$DRY_RUN" == "true" ]]; then
            log INFO "DRY RUN: Would create namespace $namespace"
        else
            kubectl create namespace "$namespace" --dry-run=client -o yaml | kubectl apply -f -
            log SUCCESS "Created/Updated namespace: $namespace"
        fi
    done
}

# Deploy secrets
deploy_secrets() {
    log INFO "Deploying secrets..."
    
    local target_namespace="getit-$ENVIRONMENT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log INFO "DRY RUN: Would deploy secrets to $target_namespace"
        return
    fi
    
    # Apply secret configurations
    kubectl apply -f "$PROJECT_ROOT/infrastructure/kubernetes/secrets/" -n "$target_namespace"
    
    log SUCCESS "Secrets deployed to $target_namespace"
}

# Deploy core services
deploy_core_services() {
    log INFO "Deploying core microservices..."
    
    local target_namespace="getit-$ENVIRONMENT"
    local deployment_dir="$PROJECT_ROOT/infrastructure/kubernetes/deployments/core-services"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log INFO "DRY RUN: Would deploy core services to $target_namespace"
        return
    fi
    
    # Apply deployments
    kubectl apply -f "$deployment_dir" -n "$target_namespace"
    
    # Wait for deployments to be ready
    log INFO "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=600s deployment --all -n "$target_namespace"
    
    log SUCCESS "Core services deployed successfully"
}

# Deploy monitoring infrastructure
deploy_monitoring() {
    log INFO "Deploying monitoring infrastructure..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log INFO "DRY RUN: Would deploy monitoring to getit-monitoring"
        return
    fi
    
    # Deploy Prometheus
    kubectl apply -f "$PROJECT_ROOT/infrastructure/monitoring/prometheus/" -n getit-monitoring
    
    # Deploy Grafana
    kubectl apply -f "$PROJECT_ROOT/infrastructure/monitoring/grafana/" -n getit-monitoring
    
    log SUCCESS "Monitoring infrastructure deployed"
}

# Run health checks
run_health_checks() {
    log INFO "Running health checks..."
    
    local target_namespace="getit-$ENVIRONMENT"
    local services=(
        "user-service:3001/api/v1/users/health"
        "product-service:3002/api/v1/products/health"
        "payment-service:3003/api/v1/payments/health"
        "order-service:3004/api/v1/orders/health"
        "shipping-service:3013/api/v1/shipping/health"
    )
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log INFO "DRY RUN: Would run health checks"
        return
    fi
    
    for service_endpoint in "${services[@]}"; do
        local service_name=$(echo "$service_endpoint" | cut -d: -f1)
        local endpoint="http://$service_endpoint"
        
        log INFO "Checking health of $service_name..."
        
        # Run health check using a temporary pod
        if kubectl run health-check-"$service_name" \
            --image=curlimages/curl:latest \
            --rm -i --restart=Never \
            --namespace="$target_namespace" \
            --timeout=30s \
            -- curl -f "$endpoint" &> /dev/null; then
            log SUCCESS "$service_name is healthy"
        else
            log WARN "$service_name health check failed"
        fi
    done
}

# Main deployment function
main() {
    log INFO "Starting GetIt Platform deployment..."
    log INFO "Environment: $ENVIRONMENT"
    log INFO "Dry Run: $DRY_RUN"
    
    # Create logs directory
    mkdir -p "$PROJECT_ROOT/logs"
    
    # Execute deployment steps
    check_prerequisites
    create_namespaces
    deploy_secrets
    deploy_core_services
    deploy_monitoring
    run_health_checks
    
    log SUCCESS "GetIt Platform deployment completed successfully!"
    log INFO "Monitoring available at: http://grafana.getit-platform.com"
    log INFO "Full deployment log: $DEPLOYMENT_LOG"
}

# Script usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    -e, --environment     Target environment (development|staging|production)
    -d, --dry-run        Perform a dry run without making actual changes
    -h, --help           Show this help message

Examples:
    # Deploy to development environment
    $0 --environment development
    
    # Dry run for production
    $0 --environment production --dry-run
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN="true"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log ERROR "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    error_exit "Invalid environment: $ENVIRONMENT. Must be development, staging, or production."
fi

# Execute main function
main "$@"