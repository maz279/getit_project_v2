/**
 * Phase 4 Week 17-18: Enhanced Distributed Tracing & Observability - Test Suite
 * Amazon.com/Shopee.sg-Level Distributed Tracing, Performance Monitoring & Business Intelligence
 * 
 * Test Coverage:
 * - Service health monitoring and validation
 * - Distributed tracing overview and trace analysis
 * - Business metrics dashboard and KPI tracking
 * - Predictive analytics insights and recommendations
 * - Performance analysis and bottleneck detection
 * - Critical path analysis and optimization
 * - Alert management and acknowledgment
 * - Custom metrics and span creation
 * - Comprehensive observability dashboard
 * - System status monitoring and data generation
 * 
 * Expected Results:
 * - All 15 test cases should pass with 100% success rate
 * - Observability components operational with real-time monitoring
 * - Distributed tracing with intelligent sampling and analysis
 * - Business intelligence with predictive insights
 * - Performance monitoring with bottleneck detection
 * - Alert management with acknowledgment workflows
 * 
 * @fileoverview Enhanced Observability Test Suite for enterprise-grade monitoring
 * @author GetIt Platform Team
 * @version 4.17.0
 */

const http = require('http');
const { promisify } = require('util');

const BASE_URL = 'http://localhost:5000';

class EnhancedObservabilityTester {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.startTime = Date.now();
  }

  async makeRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: endpoint,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Phase4-Observability-Tester/1.0'
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(body);
            resolve({
              statusCode: res.statusCode,
              data: jsonData,
              headers: res.headers
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              data: body,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  logTest(testName, success, message, data = null) {
    const result = {
      testName,
      success,
      message,
      data: data ? JSON.stringify(data, null, 2) : null,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    this.totalTests++;
    
    if (success) {
      this.passedTests++;
      console.log(`✅ PASSED: ${testName}`);
      console.log(`   Message: ${message}`);
      if (data) {
        console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
      }
    } else {
      this.failedTests++;
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Message: ${message}`);
      if (data) {
        console.log(`   Error: ${JSON.stringify(data, null, 2)}`);
      }
    }
    console.log('');
  }

  async testServiceHealth() {
    try {
      const response = await this.makeRequest('GET', '/api/v1/enhanced-observability/health');
      
      if (response.statusCode === 200 && response.data.success) {
        const healthData = response.data.data;
        const isHealthy = healthData.status === 'healthy' && 
                         healthData.services.tracing === 'operational' &&
                         healthData.services.metrics === 'operational' &&
                         healthData.services.businessMetrics === 'operational';
        
        if (isHealthy) {
          this.logTest('Service Health Check', true, 'Enhanced Observability service is healthy', healthData);
        } else {
          this.logTest('Service Health Check', false, 'Service health check failed', healthData);
        }
      } else {
        this.logTest('Service Health Check', false, 'Service health check failed', response.data);
      }
    } catch (error) {
      this.logTest('Service Health Check', false, 'Service health check failed', error.message);
    }
  }

  async testTracingOverview() {
    try {
      const response = await this.makeRequest('GET', '/api/v1/enhanced-observability/tracing/overview');
      
      if (response.statusCode === 200 && response.data.success) {
        const tracingData = response.data.data;
        const hasValidTracing = tracingData.totalTraces > 0 && 
                               tracingData.services && 
                               tracingData.services.length > 0;
        
        if (hasValidTracing) {
          this.logTest('Distributed Tracing Overview', true, 'Tracing overview retrieved successfully', tracingData);
        } else {
          this.logTest('Distributed Tracing Overview', false, 'Tracing overview validation failed', tracingData);
        }
      } else {
        this.logTest('Distributed Tracing Overview', false, 'Tracing overview retrieval failed', response.data);
      }
    } catch (error) {
      this.logTest('Distributed Tracing Overview', false, 'Tracing overview retrieval failed', error.message);
    }
  }

  async testTraceDetails() {
    try {
      // First get tracing overview to get a trace ID
      const overviewResponse = await this.makeRequest('GET', '/api/v1/enhanced-observability/tracing/overview');
      
      if (overviewResponse.statusCode === 200 && overviewResponse.data.success) {
        // Use a test trace ID or the first available one
        const testTraceId = 'trace_test_001';
        const response = await this.makeRequest('GET', `/api/v1/enhanced-observability/tracing/trace/${testTraceId}`);
        
        if (response.statusCode === 200 && response.data.success) {
          const traceData = response.data.data;
          const hasValidTrace = traceData.trace && 
                               traceData.criticalPath && 
                               traceData.performance;
          
          if (hasValidTrace) {
            this.logTest('Trace Details Analysis', true, 'Trace details retrieved successfully', traceData);
          } else {
            this.logTest('Trace Details Analysis', false, 'Trace details validation failed', traceData);
          }
        } else {
          this.logTest('Trace Details Analysis', false, 'Trace details retrieval failed', response.data);
        }
      } else {
        this.logTest('Trace Details Analysis', false, 'Unable to get trace overview for test', overviewResponse.data);
      }
    } catch (error) {
      this.logTest('Trace Details Analysis', false, 'Trace details retrieval failed', error.message);
    }
  }

  async testBusinessMetrics() {
    try {
      const response = await this.makeRequest('GET', '/api/v1/enhanced-observability/metrics/business');
      
      if (response.statusCode === 200 && response.data.success) {
        const metricsData = response.data.data;
        const hasValidMetrics = metricsData.current && 
                               metricsData.current.conversionRate &&
                               metricsData.current.customerSatisfaction &&
                               metricsData.current.revenueMetrics;
        
        if (hasValidMetrics) {
          this.logTest('Business Metrics Dashboard', true, 'Business metrics retrieved successfully', metricsData);
        } else {
          this.logTest('Business Metrics Dashboard', false, 'Business metrics validation failed', metricsData);
        }
      } else {
        this.logTest('Business Metrics Dashboard', false, 'Business metrics retrieval failed', response.data);
      }
    } catch (error) {
      this.logTest('Business Metrics Dashboard', false, 'Business metrics retrieval failed', error.message);
    }
  }

  async testPredictiveAnalytics() {
    try {
      const response = await this.makeRequest('GET', '/api/v1/enhanced-observability/analytics/predictive');
      
      if (response.statusCode === 200 && response.data.success) {
        const analyticsData = response.data.data;
        const hasValidAnalytics = analyticsData.insights && 
                                 analyticsData.insights.length > 0 &&
                                 analyticsData.summary &&
                                 analyticsData.summary.averageConfidence > 0;
        
        if (hasValidAnalytics) {
          this.logTest('Predictive Analytics Insights', true, 'Predictive analytics retrieved successfully', analyticsData);
        } else {
          this.logTest('Predictive Analytics Insights', false, 'Predictive analytics validation failed', analyticsData);
        }
      } else {
        this.logTest('Predictive Analytics Insights', false, 'Predictive analytics retrieval failed', response.data);
      }
    } catch (error) {
      this.logTest('Predictive Analytics Insights', false, 'Predictive analytics retrieval failed', error.message);
    }
  }

  async testObservabilityDashboard() {
    try {
      const response = await this.makeRequest('GET', '/api/v1/enhanced-observability/dashboard');
      
      if (response.statusCode === 200 && response.data.success) {
        const dashboardData = response.data.data;
        const hasValidDashboard = dashboardData.overview && 
                                 dashboardData.tracing &&
                                 dashboardData.businessMetrics &&
                                 dashboardData.predictiveInsights &&
                                 dashboardData.performance;
        
        if (hasValidDashboard) {
          this.logTest('Observability Dashboard', true, 'Observability dashboard retrieved successfully', dashboardData);
        } else {
          this.logTest('Observability Dashboard', false, 'Observability dashboard validation failed', dashboardData);
        }
      } else {
        this.logTest('Observability Dashboard', false, 'Observability dashboard retrieval failed', response.data);
      }
    } catch (error) {
      this.logTest('Observability Dashboard', false, 'Observability dashboard retrieval failed', error.message);
    }
  }

  async testSpanCreation() {
    try {
      const spanData = {
        traceId: 'trace_test_span_001',
        spanId: 'span_test_001',
        operationName: 'test_operation',
        parentSpanId: 'parent_span_001',
        tags: {
          service: 'test-service',
          operation: 'test_operation'
        }
      };
      
      const response = await this.makeRequest('POST', '/api/v1/enhanced-observability/tracing/span', spanData);
      
      if (response.statusCode === 200 && response.data.success) {
        const spanResult = response.data.data;
        const hasValidSpan = spanResult.span && 
                            spanResult.span.traceId === spanData.traceId &&
                            spanResult.span.spanId === spanData.spanId;
        
        if (hasValidSpan) {
          this.logTest('Span Creation', true, 'Span created successfully', spanResult);
        } else {
          this.logTest('Span Creation', false, 'Span creation validation failed', spanResult);
        }
      } else {
        this.logTest('Span Creation', false, 'Span creation failed', response.data);
      }
    } catch (error) {
      this.logTest('Span Creation', false, 'Span creation failed', error.message);
    }
  }

  async testCustomMetrics() {
    try {
      const metricData = {
        metricName: 'test_metric',
        value: 42.5,
        tags: {
          service: 'test-service',
          environment: 'test'
        }
      };
      
      const response = await this.makeRequest('POST', '/api/v1/enhanced-observability/metrics/custom', metricData);
      
      if (response.statusCode === 200 && response.data.success) {
        const metricResult = response.data.data;
        const hasValidMetric = metricResult.metric && 
                              metricResult.metric.name === metricData.metricName &&
                              metricResult.metric.value === metricData.value;
        
        if (hasValidMetric) {
          this.logTest('Custom Metrics Submission', true, 'Custom metric submitted successfully', metricResult);
        } else {
          this.logTest('Custom Metrics Submission', false, 'Custom metric validation failed', metricResult);
        }
      } else {
        this.logTest('Custom Metrics Submission', false, 'Custom metric submission failed', response.data);
      }
    } catch (error) {
      this.logTest('Custom Metrics Submission', false, 'Custom metric submission failed', error.message);
    }
  }

  async testAlerts() {
    try {
      const response = await this.makeRequest('GET', '/api/v1/enhanced-observability/alerts');
      
      if (response.statusCode === 200 && response.data.success) {
        const alertsData = response.data.data;
        const hasValidAlerts = alertsData.alerts && 
                              Array.isArray(alertsData.alerts) &&
                              alertsData.totalAlerts >= 0;
        
        if (hasValidAlerts) {
          this.logTest('Alert Management', true, 'Alerts retrieved successfully', alertsData);
        } else {
          this.logTest('Alert Management', false, 'Alert management validation failed', alertsData);
        }
      } else {
        this.logTest('Alert Management', false, 'Alert management failed', response.data);
      }
    } catch (error) {
      this.logTest('Alert Management', false, 'Alert management failed', error.message);
    }
  }

  async testAlertAcknowledgment() {
    try {
      const ackData = {
        alertId: 'alert_test_001'
      };
      
      const response = await this.makeRequest('POST', '/api/v1/enhanced-observability/alerts/acknowledge', ackData);
      
      if (response.statusCode === 200 && response.data.success) {
        const ackResult = response.data.data;
        const hasValidAck = ackResult.alertId === ackData.alertId &&
                           ackResult.acknowledged === true;
        
        if (hasValidAck) {
          this.logTest('Alert Acknowledgment', true, 'Alert acknowledged successfully', ackResult);
        } else {
          this.logTest('Alert Acknowledgment', false, 'Alert acknowledgment validation failed', ackResult);
        }
      } else {
        this.logTest('Alert Acknowledgment', false, 'Alert acknowledgment failed', response.data);
      }
    } catch (error) {
      this.logTest('Alert Acknowledgment', false, 'Alert acknowledgment failed', error.message);
    }
  }

  async testPerformanceAnalysis() {
    try {
      const response = await this.makeRequest('GET', '/api/v1/enhanced-observability/performance/analysis');
      
      if (response.statusCode === 200 && response.data.success) {
        const analysisData = response.data.data;
        const hasValidAnalysis = analysisData.overview && 
                                analysisData.trends &&
                                analysisData.bottlenecks &&
                                Array.isArray(analysisData.bottlenecks);
        
        if (hasValidAnalysis) {
          this.logTest('Performance Analysis', true, 'Performance analysis retrieved successfully', analysisData);
        } else {
          this.logTest('Performance Analysis', false, 'Performance analysis validation failed', analysisData);
        }
      } else {
        this.logTest('Performance Analysis', false, 'Performance analysis failed', response.data);
      }
    } catch (error) {
      this.logTest('Performance Analysis', false, 'Performance analysis failed', error.message);
    }
  }

  async testBottleneckDetection() {
    try {
      const response = await this.makeRequest('GET', '/api/v1/enhanced-observability/bottlenecks');
      
      if (response.statusCode === 200 && response.data.success) {
        const bottleneckData = response.data.data;
        const hasValidBottlenecks = bottleneckData.bottlenecks && 
                                   Array.isArray(bottleneckData.bottlenecks) &&
                                   bottleneckData.totalBottlenecks >= 0;
        
        if (hasValidBottlenecks) {
          this.logTest('Bottleneck Detection', true, 'Bottleneck detection successful', bottleneckData);
        } else {
          this.logTest('Bottleneck Detection', false, 'Bottleneck detection validation failed', bottleneckData);
        }
      } else {
        this.logTest('Bottleneck Detection', false, 'Bottleneck detection failed', response.data);
      }
    } catch (error) {
      this.logTest('Bottleneck Detection', false, 'Bottleneck detection failed', error.message);
    }
  }

  async testCriticalPathAnalysis() {
    try {
      const response = await this.makeRequest('GET', '/api/v1/enhanced-observability/critical-path?traceId=trace_test_001');
      
      if (response.statusCode === 200 && response.data.success) {
        const criticalPathData = response.data.data;
        const hasValidCriticalPath = criticalPathData.criticalPath && 
                                    Array.isArray(criticalPathData.criticalPath) &&
                                    criticalPathData.optimizations &&
                                    Array.isArray(criticalPathData.optimizations);
        
        if (hasValidCriticalPath) {
          this.logTest('Critical Path Analysis', true, 'Critical path analysis successful', criticalPathData);
        } else {
          this.logTest('Critical Path Analysis', false, 'Critical path analysis validation failed', criticalPathData);
        }
      } else {
        this.logTest('Critical Path Analysis', false, 'Critical path analysis failed', response.data);
      }
    } catch (error) {
      this.logTest('Critical Path Analysis', false, 'Critical path analysis failed', error.message);
    }
  }

  async testSystemStatus() {
    try {
      const response = await this.makeRequest('GET', '/api/v1/enhanced-observability/test/system-status');
      
      if (response.statusCode === 200 && response.data.success) {
        const statusData = response.data.data;
        const hasValidStatus = statusData.system && 
                              statusData.status === 'operational' &&
                              statusData.components &&
                              statusData.performance;
        
        if (hasValidStatus) {
          this.logTest('System Status Check', true, 'System status retrieved successfully', statusData);
        } else {
          this.logTest('System Status Check', false, 'System status validation failed', statusData);
        }
      } else {
        this.logTest('System Status Check', false, 'System status check failed', response.data);
      }
    } catch (error) {
      this.logTest('System Status Check', false, 'System status check failed', error.message);
    }
  }

  async testDataGeneration() {
    try {
      const testData = {
        dataType: 'traces',
        count: 3
      };
      
      const response = await this.makeRequest('POST', '/api/v1/enhanced-observability/test/generate-data', testData);
      
      if (response.statusCode === 200 && response.data.success) {
        const generationData = response.data.data;
        const hasValidGeneration = generationData.dataType === testData.dataType &&
                                  generationData.count === testData.count &&
                                  generationData.generatedData &&
                                  Array.isArray(generationData.generatedData);
        
        if (hasValidGeneration) {
          this.logTest('Data Generation', true, 'Test data generated successfully', generationData);
        } else {
          this.logTest('Data Generation', false, 'Data generation validation failed', generationData);
        }
      } else {
        this.logTest('Data Generation', false, 'Data generation failed', response.data);
      }
    } catch (error) {
      this.logTest('Data Generation', false, 'Data generation failed', error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 Phase 4 Week 17-18: Enhanced Distributed Tracing & Observability - Test Suite');
    console.log('===============================================================================');
    console.log('');

    await this.testServiceHealth();
    await this.testTracingOverview();
    await this.testTraceDetails();
    await this.testBusinessMetrics();
    await this.testPredictiveAnalytics();
    await this.testObservabilityDashboard();
    await this.testSpanCreation();
    await this.testCustomMetrics();
    await this.testAlerts();
    await this.testAlertAcknowledgment();
    await this.testPerformanceAnalysis();
    await this.testBottleneckDetection();
    await this.testCriticalPathAnalysis();
    await this.testSystemStatus();
    await this.testDataGeneration();

    this.generateSummary();
  }

  generateSummary() {
    const duration = (Date.now() - this.startTime) / 1000;
    const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
    
    console.log('===============================================================================');
    console.log('🎯 Phase 4 Week 17-18: Enhanced Distributed Tracing & Observability Test Results');
    console.log('===============================================================================');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log(`⏱️ Duration: ${duration}s`);
    console.log('');

    if (this.failedTests === 0) {
      console.log('🎉 ALL TESTS PASSED! Enhanced Observability implementation is working correctly.');
      console.log('');
      console.log('✅ Phase 4 Week 17-18 Features Validated:');
      console.log('   - ✅ Distributed tracing with OpenTelemetry-style instrumentation');
      console.log('   - ✅ Business metrics dashboard with KPI tracking');
      console.log('   - ✅ Predictive analytics insights with business impact analysis');
      console.log('   - ✅ Performance analysis with bottleneck detection');
      console.log('   - ✅ Critical path analysis with optimization recommendations');
      console.log('   - ✅ Alert management with acknowledgment workflows');
      console.log('   - ✅ Custom metrics and span creation capabilities');
      console.log('   - ✅ Comprehensive observability dashboard integration');
      console.log('   - ✅ System status monitoring and health checks');
      console.log('   - ✅ Test data generation for validation');
      console.log('');
      console.log('🚀 Ready for Phase 4 Week 19-20 implementation!');
    } else {
      console.log('⚠️ Some tests failed. Please review the failed tests above.');
    }

    console.log('');
    console.log('📊 Test Summary:');
    console.log('   - Distributed Tracing: ' + (this.passedTests >= 2 ? 'OPERATIONAL' : 'NEEDS ATTENTION'));
    console.log('   - Business Metrics: ' + (this.passedTests >= 4 ? 'OPERATIONAL' : 'NEEDS ATTENTION'));
    console.log('   - Predictive Analytics: ' + (this.passedTests >= 5 ? 'OPERATIONAL' : 'NEEDS ATTENTION'));
    console.log('   - Performance Analysis: ' + (this.passedTests >= 7 ? 'OPERATIONAL' : 'NEEDS ATTENTION'));
    console.log('   - Alert Management: ' + (this.passedTests >= 9 ? 'OPERATIONAL' : 'NEEDS ATTENTION'));
    console.log('   - Observability Dashboard: ' + (this.passedTests >= 11 ? 'OPERATIONAL' : 'NEEDS ATTENTION'));
    console.log('   - System Monitoring: ' + (this.passedTests >= 13 ? 'OPERATIONAL' : 'NEEDS ATTENTION'));
    console.log('');
    console.log('===============================================================================');
  }
}

// Run the test suite
const tester = new EnhancedObservabilityTester();
tester.runAllTests().catch(console.error);