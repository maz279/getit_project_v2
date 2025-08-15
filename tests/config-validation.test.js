// Configuration Validation Test Suite
// Tests to verify all configurations are properly structured and loadable

const fs = require('fs');
const path = require('path');

describe('Configuration Validation Tests', () => {
  const configBasePath = path.join(__dirname, '../config');

  // Test helper function to check if config file exists and is valid
  const validateConfigFile = (filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Configuration file does not exist: ${filePath}`);
      }

      const config = require(filePath);
      
      if (!config || typeof config !== 'object') {
        throw new Error(`Configuration file is not a valid object: ${filePath}`);
      }

      return config;
    } catch (error) {
      throw new Error(`Failed to load configuration from ${filePath}: ${error.message}`);
    }
  };

  // Test Database Configurations
  describe('Database Configurations', () => {
    test('PostgreSQL production config should load successfully', () => {
      const configPath = path.join(configBasePath, 'databases/postgresql/production.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.database).toBeDefined();
      expect(config.database.name).toBe('GetIt PostgreSQL Production');
      expect(config.server).toBeDefined();
      expect(config.replication).toBeDefined();
    });

    test('Redis production config should load successfully', () => {
      const configPath = path.join(configBasePath, 'databases/redis/production.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.redis).toBeDefined();
      expect(config.redis.name).toBe('GetIt Redis Production Cluster');
      expect(config.cluster).toBeDefined();
      expect(config.sentinel).toBeDefined();
    });

    test('MongoDB production config should load successfully', () => {
      const configPath = path.join(configBasePath, 'databases/mongodb/production.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.mongodb).toBeDefined();
      expect(config.mongodb.name).toBe('GetIt MongoDB Production');
      expect(config.replicaSet).toBeDefined();
      expect(config.sharding).toBeDefined();
    });

    test('Elasticsearch production config should load successfully', () => {
      const configPath = path.join(configBasePath, 'databases/elasticsearch/production.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.elasticsearch).toBeDefined();
      expect(config.elasticsearch.name).toBe('GetIt Elasticsearch Production');
      expect(config.cluster).toBeDefined();
      expect(config.indices).toBeDefined();
    });
  });

  // Test Payment Gateway Configurations
  describe('Payment Gateway Configurations', () => {
    test('bKash config should load successfully', () => {
      const configPath = path.join(configBasePath, 'payment-gateways/bangladesh-local/bkash.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.gateway).toBeDefined();
      expect(config.gateway.name).toBe('bKash Payment Gateway');
      expect(config.api).toBeDefined();
      expect(config.sandbox).toBeDefined();
      expect(config.production).toBeDefined();
    });

    test('Nagad config should load successfully', () => {
      const configPath = path.join(configBasePath, 'payment-gateways/bangladesh-local/nagad.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.gateway).toBeDefined();
      expect(config.gateway.name).toBe('Nagad Payment Gateway');
      expect(config.api).toBeDefined();
      expect(config.encryption).toBeDefined();
    });

    test('Rocket config should load successfully', () => {
      const configPath = path.join(configBasePath, 'payment-gateways/bangladesh-local/rocket.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.gateway).toBeDefined();
      expect(config.gateway.name).toBe('Rocket Payment Gateway');
      expect(config.api).toBeDefined();
      expect(config.authentication).toBeDefined();
    });
  });

  // Test Shipping Partner Configurations
  describe('Shipping Partner Configurations', () => {
    test('Pathao config should load successfully', () => {
      const configPath = path.join(configBasePath, 'shipping-logistics/bangladesh-partners/pathao.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.service).toBeDefined();
      expect(config.service.name).toBe('Pathao');
      expect(config.api).toBeDefined();
      expect(config.services).toBeDefined();
      expect(config.coverage).toBeDefined();
    });

    test('Paperfly config should load successfully', () => {
      const configPath = path.join(configBasePath, 'shipping-logistics/bangladesh-partners/paperfly.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.service).toBeDefined();
      expect(config.service.name).toBe('Paperfly');
      expect(config.api).toBeDefined();
      expect(config.services).toBeDefined();
    });

    test('Sundarban config should load successfully', () => {
      const configPath = path.join(configBasePath, 'shipping-logistics/bangladesh-partners/sundarban.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.service).toBeDefined();
      expect(config.service.name).toBe('Sundarban Courier');
      expect(config.api).toBeDefined();
      expect(config.coverage).toBeDefined();
    });

    test('RedX config should load successfully', () => {
      const configPath = path.join(configBasePath, 'shipping-logistics/bangladesh-partners/redx.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.service).toBeDefined();
      expect(config.service.name).toBe('RedX');
      expect(config.api).toBeDefined();
      expect(config.services).toBeDefined();
      expect(config.coverage).toBeDefined();
    });

    test('eCourier config should load successfully', () => {
      const configPath = path.join(configBasePath, 'shipping-logistics/bangladesh-partners/ecourier.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.service).toBeDefined();
      expect(config.service.name).toBe('eCourier');
      expect(config.api).toBeDefined();
      expect(config.services).toBeDefined();
    });
  });

  // Test Communication Service Configurations
  describe('Communication Service Configurations', () => {
    test('Email services config should load successfully', () => {
      const configPath = path.join(configBasePath, 'communication/email-services/production.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.emailService).toBeDefined();
      expect(config.emailService.name).toBe('GetIt Email Infrastructure');
      expect(config.providers).toBeDefined();
      expect(config.providers.sendgrid).toBeDefined();
      expect(config.providers.awsSes).toBeDefined();
    });

    test('SMS providers config should load successfully', () => {
      const configPath = path.join(configBasePath, 'communication/sms-providers/production.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.smsService).toBeDefined();
      expect(config.smsService.name).toBe('GetIt SMS Infrastructure');
      expect(config.providers).toBeDefined();
      expect(config.providers.twilio).toBeDefined();
      expect(config.providers.sslWireless).toBeDefined();
      expect(config.bangladeshSpecific).toBeDefined();
    });

    test('Push notifications config should load successfully', () => {
      const configPath = path.join(configBasePath, 'communication/push-notifications/production.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.pushService).toBeDefined();
      expect(config.pushService.name).toBe('GetIt Push Notification System');
      expect(config.providers).toBeDefined();
      expect(config.providers.fcm).toBeDefined();
      expect(config.bangladeshSpecific).toBeDefined();
    });
  });

  // Test API Gateway Configuration
  describe('API Gateway Configuration', () => {
    test('API Gateway production config should load successfully', () => {
      const configPath = path.join(configBasePath, 'microservices/api-gateway/production.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.gateway).toBeDefined();
      expect(config.gateway.name).toBe('GetIt API Gateway');
      expect(config.server).toBeDefined();
      expect(config.serviceDiscovery).toBeDefined();
      expect(config.routing).toBeDefined();
      expect(config.authentication).toBeDefined();
      expect(config.bangladeshConfig).toBeDefined();
    });
  });

  // Test Security Configuration
  describe('Security Configuration', () => {
    test('Authentication production config should load successfully', () => {
      const configPath = path.join(configBasePath, 'security/authentication/production.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.authentication).toBeDefined();
      expect(config.authentication.name).toBe('GetIt Authentication System');
      expect(config.jwt).toBeDefined();
      expect(config.mfa).toBeDefined();
      expect(config.passwordSecurity).toBeDefined();
      expect(config.bangladeshSpecific).toBeDefined();
    });
  });

  // Test Monitoring Configuration
  describe('Monitoring Configuration', () => {
    test('Metrics collection config should load successfully', () => {
      const configPath = path.join(configBasePath, 'monitoring-observability/metrics-collection/production.config.js');
      const config = validateConfigFile(configPath);
      
      expect(config.monitoring).toBeDefined();
      expect(config.monitoring.name).toBe('GetIt Monitoring Infrastructure');
      expect(config.metricsStack).toBeDefined();
      expect(config.metricsStack.prometheus).toBeDefined();
      expect(config.metricsStack.grafana).toBeDefined();
      expect(config.businessMetrics).toBeDefined();
    });
  });
});

// Export for potential external use
module.exports = {
  validateConfigFile
};