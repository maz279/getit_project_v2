#!/usr/bin/env node
/**
 * Performance Analysis Script for GetIt Bangladesh
 * Amazon.com/Shopee.sg-Level Performance Monitoring and Analysis
 */

const fs = require('fs');
const path = require('path');

class PerformanceAnalyzer {
  constructor() {
    this.results = {};
    this.thresholds = {
      responseTime: {
        excellent: 200,
        good: 500,
        acceptable: 1000,
        poor: 2000
      },
      errorRate: {
        excellent: 0.001,
        good: 0.005,
        acceptable: 0.01,
        poor: 0.05
      },
      throughput: {
        minimum: 100, // requests per second
        target: 500,
        excellent: 1000
      }
    };
  }

  /**
   * Load and parse K6 test results
   */
  loadK6Results(filePath = 'load-test-results.json') {
    try {
      if (!fs.existsSync(filePath)) {
        console.log('⚠️ No K6 results file found, using simulated data');
        return this.generateSimulatedResults();
      }

      const rawData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(rawData);
      
      console.log('✅ Loaded K6 results from', filePath);
      return data;
    } catch (error) {
      console.error('❌ Error loading K6 results:', error.message);
      return this.generateSimulatedResults();
    }
  }

  /**
   * Generate simulated performance results for testing
   */
  generateSimulatedResults() {
    return {
      metrics: {
        http_req_duration: {
          avg: 450.5,
          min: 120.3,
          med: 430.2,
          max: 2150.8,
          p90: 680.4,
          p95: 820.7,
          p99: 1200.3
        },
        http_req_failed: {
          rate: 0.0045,
          count: 18,
          total: 4000
        },
        http_reqs: {
          count: 4000,
          rate: 66.67
        },
        vus: {
          value: 200,
          max: 500
        },
        iteration_duration: {
          avg: 2500.8,
          min: 1200.5,
          max: 8500.2
        }
      },
      summary: {
        duration: '35m0s',
        iterations: 4000,
        vus_max: 500,
        data_received: '125MB',
        data_sent: '45MB'
      }
    };
  }

  /**
   * Analyze performance metrics
   */
  analyzePerformance(k6Results) {
    const analysis = {
      responseTime: this.analyzeResponseTime(k6Results.metrics.http_req_duration),
      errorRate: this.analyzeErrorRate(k6Results.metrics.http_req_failed),
      throughput: this.analyzeThroughput(k6Results.metrics.http_reqs),
      scalability: this.analyzeScalability(k6Results.metrics),
      overall: {}
    };

    // Calculate overall score
    analysis.overall = this.calculateOverallScore(analysis);

    return analysis;
  }

  /**
   * Analyze response time metrics
   */
  analyzeResponseTime(rtMetrics) {
    const analysis = {
      metrics: rtMetrics,
      scores: {},
      recommendations: []
    };

    // Score different percentiles
    analysis.scores.average = this.scoreResponseTime(rtMetrics.avg);
    analysis.scores.p95 = this.scoreResponseTime(rtMetrics.p95);
    analysis.scores.p99 = this.scoreResponseTime(rtMetrics.p99);

    // Generate recommendations
    if (rtMetrics.avg > this.thresholds.responseTime.good) {
      analysis.recommendations.push('Consider optimizing database queries and caching strategies');
    }
    if (rtMetrics.p95 > this.thresholds.responseTime.acceptable) {
      analysis.recommendations.push('High P95 latency indicates potential bottlenecks under load');
    }
    if (rtMetrics.max > this.thresholds.responseTime.poor) {
      analysis.recommendations.push('Maximum response time suggests timeout issues or resource contention');
    }

    return analysis;
  }

  /**
   * Analyze error rate metrics
   */
  analyzeErrorRate(errorMetrics) {
    const analysis = {
      metrics: errorMetrics,
      score: this.scoreErrorRate(errorMetrics.rate),
      recommendations: []
    };

    if (errorMetrics.rate > this.thresholds.errorRate.acceptable) {
      analysis.recommendations.push('Error rate exceeds acceptable threshold - investigate application logs');
    }
    if (errorMetrics.rate > this.thresholds.errorRate.good) {
      analysis.recommendations.push('Consider implementing circuit breakers and retry mechanisms');
    }

    return analysis;
  }

  /**
   * Analyze throughput metrics
   */
  analyzeThroughput(throughputMetrics) {
    const analysis = {
      metrics: throughputMetrics,
      score: this.scoreThroughput(throughputMetrics.rate),
      recommendations: []
    };

    if (throughputMetrics.rate < this.thresholds.throughput.minimum) {
      analysis.recommendations.push('Throughput below minimum threshold - check system capacity');
    }
    if (throughputMetrics.rate < this.thresholds.throughput.target) {
      analysis.recommendations.push('Consider horizontal scaling to improve throughput');
    }

    return analysis;
  }

  /**
   * Analyze scalability characteristics
   */
  analyzeScalability(allMetrics) {
    const analysis = {
      maxConcurrentUsers: allMetrics.vus.max,
      iterationsCompleted: allMetrics.http_reqs.count,
      averageIterationTime: allMetrics.iteration_duration?.avg || 0,
      recommendations: []
    };

    // Calculate user handling efficiency
    const efficiency = allMetrics.http_reqs.rate / allMetrics.vus.max;
    analysis.userEfficiency = efficiency;

    if (efficiency < 0.5) {
      analysis.recommendations.push('Low user efficiency - consider optimizing request handling');
    }

    if (allMetrics.vus.max < 1000) {
      analysis.recommendations.push('Test with higher concurrent user loads to validate scalability');
    }

    return analysis;
  }

  /**
   * Score response time performance
   */
  scoreResponseTime(responseTime) {
    const thresholds = this.thresholds.responseTime;
    
    if (responseTime <= thresholds.excellent) return { score: 95, grade: 'A+', status: 'Excellent' };
    if (responseTime <= thresholds.good) return { score: 85, grade: 'A', status: 'Good' };
    if (responseTime <= thresholds.acceptable) return { score: 70, grade: 'B', status: 'Acceptable' };
    if (responseTime <= thresholds.poor) return { score: 50, grade: 'C', status: 'Poor' };
    return { score: 30, grade: 'D', status: 'Unacceptable' };
  }

  /**
   * Score error rate performance
   */
  scoreErrorRate(errorRate) {
    const thresholds = this.thresholds.errorRate;
    
    if (errorRate <= thresholds.excellent) return { score: 95, grade: 'A+', status: 'Excellent' };
    if (errorRate <= thresholds.good) return { score: 85, grade: 'A', status: 'Good' };
    if (errorRate <= thresholds.acceptable) return { score: 70, grade: 'B', status: 'Acceptable' };
    if (errorRate <= thresholds.poor) return { score: 50, grade: 'C', status: 'Poor' };
    return { score: 30, grade: 'D', status: 'Unacceptable' };
  }

  /**
   * Score throughput performance
   */
  scoreThroughput(throughput) {
    const thresholds = this.thresholds.throughput;
    
    if (throughput >= thresholds.excellent) return { score: 95, grade: 'A+', status: 'Excellent' };
    if (throughput >= thresholds.target) return { score: 85, grade: 'A', status: 'Good' };
    if (throughput >= thresholds.minimum) return { score: 70, grade: 'B', status: 'Acceptable' };
    return { score: 50, grade: 'C', status: 'Poor' };
  }

  /**
   * Calculate overall performance score
   */
  calculateOverallScore(analysis) {
    const weights = {
      responseTime: 0.4,
      errorRate: 0.3,
      throughput: 0.3
    };

    const scores = {
      responseTime: analysis.responseTime.scores.p95.score,
      errorRate: analysis.errorRate.score,
      throughput: analysis.throughput.score
    };

    const weightedScore = Object.keys(weights).reduce((total, metric) => {
      return total + (scores[metric] * weights[metric]);
    }, 0);

    let grade, status;
    if (weightedScore >= 90) { grade = 'A+'; status = 'Excellent'; }
    else if (weightedScore >= 80) { grade = 'A'; status = 'Good'; }
    else if (weightedScore >= 70) { grade = 'B'; status = 'Acceptable'; }
    else if (weightedScore >= 60) { grade = 'C'; status = 'Poor'; }
    else { grade = 'D'; status = 'Unacceptable'; }

    return {
      score: Math.round(weightedScore),
      grade,
      status,
      breakdown: scores,
      weights
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    // Collect all recommendations
    const allRecommendations = [
      ...analysis.responseTime.recommendations,
      ...analysis.errorRate.recommendations,
      ...analysis.throughput.recommendations,
      ...analysis.scalability.recommendations
    ];

    // Categorize by priority/timeline
    allRecommendations.forEach(rec => {
      if (rec.includes('exceeds') || rec.includes('timeout') || rec.includes('bottleneck')) {
        recommendations.immediate.push(rec);
      } else if (rec.includes('optimize') || rec.includes('circuit breaker')) {
        recommendations.shortTerm.push(rec);
      } else {
        recommendations.longTerm.push(rec);
      }
    });

    // Add Amazon.com/Shopee.sg-level recommendations
    if (analysis.overall.score < 85) {
      recommendations.shortTerm.push('Implement enterprise caching strategy like Amazon.com');
      recommendations.shortTerm.push('Consider microservices optimization like Shopee.sg');
    }

    if (analysis.throughput.metrics.rate < 500) {
      recommendations.longTerm.push('Implement horizontal auto-scaling');
      recommendations.longTerm.push('Consider CDN implementation for static assets');
    }

    return recommendations;
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(analysis, recommendations) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        overallScore: analysis.overall.score,
        grade: analysis.overall.grade,
        status: analysis.overall.status
      },
      metrics: {
        responseTime: {
          average: analysis.responseTime.metrics.avg,
          p95: analysis.responseTime.metrics.p95,
          p99: analysis.responseTime.metrics.p99,
          score: analysis.responseTime.scores.p95.score
        },
        errorRate: {
          rate: analysis.errorRate.metrics.rate,
          count: analysis.errorRate.metrics.count,
          score: analysis.errorRate.score
        },
        throughput: {
          requestsPerSecond: analysis.throughput.metrics.rate,
          totalRequests: analysis.throughput.metrics.count,
          score: analysis.throughput.score
        }
      },
      recommendations,
      amazonShopeeComparison: this.compareWithBenchmarks(analysis),
      nextSteps: this.generateNextSteps(analysis)
    };

    return report;
  }

  /**
   * Compare with Amazon.com/Shopee.sg benchmarks
   */
  compareWithBenchmarks(analysis) {
    const benchmarks = {
      amazon: { responseTime: 200, errorRate: 0.001, throughput: 1000 },
      shopee: { responseTime: 250, errorRate: 0.002, throughput: 800 }
    };

    const current = {
      responseTime: analysis.responseTime.metrics.p95,
      errorRate: analysis.errorRate.metrics.rate,
      throughput: analysis.throughput.metrics.rate
    };

    return {
      amazon: {
        responseTimeGap: current.responseTime - benchmarks.amazon.responseTime,
        errorRateGap: current.errorRate - benchmarks.amazon.errorRate,
        throughputGap: benchmarks.amazon.throughput - current.throughput
      },
      shopee: {
        responseTimeGap: current.responseTime - benchmarks.shopee.responseTime,
        errorRateGap: current.errorRate - benchmarks.shopee.errorRate,
        throughputGap: benchmarks.shopee.throughput - current.throughput
      }
    };
  }

  /**
   * Generate next steps based on analysis
   */
  generateNextSteps(analysis) {
    const steps = [];

    if (analysis.overall.score < 70) {
      steps.push('🚨 Immediate action required - performance below acceptable threshold');
      steps.push('📊 Conduct detailed profiling to identify bottlenecks');
      steps.push('🔧 Implement emergency performance fixes');
    }

    if (analysis.responseTime.scores.p95.score < 70) {
      steps.push('⚡ Optimize response time - implement caching strategy');
      steps.push('🗄️ Review database query performance');
    }

    if (analysis.errorRate.score < 70) {
      steps.push('🛡️ Implement error monitoring and alerting');
      steps.push('🔄 Add circuit breaker patterns');
    }

    if (analysis.throughput.score < 70) {
      steps.push('📈 Scale infrastructure to handle higher load');
      steps.push('🔀 Implement load balancing');
    }

    steps.push('📋 Schedule regular performance testing');
    steps.push('🎯 Set up continuous performance monitoring');

    return steps;
  }

  /**
   * Save report to file
   */
  saveReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-report-${timestamp}.json`;
    
    try {
      fs.writeFileSync(filename, JSON.stringify(report, null, 2));
      console.log(`📄 Performance report saved to ${filename}`);
      
      // Also save human-readable version
      const txtFilename = `performance-report-${timestamp}.txt`;
      this.saveHumanReadableReport(report, txtFilename);
      
    } catch (error) {
      console.error('❌ Error saving report:', error.message);
    }
  }

  /**
   * Save human-readable report
   */
  saveHumanReadableReport(report, filename) {
    const content = `
🎯 GetIt Bangladesh Performance Analysis Report
===============================================
Generated: ${report.timestamp}

📊 OVERALL PERFORMANCE
Overall Score: ${report.summary.overallScore}/100 (${report.summary.grade})
Status: ${report.summary.status}

📈 KEY METRICS
Response Time (P95): ${report.metrics.responseTime.p95.toFixed(1)}ms
Error Rate: ${(report.metrics.errorRate.rate * 100).toFixed(3)}%
Throughput: ${report.metrics.throughput.requestsPerSecond.toFixed(1)} req/s

🎯 AMAZON.COM/SHOPEE.SG COMPARISON
Amazon.com Gap:
  - Response Time: ${report.amazonShopeeComparison.amazon.responseTimeGap > 0 ? '+' : ''}${report.amazonShopeeComparison.amazon.responseTimeGap.toFixed(1)}ms
  - Throughput: ${report.amazonShopeeComparison.amazon.throughputGap > 0 ? '-' : '+'}${Math.abs(report.amazonShopeeComparison.amazon.throughputGap).toFixed(1)} req/s

Shopee.sg Gap:
  - Response Time: ${report.amazonShopeeComparison.shopee.responseTimeGap > 0 ? '+' : ''}${report.amazonShopeeComparison.shopee.responseTimeGap.toFixed(1)}ms
  - Throughput: ${report.amazonShopeeComparison.shopee.throughputGap > 0 ? '-' : '+'}${Math.abs(report.amazonShopeeComparison.shopee.throughputGap).toFixed(1)} req/s

🚀 IMMEDIATE RECOMMENDATIONS
${report.recommendations.immediate.map(r => `• ${r}`).join('\n')}

📋 SHORT-TERM IMPROVEMENTS
${report.recommendations.shortTerm.map(r => `• ${r}`).join('\n')}

🎯 LONG-TERM STRATEGY
${report.recommendations.longTerm.map(r => `• ${r}`).join('\n')}

📝 NEXT STEPS
${report.nextSteps.map(step => step).join('\n')}
`;

    try {
      fs.writeFileSync(filename, content);
      console.log(`📋 Human-readable report saved to ${filename}`);
    } catch (error) {
      console.error('❌ Error saving human-readable report:', error.message);
    }
  }

  /**
   * Display results in console
   */
  displayResults(analysis, recommendations) {
    console.log('\n🎯 PERFORMANCE ANALYSIS RESULTS');
    console.log('================================');
    
    console.log(`\n📊 OVERALL SCORE: ${analysis.overall.score}/100 (${analysis.overall.grade})`);
    console.log(`Status: ${analysis.overall.status}`);
    
    console.log('\n📈 DETAILED METRICS:');
    console.log(`Response Time (P95): ${analysis.responseTime.metrics.p95.toFixed(1)}ms (${analysis.responseTime.scores.p95.grade})`);
    console.log(`Error Rate: ${(analysis.errorRate.metrics.rate * 100).toFixed(3)}% (${analysis.errorRate.score}/100)`);
    console.log(`Throughput: ${analysis.throughput.metrics.rate.toFixed(1)} req/s (${analysis.throughput.score}/100)`);
    
    console.log('\n🚀 IMMEDIATE ACTIONS:');
    recommendations.immediate.forEach(rec => console.log(`• ${rec}`));
    
    console.log('\n📋 SHORT-TERM IMPROVEMENTS:');
    recommendations.shortTerm.forEach(rec => console.log(`• ${rec}`));
    
    if (analysis.overall.score >= 85) {
      console.log('\n🎉 Excellent performance! Ready for Amazon.com/Shopee.sg-level traffic');
    } else if (analysis.overall.score >= 70) {
      console.log('\n✅ Good performance, some optimizations recommended');
    } else {
      console.log('\n⚠️ Performance improvements needed before production deployment');
    }
  }

  /**
   * Main analysis function
   */
  run() {
    console.log('🚀 Starting Performance Analysis for GetIt Bangladesh');
    console.log('Amazon.com/Shopee.sg-Level Performance Standards\n');

    // Load test results
    const k6Results = this.loadK6Results();
    
    // Perform analysis
    const analysis = this.analyzePerformance(k6Results);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(analysis);
    
    // Generate comprehensive report
    const report = this.generateReport(analysis, recommendations);
    
    // Display results
    this.displayResults(analysis, recommendations);
    
    // Save report
    this.saveReport(report);
    
    console.log('\n✅ Performance analysis completed');
    
    // Return exit code based on performance
    return analysis.overall.score >= 70 ? 0 : 1;
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  const exitCode = analyzer.run();
  process.exit(exitCode);
}

module.exports = PerformanceAnalyzer;