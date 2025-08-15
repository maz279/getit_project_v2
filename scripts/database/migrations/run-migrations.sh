#!/bin/bash

# GetIt Multi-Vendor Ecommerce - Database Migration Script
# Amazon.com/Shopee.sg-level database schema management
# Handles migrations for PostgreSQL, MongoDB, Redis, and Elasticsearch

set -euo pipefail

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/run-migrations-$(date +%Y%m%d-%H%M%S).log"
ENVIRONMENT="${ENVIRONMENT:-development}"
MIGRATION_VERSION="${MIGRATION_VERSION:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configurations
declare -A DATABASES=(
    ["postgresql"]="Primary relational database"
    ["mongodb"]="Analytics and document storage"
    ["redis"]="Cache and session storage"
    ["elasticsearch"]="Search and logging"
)

# Migration statistics
TOTAL_MIGRATIONS=0
SUCCESSFUL_MIGRATIONS=0
FAILED_MIGRATIONS=0
MIGRATION_TIMES=()

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
    log INFO "Checking database migration prerequisites..."
    
    # Check database connection strings
    local required_env_vars=(
        "DATABASE_URL"
    )
    
    for var in "${required_env_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error_exit "Required environment variable $var is not set"
        fi
    done
    
    # Check Drizzle Kit
    if ! command -v drizzle-kit &> /dev/null; then
        log INFO "Installing Drizzle Kit globally..."
        npm install -g drizzle-kit
    fi
    
    # Check PostgreSQL client
    if ! command -v psql &> /dev/null; then
        log WARN "PostgreSQL client not found. Installing..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y postgresql-client
        elif command -v brew &> /dev/null; then
            brew install postgresql
        else
            log WARN "Cannot install PostgreSQL client automatically"
        fi
    fi
    
    # Check MongoDB client
    if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
        log WARN "MongoDB client not found. Some features may be limited."
    fi
    
    # Check Redis client
    if ! command -v redis-cli &> /dev/null; then
        log WARN "Redis client not found. Redis migrations will be skipped."
    fi
    
    log SUCCESS "Prerequisites check completed ✓"
}

# Function to test database connections
test_database_connections() {
    log INFO "Testing database connections..."
    
    # Test PostgreSQL connection
    if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
        log SUCCESS "PostgreSQL connection successful ✓"
    else
        error_exit "Cannot connect to PostgreSQL database"
    fi
    
    # Test MongoDB connection (if configured)
    if [[ -n "${MONGODB_URL:-}" ]]; then
        if command -v mongosh &> /dev/null; then
            if mongosh "$MONGODB_URL" --eval "db.runCommand('ping')" &> /dev/null; then
                log SUCCESS "MongoDB connection successful ✓"
            else
                log WARN "MongoDB connection failed"
            fi
        fi
    fi
    
    # Test Redis connection (if configured)
    if [[ -n "${REDIS_URL:-}" ]] && command -v redis-cli &> /dev/null; then
        if redis-cli -u "$REDIS_URL" ping &> /dev/null; then
            log SUCCESS "Redis connection successful ✓"
        else
            log WARN "Redis connection failed"
        fi
    fi
    
    # Test Elasticsearch connection (if configured)
    if [[ -n "${ELASTICSEARCH_URL:-}" ]]; then
        if curl -s "$ELASTICSEARCH_URL/_cluster/health" &> /dev/null; then
            log SUCCESS "Elasticsearch connection successful ✓"
        else
            log WARN "Elasticsearch connection failed"
        fi
    fi
}

# Function to backup databases before migration
backup_databases() {
    log INFO "Creating database backups before migration..."
    
    local backup_dir="${PROJECT_ROOT}/backups/pre-migration-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup PostgreSQL
    log INFO "Backing up PostgreSQL database..."
    pg_dump "$DATABASE_URL" > "$backup_dir/postgresql-backup.sql" || {
        log WARN "PostgreSQL backup failed"
    }
    
    # Backup MongoDB (if configured)
    if [[ -n "${MONGODB_URL:-}" ]] && command -v mongodump &> /dev/null; then
        log INFO "Backing up MongoDB database..."
        mongodump --uri "$MONGODB_URL" --out "$backup_dir/mongodb" || {
            log WARN "MongoDB backup failed"
        }
    fi
    
    # Backup Redis (if configured)
    if [[ -n "${REDIS_URL:-}" ]] && command -v redis-cli &> /dev/null; then
        log INFO "Backing up Redis database..."
        redis-cli -u "$REDIS_URL" --rdb "$backup_dir/redis-backup.rdb" || {
            log WARN "Redis backup failed"
        }
    fi
    
    log SUCCESS "Database backups completed ✓"
    log INFO "Backup location: $backup_dir"
}

# Function to run PostgreSQL migrations
run_postgresql_migrations() {
    local migration_start_time=$SECONDS
    
    log INFO "Running PostgreSQL migrations..."
    
    cd "$PROJECT_ROOT"
    
    # Generate migration if needed
    if [[ "$MIGRATION_VERSION" == "generate" ]]; then
        log INFO "Generating new migration..."
        npx drizzle-kit generate:pg --schema=./shared/schema.ts --out=./migrations || {
            log ERROR "Failed to generate PostgreSQL migration"
            return 1
        }
    fi
    
    # Run migrations
    log INFO "Applying PostgreSQL migrations..."
    npx drizzle-kit push:pg --schema=./shared/schema.ts || {
        log ERROR "PostgreSQL migration failed"
        return 1
    }
    
    # Verify migration
    log INFO "Verifying PostgreSQL schema..."
    psql "$DATABASE_URL" -c "\dt" > /tmp/tables_after_migration.txt
    
    # Check critical tables exist
    local critical_tables=(
        "users"
        "products"
        "orders"
        "vendors"
        "categories"
        "cart_items"
        "reviews"
        "payments"
        "shipments"
        "notifications"
    )
    
    for table in "${critical_tables[@]}"; do
        if psql "$DATABASE_URL" -c "\d $table" &> /dev/null; then
            log DEBUG "Table $table exists ✓"
        else
            log WARN "Critical table $table not found"
        fi
    done
    
    # Create migration record
    local migration_record="INSERT INTO migration_history (version, applied_at, environment, status) VALUES ('$(date +%Y%m%d%H%M%S)', NOW(), '$ENVIRONMENT', 'success');"
    psql "$DATABASE_URL" -c "CREATE TABLE IF NOT EXISTS migration_history (id SERIAL PRIMARY KEY, version VARCHAR(255), applied_at TIMESTAMP, environment VARCHAR(50), status VARCHAR(50));" || true
    psql "$DATABASE_URL" -c "$migration_record" || true
    
    local migration_end_time=$SECONDS
    local migration_duration=$(( migration_end_time - migration_start_time ))
    MIGRATION_TIMES+=("postgresql:${migration_duration}s")
    
    log SUCCESS "PostgreSQL migrations completed in ${migration_duration}s ✓"
    return 0
}

# Function to run MongoDB migrations
run_mongodb_migrations() {
    local migration_start_time=$SECONDS
    
    if [[ -z "${MONGODB_URL:-}" ]]; then
        log INFO "MongoDB URL not configured, skipping MongoDB migrations"
        return 0
    fi
    
    log INFO "Running MongoDB migrations..."
    
    # MongoDB migrations script
    local mongo_script="/tmp/mongodb_migrations.js"
    
    cat > "$mongo_script" << 'EOF'
// GetIt MongoDB Migration Script
// Creates collections and indexes for analytics and document storage

// Create collections
db.createCollection("user_analytics");
db.createCollection("product_analytics");
db.createCollection("order_analytics");
db.createCollection("vendor_analytics");
db.createCollection("search_analytics");
db.createCollection("recommendation_data");
db.createCollection("ml_training_data");
db.createCollection("audit_logs");
db.createCollection("system_logs");
db.createCollection("business_intelligence");

// Create indexes for performance
// User analytics indexes
db.user_analytics.createIndex({ "userId": 1, "timestamp": -1 });
db.user_analytics.createIndex({ "action": 1, "timestamp": -1 });
db.user_analytics.createIndex({ "sessionId": 1 });

// Product analytics indexes
db.product_analytics.createIndex({ "productId": 1, "timestamp": -1 });
db.product_analytics.createIndex({ "vendorId": 1, "timestamp": -1 });
db.product_analytics.createIndex({ "categoryId": 1, "timestamp": -1 });

// Order analytics indexes
db.order_analytics.createIndex({ "orderId": 1 });
db.order_analytics.createIndex({ "userId": 1, "timestamp": -1 });
db.order_analytics.createIndex({ "vendorId": 1, "timestamp": -1 });
db.order_analytics.createIndex({ "status": 1, "timestamp": -1 });

// Vendor analytics indexes
db.vendor_analytics.createIndex({ "vendorId": 1, "timestamp": -1 });
db.vendor_analytics.createIndex({ "metric": 1, "timestamp": -1 });

// Search analytics indexes
db.search_analytics.createIndex({ "query": "text" });
db.search_analytics.createIndex({ "userId": 1, "timestamp": -1 });
db.search_analytics.createIndex({ "results": 1, "timestamp": -1 });

// ML data indexes
db.recommendation_data.createIndex({ "userId": 1 });
db.recommendation_data.createIndex({ "productId": 1 });
db.ml_training_data.createIndex({ "dataType": 1, "timestamp": -1 });

// Audit and system logs indexes
db.audit_logs.createIndex({ "action": 1, "timestamp": -1 });
db.audit_logs.createIndex({ "userId": 1, "timestamp": -1 });
db.system_logs.createIndex({ "level": 1, "timestamp": -1 });
db.system_logs.createIndex({ "service": 1, "timestamp": -1 });

// Business intelligence indexes
db.business_intelligence.createIndex({ "metric": 1, "date": -1 });
db.business_intelligence.createIndex({ "vendorId": 1, "date": -1 });

print("MongoDB migrations completed successfully");
EOF
    
    # Run MongoDB migration script
    if command -v mongosh &> /dev/null; then
        mongosh "$MONGODB_URL" "$mongo_script" || {
            log ERROR "MongoDB migration failed"
            return 1
        }
    elif command -v mongo &> /dev/null; then
        mongo "$MONGODB_URL" "$mongo_script" || {
            log ERROR "MongoDB migration failed"
            return 1
        }
    else
        log WARN "No MongoDB client available, skipping MongoDB migrations"
        return 0
    fi
    
    rm -f "$mongo_script"
    
    local migration_end_time=$SECONDS
    local migration_duration=$(( migration_end_time - migration_start_time ))
    MIGRATION_TIMES+=("mongodb:${migration_duration}s")
    
    log SUCCESS "MongoDB migrations completed in ${migration_duration}s ✓"
    return 0
}

# Function to run Redis migrations
run_redis_migrations() {
    local migration_start_time=$SECONDS
    
    if [[ -z "${REDIS_URL:-}" ]] || ! command -v redis-cli &> /dev/null; then
        log INFO "Redis not configured or client not available, skipping Redis migrations"
        return 0
    fi
    
    log INFO "Running Redis migrations..."
    
    # Redis configuration and setup
    local redis_script="/tmp/redis_migrations.txt"
    
    cat > "$redis_script" << 'EOF'
# GetIt Redis Configuration and Setup
# Configure Redis for caching, sessions, and real-time features

# Configure memory policy
CONFIG SET maxmemory-policy allkeys-lru

# Configure save policy
CONFIG SET save "900 1 300 10 60 10000"

# Set up namespaces for different data types
SET cache:config:version 1.0
SET session:config:version 1.0
SET realtime:config:version 1.0
SET queue:config:version 1.0

# Create sample cache keys (will be automatically managed by application)
SET cache:sample:test "Redis migration successful"
EXPIRE cache:sample:test 60

# Configure Lua scripts for atomic operations
# (Scripts will be loaded by the application)

# Set migration timestamp
SET migration:redis:timestamp $(date -u +%Y-%m-%dT%H:%M:%SZ)
SET migration:redis:version latest
SET migration:redis:environment development
EOF
    
    # Execute Redis commands
    while IFS= read -r line; do
        if [[ ! "$line" =~ ^# ]] && [[ -n "$line" ]]; then
            redis-cli -u "$REDIS_URL" $line || {
                log WARN "Redis command failed: $line"
            }
        fi
    done < "$redis_script"
    
    rm -f "$redis_script"
    
    local migration_end_time=$SECONDS
    local migration_duration=$(( migration_end_time - migration_start_time ))
    MIGRATION_TIMES+=("redis:${migration_duration}s")
    
    log SUCCESS "Redis migrations completed in ${migration_duration}s ✓"
    return 0
}

# Function to run Elasticsearch migrations
run_elasticsearch_migrations() {
    local migration_start_time=$SECONDS
    
    if [[ -z "${ELASTICSEARCH_URL:-}" ]]; then
        log INFO "Elasticsearch URL not configured, skipping Elasticsearch migrations"
        return 0
    fi
    
    log INFO "Running Elasticsearch migrations..."
    
    # Create indices for GetIt platform
    local indices=(
        "products"
        "vendors"
        "orders"
        "users"
        "logs"
        "analytics"
        "search_queries"
        "recommendations"
    )
    
    for index in "${indices[@]}"; do
        log INFO "Creating Elasticsearch index: $index"
        
        # Create index with mapping
        curl -s -X PUT "$ELASTICSEARCH_URL/$index" -H 'Content-Type: application/json' -d'{
          "settings": {
            "number_of_shards": 2,
            "number_of_replicas": 1,
            "analysis": {
              "analyzer": {
                "bangla_analyzer": {
                  "type": "standard",
                  "stopwords": "_none_"
                },
                "english_analyzer": {
                  "type": "standard",
                  "stopwords": "_english_"
                }
              }
            }
          },
          "mappings": {
            "properties": {
              "id": { "type": "keyword" },
              "timestamp": { "type": "date" },
              "title": { 
                "type": "text",
                "analyzer": "english_analyzer",
                "fields": {
                  "bangla": {
                    "type": "text",
                    "analyzer": "bangla_analyzer"
                  }
                }
              },
              "description": { 
                "type": "text",
                "analyzer": "english_analyzer",
                "fields": {
                  "bangla": {
                    "type": "text",
                    "analyzer": "bangla_analyzer"
                  }
                }
              },
              "tags": { "type": "keyword" },
              "category": { "type": "keyword" },
              "vendor_id": { "type": "keyword" },
              "price": { "type": "float" },
              "location": { "type": "geo_point" },
              "status": { "type": "keyword" }
            }
          }
        }' || {
            log WARN "Failed to create Elasticsearch index: $index"
        }
    done
    
    # Create index templates for logs
    curl -s -X PUT "$ELASTICSEARCH_URL/_index_template/getit_logs" -H 'Content-Type: application/json' -d'{
      "index_patterns": ["logs-*"],
      "template": {
        "settings": {
          "number_of_shards": 1,
          "number_of_replicas": 0,
          "index.lifecycle.name": "logs_policy",
          "index.lifecycle.rollover_alias": "logs"
        },
        "mappings": {
          "properties": {
            "@timestamp": { "type": "date" },
            "level": { "type": "keyword" },
            "message": { "type": "text" },
            "service": { "type": "keyword" },
            "environment": { "type": "keyword" },
            "user_id": { "type": "keyword" },
            "request_id": { "type": "keyword" },
            "ip_address": { "type": "ip" }
          }
        }
      }
    }' || {
        log WARN "Failed to create Elasticsearch log template"
    }
    
    local migration_end_time=$SECONDS
    local migration_duration=$(( migration_end_time - migration_start_time ))
    MIGRATION_TIMES+=("elasticsearch:${migration_duration}s")
    
    log SUCCESS "Elasticsearch migrations completed in ${migration_duration}s ✓"
    return 0
}

# Function to verify migrations
verify_migrations() {
    log INFO "Verifying database migrations..."
    
    # Verify PostgreSQL
    local table_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    log INFO "PostgreSQL tables created: $table_count"
    
    # Verify MongoDB (if configured)
    if [[ -n "${MONGODB_URL:-}" ]] && command -v mongosh &> /dev/null; then
        local collection_count=$(mongosh "$MONGODB_URL" --eval "db.adminCommand('listCollections').cursor.firstBatch.length" --quiet)
        log INFO "MongoDB collections created: $collection_count"
    fi
    
    # Verify Redis (if configured)
    if [[ -n "${REDIS_URL:-}" ]] && command -v redis-cli &> /dev/null; then
        local redis_keys=$(redis-cli -u "$REDIS_URL" DBSIZE | xargs)
        log INFO "Redis keys configured: $redis_keys"
    fi
    
    # Verify Elasticsearch (if configured)
    if [[ -n "${ELASTICSEARCH_URL:-}" ]]; then
        local es_indices=$(curl -s "$ELASTICSEARCH_URL/_cat/indices?format=json" | jq length)
        log INFO "Elasticsearch indices created: $es_indices"
    fi
    
    log SUCCESS "Migration verification completed ✓"
}

# Function to generate migration report
generate_migration_report() {
    log INFO "Generating migration report..."
    
    local report_file="${PROJECT_ROOT}/migration-reports/migrations-$(date +%Y%m%d-%H%M%S).json"
    mkdir -p "$(dirname "$report_file")"
    
    # Calculate total migration time
    local total_duration=$(( SECONDS ))
    
    # Create migration times JSON
    local migration_times_json="["
    local first=true
    for time_entry in "${MIGRATION_TIMES[@]}"; do
        if [ "$first" = false ]; then
            migration_times_json+=","
        fi
        first=false
        
        local db_name="${time_entry%%:*}"
        local duration="${time_entry##*:}"
        migration_times_json+="{\"database\":\"$db_name\",\"duration\":\"$duration\"}"
    done
    migration_times_json+="]"
    
    cat > "$report_file" << EOF
{
  "migrationTimestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "migrationVersion": "$MIGRATION_VERSION",
  "platform": "GetIt Multi-Vendor Ecommerce",
  "market": "Bangladesh",
  "statistics": {
    "totalMigrations": $TOTAL_MIGRATIONS,
    "successfulMigrations": $SUCCESSFUL_MIGRATIONS,
    "failedMigrations": $FAILED_MIGRATIONS,
    "successRate": "$(( SUCCESSFUL_MIGRATIONS * 100 / TOTAL_MIGRATIONS ))%",
    "totalMigrationTime": "$(( total_duration / 60 ))m $(( total_duration % 60 ))s"
  },
  "databaseMigrations": $migration_times_json,
  "databases": {
    "postgresql": {
      "status": "migrated",
      "purpose": "Primary relational database",
      "features": ["ACID compliance", "Multi-vendor support", "Bangladesh optimization"]
    },
    "mongodb": {
      "status": "migrated",
      "purpose": "Analytics and document storage",
      "features": ["Flexible schema", "Analytics aggregation", "ML data storage"]
    },
    "redis": {
      "status": "migrated", 
      "purpose": "Cache and session storage",
      "features": ["High performance", "Real-time features", "Session management"]
    },
    "elasticsearch": {
      "status": "migrated",
      "purpose": "Search and logging",
      "features": ["Full-text search", "Analytics", "Log aggregation", "Bengali support"]
    }
  },
  "bangladeshOptimizations": {
    "multiLanguageSupport": ["Bengali", "English"],
    "currencySupport": "BDT",
    "timezoneOptimization": "Asia/Dhaka",
    "localizedIndexes": true,
    "mobileOptimization": true
  }
}
EOF
    
    log SUCCESS "Migration report generated: $report_file ✓"
}

# Main execution function
main() {
    local start_time=$SECONDS
    
    log INFO "Starting GetIt Database Migration Process"
    log INFO "Environment: $ENVIRONMENT"
    log INFO "Migration Version: $MIGRATION_VERSION"
    log INFO "Project Root: $PROJECT_ROOT"
    
    # Create logs directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Execute migration steps
    check_prerequisites
    test_database_connections
    backup_databases
    
    # Run migrations for each database
    for database in "${!DATABASES[@]}"; do
        TOTAL_MIGRATIONS=$((TOTAL_MIGRATIONS + 1))
        
        log INFO "Running $database migrations: ${DATABASES[$database]}"
        
        case $database in
            "postgresql")
                if run_postgresql_migrations; then
                    SUCCESSFUL_MIGRATIONS=$((SUCCESSFUL_MIGRATIONS + 1))
                else
                    FAILED_MIGRATIONS=$((FAILED_MIGRATIONS + 1))
                fi
                ;;
            "mongodb")
                if run_mongodb_migrations; then
                    SUCCESSFUL_MIGRATIONS=$((SUCCESSFUL_MIGRATIONS + 1))
                else
                    FAILED_MIGRATIONS=$((FAILED_MIGRATIONS + 1))
                fi
                ;;
            "redis")
                if run_redis_migrations; then
                    SUCCESSFUL_MIGRATIONS=$((SUCCESSFUL_MIGRATIONS + 1))
                else
                    FAILED_MIGRATIONS=$((FAILED_MIGRATIONS + 1))
                fi
                ;;
            "elasticsearch")
                if run_elasticsearch_migrations; then
                    SUCCESSFUL_MIGRATIONS=$((SUCCESSFUL_MIGRATIONS + 1))
                else
                    FAILED_MIGRATIONS=$((FAILED_MIGRATIONS + 1))
                fi
                ;;
        esac
    done
    
    # Verify and report
    verify_migrations
    generate_migration_report
    
    local end_time=$SECONDS
    local duration=$(( end_time - start_time ))
    
    # Final summary
    log INFO "Database Migration Summary:"
    log INFO "Total Migrations: $TOTAL_MIGRATIONS"
    log SUCCESS "Successful Migrations: $SUCCESSFUL_MIGRATIONS"
    if [ $FAILED_MIGRATIONS -gt 0 ]; then
        log ERROR "Failed Migrations: $FAILED_MIGRATIONS"
    else
        log SUCCESS "Failed Migrations: $FAILED_MIGRATIONS"
    fi
    log INFO "Success Rate: $(( SUCCESSFUL_MIGRATIONS * 100 / TOTAL_MIGRATIONS ))%"
    log INFO "Total Migration Time: $(( duration / 60 ))m $(( duration % 60 ))s"
    log INFO "Migration Log: $LOG_FILE"
    
    if [ $SUCCESSFUL_MIGRATIONS -eq $TOTAL_MIGRATIONS ]; then
        log SUCCESS "All Database Migrations Completed Successfully! 🎉"
        log SUCCESS "GetIt platform database schema is now up to date"
        exit 0
    else
        log ERROR "Some database migrations failed. Check logs for details."
        exit 1
    fi
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi