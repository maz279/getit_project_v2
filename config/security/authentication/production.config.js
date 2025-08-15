// Authentication Production Configuration
// Enterprise-level authentication system for GetIt platform

module.exports = {
  // Authentication System Information
  authentication: {
    name: 'GetIt Authentication System',
    version: '3.0',
    type: 'multi_factor_authentication',
    environment: 'production',
    enabled: true,
    description: 'Comprehensive authentication system with MFA, SSO, and advanced security features'
  },

  // JWT Configuration
  jwt: {
    enabled: true,
    
    // Token Configuration
    tokens: {
      access: {
        secret: process.env.JWT_ACCESS_SECRET,
        algorithm: 'RS256',
        expiresIn: '15m',
        issuer: 'getit.com.bd',
        audience: 'getit-platform',
        clockTolerance: 30, // seconds
        notBefore: '0s'
      },
      
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        algorithm: 'RS256',
        expiresIn: '7d',
        issuer: 'getit.com.bd',
        audience: 'getit-platform',
        family: true, // Refresh token family tracking
        rotationPolicy: 'automatic'
      },
      
      resetPassword: {
        secret: process.env.JWT_RESET_SECRET,
        algorithm: 'HS256',
        expiresIn: '1h',
        singleUse: true
      },
      
      emailVerification: {
        secret: process.env.JWT_EMAIL_SECRET,
        algorithm: 'HS256',
        expiresIn: '24h',
        singleUse: true
      }
    },

    // Key Management
    keyManagement: {
      keyRotation: {
        enabled: true,
        interval: '30d', // 30 days
        gracePeriod: '7d', // 7 days overlap
        autoRotate: true
      },
      
      keyStorage: {
        type: 'vault', // vault, kms, or file
        vault: {
          endpoint: process.env.VAULT_ENDPOINT,
          token: process.env.VAULT_TOKEN,
          path: 'secret/jwt-keys'
        }
      }
    },

    // Token Validation
    validation: {
      strictValidation: true,
      blacklistEnabled: true,
      blacklistStorage: 'redis',
      fingerprinting: true,
      deviceTracking: true,
      geoLocationValidation: true,
      suspiciousActivityDetection: true
    }
  },

  // Multi-Factor Authentication
  mfa: {
    enabled: true,
    
    // MFA Methods
    methods: {
      totp: {
        enabled: true,
        issuer: 'GetIt Bangladesh',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        window: 1,
        qrCodeEnabled: true
      },
      
      sms: {
        enabled: true,
        provider: 'twilio',
        from: process.env.SMS_FROM_NUMBER,
        template: 'Your GetIt verification code is: {code}',
        expiresIn: 300, // 5 minutes
        maxAttempts: 3,
        cooldownPeriod: 60 // 1 minute
      },
      
      email: {
        enabled: true,
        from: 'security@getit.com.bd',
        template: 'email_mfa_code',
        expiresIn: 600, // 10 minutes
        maxAttempts: 3
      },
      
      push: {
        enabled: true,
        provider: 'firebase',
        expiresIn: 300, // 5 minutes
        maxAttempts: 3
      },
      
      backup_codes: {
        enabled: true,
        length: 8,
        count: 10,
        oneTimeUse: true,
        regenerateThreshold: 3
      }
    },

    // MFA Policies
    policies: {
      admin: {
        required: true,
        methods: ['totp', 'sms'],
        frequency: 'always'
      },
      
      vendor: {
        required: true,
        methods: ['totp', 'sms', 'email'],
        frequency: 'sensitive_operations'
      },
      
      customer: {
        required: false,
        methods: ['sms', 'email'],
        frequency: 'opt_in',
        triggers: ['high_value_transaction', 'payment_method_change']
      },
      
      api_access: {
        required: true,
        methods: ['totp'],
        frequency: 'token_renewal'
      }
    },

    // Trusted Devices
    trustedDevices: {
      enabled: true,
      maxDevices: 5,
      trustDuration: '30d',
      requireReauth: '90d',
      deviceFingerprinting: true,
      geolocationTracking: true
    }
  },

  // Password Security
  passwordSecurity: {
    enabled: true,
    
    // Password Policy
    policy: {
      minLength: 12,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      forbidCommonPasswords: true,
      forbidPersonalInfo: true,
      forbidKeyboardPatterns: true,
      historyCount: 12, // Remember last 12 passwords
      maxAge: 90 // days
    },

    // Password Hashing
    hashing: {
      algorithm: 'argon2id',
      memory: 65536, // 64MB
      iterations: 3,
      parallelism: 4,
      saltLength: 32,
      hashLength: 32
    },

    // Password Strength Validation
    strengthValidation: {
      enabled: true,
      minScore: 3, // Out of 4
      realTimeValidation: true,
      showStrengthMeter: true,
      suggestImprovements: true
    },

    // Breach Detection
    breachDetection: {
      enabled: true,
      provider: 'haveibeenpwned',
      checkOnRegistration: true,
      checkOnLogin: true,
      checkOnPasswordChange: true,
      forceChangeOnBreach: true
    }
  },

  // Session Management
  sessionManagement: {
    enabled: true,
    
    // Session Configuration
    sessions: {
      storage: 'redis',
      keyPrefix: 'session:',
      
      // Session Types
      web: {
        maxAge: 3600000, // 1 hour
        rolling: true,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        domain: '.getit.com.bd'
      },
      
      mobile: {
        maxAge: 2592000000, // 30 days
        rolling: true,
        httpOnly: false,
        secure: true,
        sameSite: 'none'
      },
      
      api: {
        maxAge: 3600000, // 1 hour
        rolling: false,
        stateless: true
      },
      
      admin: {
        maxAge: 1800000, // 30 minutes
        rolling: true,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        requireMFA: true
      }
    },

    // Concurrent Sessions
    concurrentSessions: {
      enabled: true,
      maxSessions: {
        customer: 5,
        vendor: 3,
        admin: 2
      },
      strategy: 'invalidate_oldest',
      notifyOnNewSession: true
    },

    // Session Security
    security: {
      sessionFixationProtection: true,
      csrfProtection: true,
      sessionHijackingDetection: true,
      ipBindingEnabled: true,
      userAgentValidation: true,
      geoLocationValidation: true,
      deviceFingerprintValidation: true
    }
  },

  // Single Sign-On (SSO)
  sso: {
    enabled: true,
    
    // SAML Configuration
    saml: {
      enabled: false, // For future enterprise clients
      entityId: 'https://getit.com.bd/saml',
      assertionConsumerServiceUrl: 'https://getit.com.bd/auth/saml/callback',
      singleLogoutServiceUrl: 'https://getit.com.bd/auth/saml/logout'
    },

    // OAuth2/OpenID Connect
    oauth2: {
      enabled: true,
      
      providers: [
        {
          name: 'google',
          clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
          clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
          scope: ['openid', 'profile', 'email'],
          authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo'
        },
        
        {
          name: 'facebook',
          clientId: process.env.FACEBOOK_OAUTH_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_OAUTH_CLIENT_SECRET,
          scope: ['public_profile', 'email'],
          authorizeUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
          tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
          userInfoUrl: 'https://graph.facebook.com/me'
        },
        
        {
          name: 'linkedin',
          clientId: process.env.LINKEDIN_OAUTH_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_OAUTH_CLIENT_SECRET,
          scope: ['openid', 'profile', 'email'],
          authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization',
          tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
          userInfoUrl: 'https://api.linkedin.com/v2/userinfo'
        }
      ],

      // Auto-provisioning
      autoProvisioning: {
        enabled: true,
        createUser: true,
        updateUser: true,
        defaultRole: 'customer',
        emailVerificationRequired: false
      }
    }
  },

  // Account Security
  accountSecurity: {
    enabled: true,
    
    // Account Lockout
    lockout: {
      enabled: true,
      maxAttempts: 5,
      lockoutDuration: 1800, // 30 minutes
      progressiveLockout: true,
      progressiveDelays: [60, 300, 900, 1800], // 1m, 5m, 15m, 30m
      notifyOnLockout: true,
      unlockMethods: ['time', 'admin', 'password_reset']
    },

    // Suspicious Activity Detection
    suspiciousActivity: {
      enabled: true,
      
      monitors: [
        {
          name: 'unusual_login_location',
          threshold: 500, // km from last known location
          action: 'require_mfa'
        },
        {
          name: 'unusual_login_time',
          threshold: 3, // standard deviations from normal
          action: 'alert'
        },
        {
          name: 'multiple_failed_attempts',
          threshold: 3,
          window: 300, // 5 minutes
          action: 'temporary_lockout'
        },
        {
          name: 'brute_force_attack',
          threshold: 10,
          window: 600, // 10 minutes
          action: 'ip_block'
        }
      ],

      actions: {
        alert: {
          email: true,
          sms: false,
          push: true,
          adminNotification: true
        },
        
        require_mfa: {
          force: true,
          methods: ['totp', 'sms'],
          bypassTrustedDevices: false
        },
        
        temporary_lockout: {
          duration: 300, // 5 minutes
          escalation: true
        },
        
        ip_block: {
          duration: 3600, // 1 hour
          whitelist: ['admin_ips'],
          escalation: true
        }
      }
    },

    // Device Management
    deviceManagement: {
      enabled: true,
      maxDevices: 10,
      deviceRegistration: true,
      deviceNaming: true,
      lastAccessTracking: true,
      remoteWipe: true,
      deviceApproval: {
        required: false,
        adminApproval: false,
        autoApproveKnownDevices: true
      }
    }
  },

  // Risk-Based Authentication
  riskBasedAuth: {
    enabled: true,
    
    // Risk Factors
    riskFactors: [
      {
        name: 'geolocation',
        weight: 0.3,
        enabled: true
      },
      {
        name: 'device_reputation',
        weight: 0.25,
        enabled: true
      },
      {
        name: 'behavioral_analysis',
        weight: 0.2,
        enabled: true
      },
      {
        name: 'time_of_access',
        weight: 0.15,
        enabled: true
      },
      {
        name: 'network_reputation',
        weight: 0.1,
        enabled: true
      }
    ],

    // Risk Levels
    riskLevels: {
      low: {
        threshold: 0.3,
        actions: ['allow']
      },
      
      medium: {
        threshold: 0.6,
        actions: ['require_mfa', 'additional_verification']
      },
      
      high: {
        threshold: 0.8,
        actions: ['require_mfa', 'admin_approval', 'enhanced_monitoring']
      },
      
      critical: {
        threshold: 0.9,
        actions: ['block', 'admin_alert', 'security_review']
      }
    },

    // Machine Learning
    machineLearning: {
      enabled: true,
      model: 'ensemble',
      trainingSchedule: 'weekly',
      features: [
        'login_time_patterns',
        'device_fingerprints',
        'geolocation_patterns',
        'behavioral_biometrics',
        'network_patterns'
      ]
    }
  },

  // Audit & Compliance
  auditCompliance: {
    enabled: true,
    
    // Audit Logging
    auditLogging: {
      enabled: true,
      events: [
        'authentication_success',
        'authentication_failure',
        'mfa_challenge',
        'mfa_success',
        'mfa_failure',
        'password_change',
        'password_reset',
        'account_lockout',
        'account_unlock',
        'suspicious_activity',
        'admin_action',
        'privilege_escalation',
        'session_creation',
        'session_termination'
      ],
      
      retention: {
        authEvents: 2555, // 7 years
        securityEvents: 2555, // 7 years
        adminActions: 2555, // 7 years
        regularEvents: 365 // 1 year
      },
      
      storage: {
        primary: 'mongodb',
        backup: 's3',
        encryption: true,
        immutable: true
      }
    },

    // Compliance Standards
    compliance: {
      standards: [
        'PCI_DSS',
        'GDPR', // For future expansion
        'SOC2',
        'ISO27001',
        'BANGLADESH_DATA_PROTECTION'
      ],
      
      reports: {
        enabled: true,
        schedule: 'monthly',
        recipients: ['security@getit.com.bd', 'compliance@getit.com.bd'],
        format: ['pdf', 'json']
      }
    }
  },

  // Integration Configuration
  integration: {
    // Directory Services
    ldap: {
      enabled: false, // For future enterprise clients
      server: process.env.LDAP_SERVER,
      bindDN: process.env.LDAP_BIND_DN,
      bindPassword: process.env.LDAP_BIND_PASSWORD,
      baseDN: process.env.LDAP_BASE_DN,
      userSearchFilter: '(&(objectClass=user)(sAMAccountName={username}))',
      groupSearchFilter: '(&(objectClass=group)(member={userDN}))'
    },

    // External Security Services
    externalServices: {
      fraudDetection: {
        enabled: true,
        provider: 'custom',
        endpoint: process.env.FRAUD_DETECTION_ENDPOINT,
        apiKey: process.env.FRAUD_DETECTION_API_KEY
      },
      
      threatIntelligence: {
        enabled: true,
        providers: ['virustotal', 'abuseipdb'],
        apiKeys: {
          virustotal: process.env.VIRUSTOTAL_API_KEY,
          abuseipdb: process.env.ABUSEIPDB_API_KEY
        }
      }
    }
  },

  // Bangladesh Specific Configuration
  bangladeshConfig: {
    timezone: 'Asia/Dhaka',
    locale: 'bn_BD',
    
    // Local Compliance
    compliance: {
      dataProtectionAct: true,
      digitalSecurityAct: true,
      bangladeshBankRegulations: true,
      nbrCompliance: true
    },
    
    // Local Authentication Methods
    localAuth: {
      nidVerification: {
        enabled: true,
        provider: 'bangladesh_election_commission',
        apiEndpoint: process.env.NID_VERIFICATION_ENDPOINT,
        apiKey: process.env.NID_VERIFICATION_API_KEY
      },
      
      mobileVerification: {
        enabled: true,
        operators: ['grameenphone', 'robi', 'banglalink', 'teletalk', 'airtel'],
        smsGateway: 'local_provider'
      }
    },

    // Cultural Considerations
    cultural: {
      languageSupport: ['bn', 'en'],
      rtlSupport: false,
      festivalAwareness: true,
      prayerTimeConsideration: true
    }
  },

  // Environment Configuration
  environment: {
    production: true,
    securityLevel: 'high',
    encryptionRequired: true,
    auditingRequired: true,
    complianceMode: true,
    
    // Rate Limiting
    rateLimiting: {
      authentication: {
        attempts: 5,
        window: 900, // 15 minutes
        blockDuration: 1800 // 30 minutes
      },
      
      passwordReset: {
        attempts: 3,
        window: 3600, // 1 hour
        blockDuration: 3600 // 1 hour
      }
    }
  }
};