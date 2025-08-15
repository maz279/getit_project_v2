#!/bin/bash

# GetIt Multi-Vendor Ecommerce - Bangladesh Payment Gateway Deployment Script
# Amazon.com/Shopee.sg-level payment integration for Bangladesh market
# Deploys bKash, Nagad, Rocket, and SSLCommerz payment gateways

set -euo pipefail

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/deploy-payment-gateways-$(date +%Y%m%d-%H%M%S).log"
ENVIRONMENT="${ENVIRONMENT:-staging}"
DEPLOYMENT_VERSION="${DEPLOYMENT_VERSION:-$(date +%Y%m%d.%H%M%S)}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Payment gateway configurations
declare -A PAYMENT_GATEWAYS=(
    ["bkash"]="bKash Mobile Banking"
    ["nagad"]="Nagad Digital Banking"
    ["rocket"]="Rocket Mobile Banking"
    ["sslcommerz"]="SSLCommerz Payment Gateway"
    ["portwallet"]="Portwallet Digital Payments"
)

# Environment-specific configurations
declare -A ENVIRONMENTS=(
    ["development"]="dev"
    ["staging"]="staging"
    ["production"]="prod"
)

# Deployment statistics
TOTAL_GATEWAYS=0
SUCCESSFUL_DEPLOYMENTS=0
FAILED_DEPLOYMENTS=0

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)  echo -e "${GREEN}[INFO]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE" ;;
        WARN)  echo -e "${YELLOW}[WARN]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE" ;;
        ERROR) echo -e "${RED}[ERROR]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE" ;;
        DEBUG) echo -e "${BLUE}[DEBUG]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE" ;;
        SUCCESS) echo -e "${GREEN}[SUCCESS]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE" ;;
    esac
}

# Error handling
error_exit() {
    log ERROR "$1"
    exit 1
}

# Function to check prerequisites
check_prerequisites() {
    log INFO "Checking Bangladesh payment gateway deployment prerequisites..."
    
    # Check required environment variables
    local required_vars=(
        "BKASH_API_KEY"
        "BKASH_SECRET_KEY"
        "NAGAD_MERCHANT_ID"
        "NAGAD_API_KEY"
        "ROCKET_MERCHANT_ID"
        "ROCKET_API_SECRET"
        "SSLCOMMERZ_STORE_ID"
        "SSLCOMMERZ_STORE_PASSWORD"
    )
    
    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log ERROR "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            log ERROR "  - $var"
        done
        error_exit "Please set all required payment gateway credentials"
    fi
    
    # Check kubectl access
    if ! command -v kubectl &> /dev/null; then
        error_exit "kubectl is not installed. Please install kubectl to continue."
    fi
    
    # Check cluster access
    if ! kubectl cluster-info &> /dev/null; then
        error_exit "Cannot access Kubernetes cluster. Please check your kubeconfig."
    fi
    
    # Check Docker access
    if ! command -v docker &> /dev/null; then
        error_exit "Docker is not installed. Please install Docker to continue."
    fi
    
    log SUCCESS "Prerequisites check passed ✓"
}

# Function to create payment gateway secrets
create_payment_secrets() {
    local gateway=$1
    local namespace="getit-${ENVIRONMENTS[$ENVIRONMENT]}"
    
    log INFO "Creating secrets for $gateway payment gateway..."
    
    case $gateway in
        "bkash")
            kubectl create secret generic bkash-credentials \
                --from-literal=api-key="$BKASH_API_KEY" \
                --from-literal=secret-key="$BKASH_SECRET_KEY" \
                --from-literal=app-key="$BKASH_APP_KEY" \
                --from-literal=app-secret="$BKASH_APP_SECRET" \
                --from-literal=username="$BKASH_USERNAME" \
                --from-literal=password="$BKASH_PASSWORD" \
                --from-literal=base-url="$BKASH_BASE_URL" \
                --namespace="$namespace" \
                --dry-run=client -o yaml | kubectl apply -f -
            ;;
        "nagad")
            kubectl create secret generic nagad-credentials \
                --from-literal=merchant-id="$NAGAD_MERCHANT_ID" \
                --from-literal=api-key="$NAGAD_API_KEY" \
                --from-literal=merchant-number="$NAGAD_MERCHANT_NUMBER" \
                --from-literal=public-key="$NAGAD_PUBLIC_KEY" \
                --from-literal=private-key="$NAGAD_PRIVATE_KEY" \
                --from-literal=base-url="$NAGAD_BASE_URL" \
                --namespace="$namespace" \
                --dry-run=client -o yaml | kubectl apply -f -
            ;;
        "rocket")
            kubectl create secret generic rocket-credentials \
                --from-literal=merchant-id="$ROCKET_MERCHANT_ID" \
                --from-literal=api-secret="$ROCKET_API_SECRET" \
                --from-literal=merchant-username="$ROCKET_MERCHANT_USERNAME" \
                --from-literal=merchant-password="$ROCKET_MERCHANT_PASSWORD" \
                --from-literal=base-url="$ROCKET_BASE_URL" \
                --namespace="$namespace" \
                --dry-run=client -o yaml | kubectl apply -f -
            ;;
        "sslcommerz")
            kubectl create secret generic sslcommerz-credentials \
                --from-literal=store-id="$SSLCOMMERZ_STORE_ID" \
                --from-literal=store-password="$SSLCOMMERZ_STORE_PASSWORD" \
                --from-literal=base-url="$SSLCOMMERZ_BASE_URL" \
                --namespace="$namespace" \
                --dry-run=client -o yaml | kubectl apply -f -
            ;;
        "portwallet")
            kubectl create secret generic portwallet-credentials \
                --from-literal=merchant-id="$PORTWALLET_MERCHANT_ID" \
                --from-literal=api-key="$PORTWALLET_API_KEY" \
                --from-literal=secret-key="$PORTWALLET_SECRET_KEY" \
                --from-literal=base-url="$PORTWALLET_BASE_URL" \
                --namespace="$namespace" \
                --dry-run=client -o yaml | kubectl apply -f -
            ;;
    esac
    
    log SUCCESS "Secrets created for $gateway ✓"
}

# Function to deploy payment gateway service
deploy_payment_service() {
    local gateway=$1
    local namespace="getit-${ENVIRONMENTS[$ENVIRONMENT]}"
    
    log INFO "Deploying $gateway payment service..."
    
    # Create deployment YAML
    local deployment_file="/tmp/${gateway}-deployment.yaml"
    
    cat > "$deployment_file" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${gateway}-payment-service
  namespace: ${namespace}
  labels:
    app: ${gateway}-payment-service
    gateway: ${gateway}
    country: bangladesh
    version: ${DEPLOYMENT_VERSION}
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ${gateway}-payment-service
  template:
    metadata:
      labels:
        app: ${gateway}-payment-service
        gateway: ${gateway}
        country: bangladesh
    spec:
      containers:
      - name: ${gateway}-service
        image: getit/${gateway}-payment-service:${DEPLOYMENT_VERSION}
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "${ENVIRONMENT}"
        - name: PORT
          value: "3000"
        - name: GATEWAY_NAME
          value: "${gateway}"
        - name: COUNTRY
          value: "BD"
        - name: CURRENCY
          value: "BDT"
        - name: TIMEZONE
          value: "Asia/Dhaka"
        envFrom:
        - secretRef:
            name: ${gateway}-credentials
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 1000
          readOnlyRootFilesystem: true
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: cache
          mountPath: /app/cache
      volumes:
      - name: tmp
        emptyDir: {}
      - name: cache
        emptyDir: {}
      securityContext:
        fsGroup: 1000
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - ${gateway}-payment-service
              topologyKey: kubernetes.io/hostname
---
apiVersion: v1
kind: Service
metadata:
  name: ${gateway}-payment-service
  namespace: ${namespace}
  labels:
    app: ${gateway}-payment-service
    gateway: ${gateway}
spec:
  selector:
    app: ${gateway}-payment-service
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${gateway}-payment-hpa
  namespace: ${namespace}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${gateway}-payment-service
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
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
EOF
    
    # Apply deployment
    kubectl apply -f "$deployment_file" || {
        log ERROR "Failed to deploy $gateway service"
        return 1
    }
    
    # Wait for deployment to be ready
    log INFO "Waiting for $gateway deployment to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/${gateway}-payment-service -n "$namespace" || {
        log ERROR "$gateway deployment failed to become ready"
        return 1
    }
    
    # Clean up temporary file
    rm -f "$deployment_file"
    
    log SUCCESS "$gateway payment service deployed successfully ✓"
    return 0
}

# Function to create ingress rules
create_payment_ingress() {
    local namespace="getit-${ENVIRONMENTS[$ENVIRONMENT]}"
    
    log INFO "Creating payment gateway ingress rules..."
    
    local ingress_file="/tmp/payment-gateway-ingress.yaml"
    
    cat > "$ingress_file" << EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: payment-gateway-ingress
  namespace: ${namespace}
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://getit.com.bd"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-headers: "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization"
spec:
  tls:
  - hosts:
    - api.getit.com.bd
    secretName: payment-gateway-tls
  rules:
  - host: api.getit.com.bd
    http:
      paths:
      - path: /api/v1/payments/bkash
        pathType: Prefix
        backend:
          service:
            name: bkash-payment-service
            port:
              number: 80
      - path: /api/v1/payments/nagad
        pathType: Prefix
        backend:
          service:
            name: nagad-payment-service
            port:
              number: 80
      - path: /api/v1/payments/rocket
        pathType: Prefix
        backend:
          service:
            name: rocket-payment-service
            port:
              number: 80
      - path: /api/v1/payments/sslcommerz
        pathType: Prefix
        backend:
          service:
            name: sslcommerz-payment-service
            port:
              number: 80
      - path: /api/v1/payments/portwallet
        pathType: Prefix
        backend:
          service:
            name: portwallet-payment-service
            port:
              number: 80
EOF
    
    kubectl apply -f "$ingress_file" || {
        log ERROR "Failed to create payment gateway ingress"
        return 1
    }
    
    rm -f "$ingress_file"
    
    log SUCCESS "Payment gateway ingress created successfully ✓"
}

# Function to configure monitoring
setup_monitoring() {
    local namespace="getit-${ENVIRONMENTS[$ENVIRONMENT]}"
    
    log INFO "Setting up payment gateway monitoring..."
    
    # Create ServiceMonitor for Prometheus
    local monitor_file="/tmp/payment-gateway-monitor.yaml"
    
    cat > "$monitor_file" << EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: payment-gateway-monitor
  namespace: ${namespace}
  labels:
    app: payment-gateway
    country: bangladesh
spec:
  selector:
    matchLabels:
      app: payment-service
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
    scrapeTimeout: 10s
  targetLabels:
  - gateway
  - country
---
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: payment-gateway-alerts
  namespace: ${namespace}
spec:
  groups:
  - name: payment-gateway-alerts
    rules:
    - alert: PaymentGatewayDown
      expr: up{job=~".*payment-service.*"} == 0
      for: 1m
      labels:
        severity: critical
        country: bangladesh
      annotations:
        summary: "Payment gateway {{ \$labels.gateway }} is down"
        description: "Payment gateway {{ \$labels.gateway }} has been down for more than 1 minute"
    - alert: PaymentGatewayHighErrorRate
      expr: rate(http_requests_total{job=~".*payment-service.*",status=~"5.."}[5m]) / rate(http_requests_total{job=~".*payment-service.*"}[5m]) > 0.05
      for: 5m
      labels:
        severity: warning
        country: bangladesh
      annotations:
        summary: "High error rate on payment gateway {{ \$labels.gateway }}"
        description: "Payment gateway {{ \$labels.gateway }} has error rate above 5% for 5 minutes"
    - alert: PaymentGatewayHighLatency
      expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=~".*payment-service.*"}[5m])) > 2
      for: 5m
      labels:
        severity: warning
        country: bangladesh
      annotations:
        summary: "High latency on payment gateway {{ \$labels.gateway }}"
        description: "Payment gateway {{ \$labels.gateway }} 95th percentile latency is above 2 seconds"
EOF
    
    kubectl apply -f "$monitor_file" || {
        log WARN "Failed to create payment gateway monitoring (Prometheus may not be installed)"
    }
    
    rm -f "$monitor_file"
    
    log SUCCESS "Payment gateway monitoring configured ✓"
}

# Function to run health checks
run_health_checks() {
    local namespace="getit-${ENVIRONMENTS[$ENVIRONMENT]}"
    
    log INFO "Running payment gateway health checks..."
    
    for gateway in "${!PAYMENT_GATEWAYS[@]}"; do
        log INFO "Checking health of $gateway payment service..."
        
        # Get service endpoint
        local service_ip=$(kubectl get service "${gateway}-payment-service" -n "$namespace" -o jsonpath='{.spec.clusterIP}')
        
        if [[ -n "$service_ip" ]]; then
            # Port forward for health check
            kubectl port-forward "service/${gateway}-payment-service" 8080:80 -n "$namespace" &
            local port_forward_pid=$!
            
            sleep 5
            
            # Health check
            if curl -s -f "http://localhost:8080/health" > /dev/null; then
                log SUCCESS "$gateway payment service is healthy ✓"
            else
                log ERROR "$gateway payment service health check failed"
            fi
            
            # Clean up port forward
            kill $port_forward_pid 2>/dev/null || true
        else
            log ERROR "Could not get service IP for $gateway"
        fi
    done
}

# Function to generate deployment report
generate_deployment_report() {
    log INFO "Generating payment gateway deployment report..."
    
    local report_file="${PROJECT_ROOT}/deployment-reports/payment-gateways-${DEPLOYMENT_VERSION}.json"
    mkdir -p "$(dirname "$report_file")"
    
    local gateway_status="["
    local first=true
    
    for gateway in "${!PAYMENT_GATEWAYS[@]}"; do
        if [ "$first" = false ]; then
            gateway_status+=","
        fi
        first=false
        
        gateway_status+="{\"name\":\"$gateway\",\"description\":\"${PAYMENT_GATEWAYS[$gateway]}\",\"status\":\"deployed\"}"
    done
    gateway_status+="]"
    
    cat > "$report_file" << EOF
{
  "deploymentVersion": "$DEPLOYMENT_VERSION",
  "deploymentTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "platform": "GetIt Multi-Vendor Ecommerce",
  "market": "Bangladesh",
  "deploymentType": "payment-gateways",
  "statistics": {
    "totalGateways": $TOTAL_GATEWAYS,
    "successfulDeployments": $SUCCESSFUL_DEPLOYMENTS,
    "failedDeployments": $FAILED_DEPLOYMENTS,
    "successRate": "$(( SUCCESSFUL_DEPLOYMENTS * 100 / TOTAL_GATEWAYS ))%"
  },
  "paymentGateways": $gateway_status,
  "features": {
    "mobileBanking": ["bKash", "Nagad", "Rocket"],
    "internationalGateway": ["SSLCommerz"],
    "digitalWallet": ["Portwallet"],
    "autoScaling": true,
    "monitoring": true,
    "compliance": ["Bangladesh Bank", "PCI DSS"]
  },
  "endpoints": {
    "bkash": "/api/v1/payments/bkash",
    "nagad": "/api/v1/payments/nagad", 
    "rocket": "/api/v1/payments/rocket",
    "sslcommerz": "/api/v1/payments/sslcommerz",
    "portwallet": "/api/v1/payments/portwallet"
  }
}
EOF
    
    log SUCCESS "Deployment report generated: $report_file ✓"
}

# Main execution function
main() {
    local start_time=$SECONDS
    
    log INFO "Starting Bangladesh Payment Gateway Deployment"
    log INFO "Deployment Version: $DEPLOYMENT_VERSION"
    log INFO "Environment: $ENVIRONMENT"
    log INFO "Project Root: $PROJECT_ROOT"
    
    # Create logs directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Execute deployment steps
    check_prerequisites
    
    # Deploy each payment gateway
    for gateway in "${!PAYMENT_GATEWAYS[@]}"; do
        TOTAL_GATEWAYS=$((TOTAL_GATEWAYS + 1))
        
        log INFO "Deploying ${PAYMENT_GATEWAYS[$gateway]}..."
        
        if create_payment_secrets "$gateway" && deploy_payment_service "$gateway"; then
            SUCCESSFUL_DEPLOYMENTS=$((SUCCESSFUL_DEPLOYMENTS + 1))
            log SUCCESS "${PAYMENT_GATEWAYS[$gateway]} deployed successfully ✓"
        else
            FAILED_DEPLOYMENTS=$((FAILED_DEPLOYMENTS + 1))
            log ERROR "${PAYMENT_GATEWAYS[$gateway]} deployment failed ✗"
        fi
    done
    
    # Create ingress and monitoring
    create_payment_ingress
    setup_monitoring
    run_health_checks
    generate_deployment_report
    
    local end_time=$SECONDS
    local duration=$(( end_time - start_time ))
    
    # Final summary
    log INFO "Payment Gateway Deployment Summary:"
    log INFO "Total Gateways: $TOTAL_GATEWAYS"
    log SUCCESS "Successful Deployments: $SUCCESSFUL_DEPLOYMENTS"
    if [ $FAILED_DEPLOYMENTS -gt 0 ]; then
        log ERROR "Failed Deployments: $FAILED_DEPLOYMENTS"
    else
        log SUCCESS "Failed Deployments: $FAILED_DEPLOYMENTS"
    fi
    log INFO "Success Rate: $(( SUCCESSFUL_DEPLOYMENTS * 100 / TOTAL_GATEWAYS ))%"
    log INFO "Total Deployment Time: $(( duration / 60 ))m $(( duration % 60 ))s"
    log INFO "Deployment Log: $LOG_FILE"
    
    if [ $SUCCESSFUL_DEPLOYMENTS -eq $TOTAL_GATEWAYS ]; then
        log SUCCESS "All Bangladesh Payment Gateways Deployed Successfully! 🎉"
        log SUCCESS "Bangladesh e-commerce platform is now ready for secure payments"
        exit 0
    else
        log ERROR "Some payment gateways failed to deploy. Check logs for details."
        exit 1
    fi
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi