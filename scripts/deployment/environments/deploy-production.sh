#!/bin/bash

# GetIt Multi-Vendor E-commerce: Production Deployment Script
# Amazon.com/Shopee.sg Level Production Deployment Automation

set -euo pipefail

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
DEPLOYMENT_DIR="$PROJECT_ROOT/deploy"
LOGS_DIR="$PROJECT_ROOT/logs/deployment"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_LOG="$LOGS_DIR/production-deploy-$TIMESTAMP.log"

# Environment Configuration
ENVIRONMENT="production"
NAMESPACE="getit-production"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-ghcr.io/getit-bangladesh}"
BUILD_VERSION="${BUILD_VERSION:-latest}"
HEALTH_CHECK_TIMEOUT=300
ROLLBACK_ENABLED="${ROLLBACK_ENABLED:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service configurations
declare -A SERVICES=(
    ["api-gateway"]="5000"
    ["user-service"]="5001"
    ["product-service"]="5002"
    ["order-service"]="5003"
    ["payment-service"]="5004"
    ["vendor-service"]="5005"
    ["notification-service"]="5006"
    ["analytics-service"]="5007"
    ["shipping-service"]="5008"
    ["ml-service"]="5009"
    ["finance-service"]="5010"
    ["kyc-service"]="5011"
    ["inventory-service"]="5012"
    ["marketing-service"]="5013"
    ["search-service"]="5014"
    ["localization-service"]="5015"
)

# Bangladesh-specific services
declare -A BANGLADESH_SERVICES=(
    ["bkash-gateway"]="6001"
    ["nagad-gateway"]="6002"
    ["rocket-gateway"]="6003"
    ["pathao-shipping"]="6004"
    ["paperfly-shipping"]="6005"
    ["ssl-wireless-sms"]="6006"
    ["kyc-verification"]="6007"
)

# Initialize
mkdir -p "$DEPLOYMENT_DIR" "$LOGS_DIR"

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

success() {
    echo -e "${PURPLE}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

# Pre-deployment checks
pre_deployment_checks() {
    info "Running pre-deployment checks..."
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is required but not installed"
        exit 1
    fi
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        error "Docker is required but not installed"
        exit 1
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        info "Creating namespace: $NAMESPACE"
        kubectl create namespace "$NAMESPACE"
    fi
    
    # Check if images are built
    if [ ! -d "$PROJECT_ROOT/dist" ]; then
        error "No build found. Run build script first."
        exit 1
    fi
    
    success "Pre-deployment checks passed"
}

# Build and push Docker images
build_and_push_images() {
    info "Building and pushing Docker images..."
    
    # Build all service images
    for service in "${!SERVICES[@]}"; do
        info "Building $service image..."
        
        # Create Dockerfile for service
        cat > "$PROJECT_ROOT/Dockerfile.$service" << EOF
FROM node:18-alpine

# Install production dependencies
RUN apk add --no-cache postgresql-client redis-tools curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist/$service ./
COPY shared ./shared

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE ${SERVICES[$service]}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${SERVICES[$service]}/health || exit 1

# Start the application
CMD ["node", "index.js"]
EOF
        
        # Build Docker image
        if ! docker build -f "Dockerfile.$service" -t "$DOCKER_REGISTRY/$service:$BUILD_VERSION" .; then
            error "Failed to build $service image"
            exit 1
        fi
        
        # Push to registry
        if ! docker push "$DOCKER_REGISTRY/$service:$BUILD_VERSION"; then
            error "Failed to push $service image"
            exit 1
        fi
        
        # Clean up Dockerfile
        rm -f "$PROJECT_ROOT/Dockerfile.$service"
        
        success "Built and pushed $service:$BUILD_VERSION"
    done
    
    success "All images built and pushed successfully"
}

# Deploy database infrastructure
deploy_database() {
    info "Deploying database infrastructure..."
    
    # PostgreSQL deployment
    cat > "$DEPLOYMENT_DIR/postgresql.yaml" << EOF
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql
  namespace: $NAMESPACE
spec:
  serviceName: postgresql
  replicas: 1
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: getit_production
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgresql-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
  volumeClaimTemplates:
  - metadata:
      name: postgresql-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 50Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgresql
  namespace: $NAMESPACE
spec:
  selector:
    app: postgresql
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
EOF
    
    # Redis deployment
    cat > "$DEPLOYMENT_DIR/redis.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        volumeMounts:
        - name: redis-storage
          mountPath: /data
      volumes:
      - name: redis-storage
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: $NAMESPACE
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
EOF
    
    # Apply database deployments
    kubectl apply -f "$DEPLOYMENT_DIR/postgresql.yaml"
    kubectl apply -f "$DEPLOYMENT_DIR/redis.yaml"
    
    success "Database infrastructure deployed"
}

# Deploy microservices
deploy_microservices() {
    info "Deploying microservices..."
    
    for service in "${!SERVICES[@]}"; do
        local port="${SERVICES[$service]}"
        
        info "Deploying $service..."
        
        cat > "$DEPLOYMENT_DIR/$service.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $service
  namespace: $NAMESPACE
  labels:
    app: $service
    version: $BUILD_VERSION
spec:
  replicas: 3
  selector:
    matchLabels:
      app: $service
  template:
    metadata:
      labels:
        app: $service
        version: $BUILD_VERSION
    spec:
      containers:
      - name: $service
        image: $DOCKER_REGISTRY/$service:$BUILD_VERSION
        ports:
        - containerPort: $port
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "$port"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          value: "redis://redis:6379"
        - name: SERVICE_NAME
          value: "$service"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: $port
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: $port
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: $service
  namespace: $NAMESPACE
spec:
  selector:
    app: $service
  ports:
  - port: $port
    targetPort: $port
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: $service-hpa
  namespace: $NAMESPACE
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: $service
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF
        
        # Apply service deployment
        kubectl apply -f "$DEPLOYMENT_DIR/$service.yaml"
        
        success "Deployed $service successfully"
    done
    
    success "All microservices deployed"
}

# Deploy Bangladesh-specific services
deploy_bangladesh_services() {
    info "Deploying Bangladesh-specific services..."
    
    for service in "${!BANGLADESH_SERVICES[@]}"; do
        local port="${BANGLADESH_SERVICES[$service]}"
        
        info "Deploying Bangladesh service: $service..."
        
        cat > "$DEPLOYMENT_DIR/bangladesh-$service.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bangladesh-$service
  namespace: $NAMESPACE
  labels:
    app: bangladesh-$service
    region: bangladesh
    type: local-integration
spec:
  replicas: 2
  selector:
    matchLabels:
      app: bangladesh-$service
  template:
    metadata:
      labels:
        app: bangladesh-$service
        region: bangladesh
    spec:
      containers:
      - name: bangladesh-$service
        image: $DOCKER_REGISTRY/bangladesh-$service:$BUILD_VERSION
        ports:
        - containerPort: $port
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "$port"
        - name: BANGLADESH_REGION
          value: "true"
        - name: SERVICE_TYPE
          value: "bangladesh-integration"
        envFrom:
        - secretRef:
            name: bangladesh-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "125m"
          limits:
            memory: "512Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /health
            port: $port
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: bangladesh-$service
  namespace: $NAMESPACE
spec:
  selector:
    app: bangladesh-$service
  ports:
  - port: $port
    targetPort: $port
EOF
        
        kubectl apply -f "$DEPLOYMENT_DIR/bangladesh-$service.yaml"
        
        success "Deployed Bangladesh service: $service"
    done
    
    success "Bangladesh-specific services deployed"
}

# Deploy ingress and load balancer
deploy_ingress() {
    info "Deploying ingress and load balancer..."
    
    cat > "$DEPLOYMENT_DIR/ingress.yaml" << EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: getit-ingress
  namespace: $NAMESPACE
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.getit.com.bd
    - www.getit.com.bd
    secretName: getit-tls
  rules:
  - host: api.getit.com.bd
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 5000
  - host: www.getit.com.bd
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
EOF
    
    kubectl apply -f "$DEPLOYMENT_DIR/ingress.yaml"
    
    success "Ingress deployed successfully"
}

# Health checks
perform_health_checks() {
    info "Performing deployment health checks..."
    
    local failed_services=()
    local check_timeout=$HEALTH_CHECK_TIMEOUT
    
    # Wait for all services to be ready
    for service in "${!SERVICES[@]}"; do
        info "Checking health of $service..."
        
        local ready=false
        local elapsed=0
        
        while [ $elapsed -lt $check_timeout ] && [ "$ready" = false ]; do
            if kubectl get pods -n "$NAMESPACE" -l app="$service" --field-selector=status.phase=Running | grep -q Running; then
                # Check if pods are ready
                local ready_pods=$(kubectl get pods -n "$NAMESPACE" -l app="$service" -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o True | wc -l)
                local total_pods=$(kubectl get pods -n "$NAMESPACE" -l app="$service" --no-headers | wc -l)
                
                if [ "$ready_pods" -eq "$total_pods" ] && [ "$total_pods" -gt 0 ]; then
                    ready=true
                    success "$service is healthy ($ready_pods/$total_pods pods ready)"
                fi
            fi
            
            if [ "$ready" = false ]; then
                sleep 10
                elapsed=$((elapsed + 10))
            fi
        done
        
        if [ "$ready" = false ]; then
            failed_services+=("$service")
            error "$service health check failed after ${check_timeout}s"
        fi
    done
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        error "Health check failed for services: ${failed_services[*]}"
        return 1
    fi
    
    success "All services passed health checks"
    return 0
}

# Rollback function
rollback_deployment() {
    local rollback_reason="$1"
    
    error "Rolling back deployment: $rollback_reason"
    
    if [ "$ROLLBACK_ENABLED" = "true" ]; then
        info "Executing rollback procedure..."
        
        # Rollback all deployments
        for service in "${!SERVICES[@]}"; do
            kubectl rollout undo deployment/"$service" -n "$NAMESPACE" || true
        done
        
        success "Rollback completed"
    else
        warning "Rollback is disabled"
    fi
}

# Generate deployment report
generate_deployment_report() {
    local deployment_status="$1"
    local report_file="$LOGS_DIR/deployment-report-$TIMESTAMP.json"
    
    info "Generating deployment report..."
    
    cat > "$report_file" << EOF
{
  "deploymentId": "$(uuidgen)",
  "timestamp": "$TIMESTAMP",
  "environment": "$ENVIRONMENT",
  "namespace": "$NAMESPACE",
  "buildVersion": "$BUILD_VERSION",
  "status": "$deployment_status",
  "services": {
    "core": [$(printf '"%s",' "${!SERVICES[@]}" | sed 's/,$//')],
    "bangladesh": [$(printf '"%s",' "${!BANGLADESH_SERVICES[@]}" | sed 's/,$//')],
    "total": $((${#SERVICES[@]} + ${#BANGLADESH_SERVICES[@]}))
  },
  "infrastructure": {
    "database": "PostgreSQL 15",
    "cache": "Redis 7",
    "orchestration": "Kubernetes",
    "registry": "$DOCKER_REGISTRY"
  },
  "deployment": {
    "strategy": "rolling-update",
    "replicas": {
      "min": 3,
      "max": 50
    },
    "healthCheckTimeout": $HEALTH_CHECK_TIMEOUT,
    "rollbackEnabled": $ROLLBACK_ENABLED
  },
  "monitoring": {
    "logs": "$DEPLOYMENT_LOG",
    "metrics": "prometheus",
    "alerts": "grafana"
  }
}
EOF
    
    success "Deployment report generated: $report_file"
}

# Main deployment function
main() {
    local deployment_start=$(date +%s)
    
    log "Starting GetIt Multi-Vendor E-commerce Production Deployment"
    log "Target: Amazon.com/Shopee.sg Level Production Environment"
    log "Environment: $ENVIRONMENT"
    log "Namespace: $NAMESPACE"
    log "Build Version: $BUILD_VERSION"
    
    # Pre-deployment checks
    pre_deployment_checks || exit 1
    
    # Build and push images
    build_and_push_images || exit 1
    
    # Deploy database infrastructure
    deploy_database || exit 1
    
    # Deploy microservices
    deploy_microservices || exit 1
    
    # Deploy Bangladesh-specific services
    deploy_bangladesh_services || exit 1
    
    # Deploy ingress
    deploy_ingress || exit 1
    
    # Perform health checks
    if ! perform_health_checks; then
        rollback_deployment "Health check failures"
        generate_deployment_report "failed"
        exit 1
    fi
    
    local deployment_end=$(date +%s)
    local deployment_duration=$((deployment_end - deployment_start))
    
    # Generate deployment report
    generate_deployment_report "success"
    
    success "Production deployment completed successfully!"
    log "Deployment Duration: ${deployment_duration}s"
    log "Services Deployed: $((${#SERVICES[@]} + ${#BANGLADESH_SERVICES[@]}))"
    log "Environment: $ENVIRONMENT"
    log "Namespace: $NAMESPACE"
    
    # Print deployment summary
    echo -e "\n${GREEN}🚀 PRODUCTION DEPLOYMENT SUMMARY${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Environment: $ENVIRONMENT${NC}"
    echo -e "${GREEN}✅ Namespace: $NAMESPACE${NC}"
    echo -e "${GREEN}✅ Core Services: ${#SERVICES[@]}${NC}"
    echo -e "${GREEN}✅ Bangladesh Services: ${#BANGLADESH_SERVICES[@]}${NC}"
    echo -e "${GREEN}✅ Total Services: $((${#SERVICES[@]} + ${#BANGLADESH_SERVICES[@]}))${NC}"
    echo -e "${GREEN}✅ Build Version: $BUILD_VERSION${NC}"
    echo -e "${GREEN}✅ Deployment Duration: ${deployment_duration}s${NC}"
    echo -e "${GREEN}✅ Health Checks: PASSED${NC}"
    echo -e "${GREEN}✅ Status: PRODUCTION READY${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    info "GetIt Multi-Vendor E-commerce is now live at Amazon.com/Shopee.sg level!"
    info "API Endpoint: https://api.getit.com.bd"
    info "Frontend: https://www.getit.com.bd"
}

# Execute main function
main "$@"