/**
 * Data Processor Utilities
 * Advanced data processing for Amazon.com/Shopee.sg-level analytics
 */

export interface ProcessingOptions {
  aggregationMethod?: 'sum' | 'average' | 'median' | 'count' | 'max' | 'min';
  groupBy?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  includePercentages?: boolean;
  includeTrends?: boolean;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface AggregatedData {
  key: string;
  value: number;
  percentage?: number;
  trend?: number;
  metadata?: Record<string, any>;
}

export class DataProcessor {

  /**
   * Aggregate data by specified method and grouping
   */
  static aggregateData(
    data: Array<Record<string, any>>,
    options: ProcessingOptions
  ): AggregatedData[] {
    try {
      const { aggregationMethod = 'sum', groupBy, filters, sortBy, sortOrder = 'desc', limit, includePercentages } = options;

      // Apply filters first
      let filteredData = data;
      if (filters) {
        filteredData = data.filter(item => {
          return Object.entries(filters).every(([key, value]) => {
            if (Array.isArray(value)) {
              return value.includes(item[key]);
            }
            return item[key] === value;
          });
        });
      }

      // Group data if groupBy is specified
      const grouped: Record<string, any[]> = {};
      if (groupBy) {
        filteredData.forEach(item => {
          const key = item[groupBy]?.toString() || 'Unknown';
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(item);
        });
      } else {
        grouped['total'] = filteredData;
      }

      // Aggregate grouped data
      const aggregated: AggregatedData[] = Object.entries(grouped).map(([key, items]) => {
        let value = 0;
        const numericItems = items.filter(item => typeof item.value === 'number');

        switch (aggregationMethod) {
          case 'sum':
            value = numericItems.reduce((sum, item) => sum + item.value, 0);
            break;
          case 'average':
            value = numericItems.length > 0 ? 
              numericItems.reduce((sum, item) => sum + item.value, 0) / numericItems.length : 0;
            break;
          case 'median':
            const sorted = numericItems.map(item => item.value).sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            value = sorted.length % 2 === 0 ? 
              (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
            break;
          case 'count':
            value = items.length;
            break;
          case 'max':
            value = Math.max(...numericItems.map(item => item.value));
            break;
          case 'min':
            value = Math.min(...numericItems.map(item => item.value));
            break;
          default:
            value = numericItems.reduce((sum, item) => sum + item.value, 0);
        }

        return {
          key,
          value: Number(value.toFixed(2)),
          metadata: {
            count: items.length,
            originalData: items.slice(0, 3) // Keep sample of original data
          }
        };
      });

      // Calculate percentages if requested
      if (includePercentages) {
        const total = aggregated.reduce((sum, item) => sum + item.value, 0);
        aggregated.forEach(item => {
          item.percentage = total > 0 ? Number(((item.value / total) * 100).toFixed(2)) : 0;
        });
      }

      // Sort results
      if (sortBy) {
        aggregated.sort((a, b) => {
          const aVal = sortBy === 'key' ? a.key : a.value;
          const bVal = sortBy === 'key' ? b.key : b.value;
          
          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }

      // Apply limit
      return limit ? aggregated.slice(0, limit) : aggregated;

    } catch (error) {
      console.error('Error in data aggregation:', error);
      throw new Error(`Data aggregation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate time series trends and patterns
   */
  static calculateTimeSeries(
    data: TimeSeriesData[],
    options: {
      interval?: 'hour' | 'day' | 'week' | 'month';
      includeTrends?: boolean;
      includeSeasonality?: boolean;
      fillGaps?: boolean;
    } = {}
  ): Array<{
    period: string;
    value: number;
    trend?: number;
    seasonalIndex?: number;
    movingAverage?: number;
  }> {
    try {
      const { interval = 'day', includeTrends = true, includeSeasonality = false, fillGaps = true } = options;

      // Sort data by timestamp
      const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // Group data by time interval
      const grouped: Record<string, TimeSeriesData[]> = {};
      
      sortedData.forEach(item => {
        let periodKey: string;
        const date = new Date(item.timestamp);

        switch (interval) {
          case 'hour':
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
            break;
          case 'day':
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            periodKey = `${weekStart.getFullYear()}-W${String(Math.ceil(weekStart.getDate() / 7)).padStart(2, '0')}`;
            break;
          case 'month':
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            periodKey = date.toISOString().split('T')[0];
        }

        if (!grouped[periodKey]) {
          grouped[periodKey] = [];
        }
        grouped[periodKey].push(item);
      });

      // Aggregate values for each period
      const timeSeries = Object.entries(grouped).map(([period, items]) => ({
        period,
        value: items.reduce((sum, item) => sum + item.value, 0),
        count: items.length
      })).sort((a, b) => a.period.localeCompare(b.period));

      // Fill gaps if requested
      if (fillGaps && timeSeries.length > 1) {
        // This would involve complex date interpolation
        // For now, we'll return the existing data
      }

      // Calculate trends
      const result = timeSeries.map((item, index) => {
        const enhanced: any = { ...item };

        if (includeTrends && index > 0) {
          const previousValue = timeSeries[index - 1].value;
          enhanced.trend = previousValue > 0 ? 
            Number((((item.value - previousValue) / previousValue) * 100).toFixed(2)) : 0;
        }

        // Calculate moving average (7-period)
        if (index >= 6) {
          const window = timeSeries.slice(index - 6, index + 1);
          enhanced.movingAverage = Number(
            (window.reduce((sum, w) => sum + w.value, 0) / window.length).toFixed(2)
          );
        }

        // Simple seasonality index (comparing to average)
        if (includeSeasonality) {
          const totalAverage = timeSeries.reduce((sum, ts) => sum + ts.value, 0) / timeSeries.length;
          enhanced.seasonalIndex = totalAverage > 0 ? 
            Number((item.value / totalAverage).toFixed(2)) : 1;
        }

        return enhanced;
      });

      return result;

    } catch (error) {
      console.error('Error in time series calculation:', error);
      throw new Error(`Time series calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate statistical metrics
   */
  static calculateStatistics(data: number[]): {
    mean: number;
    median: number;
    mode: number;
    standardDeviation: number;
    variance: number;
    min: number;
    max: number;
    quartiles: { q1: number; q2: number; q3: number };
    outliers: number[];
  } {
    try {
      if (data.length === 0) {
        throw new Error('Cannot calculate statistics for empty dataset');
      }

      const sorted = [...data].sort((a, b) => a - b);
      const n = data.length;

      // Mean
      const mean = data.reduce((sum, val) => sum + val, 0) / n;

      // Median
      const median = n % 2 === 0 ? 
        (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : 
        sorted[Math.floor(n / 2)];

      // Mode
      const frequency: Record<number, number> = {};
      data.forEach(val => {
        frequency[val] = (frequency[val] || 0) + 1;
      });
      const mode = Number(Object.keys(frequency).reduce((a, b) => 
        frequency[Number(a)] > frequency[Number(b)] ? a : b
      ));

      // Variance and Standard Deviation
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      const standardDeviation = Math.sqrt(variance);

      // Min and Max
      const min = Math.min(...data);
      const max = Math.max(...data);

      // Quartiles
      const q1Index = Math.floor(n * 0.25);
      const q2Index = Math.floor(n * 0.5);
      const q3Index = Math.floor(n * 0.75);

      const quartiles = {
        q1: sorted[q1Index],
        q2: sorted[q2Index],
        q3: sorted[q3Index]
      };

      // Outliers (using IQR method)
      const iqr = quartiles.q3 - quartiles.q1;
      const lowerBound = quartiles.q1 - 1.5 * iqr;
      const upperBound = quartiles.q3 + 1.5 * iqr;
      const outliers = data.filter(val => val < lowerBound || val > upperBound);

      return {
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        mode,
        standardDeviation: Number(standardDeviation.toFixed(2)),
        variance: Number(variance.toFixed(2)),
        min,
        max,
        quartiles,
        outliers
      };

    } catch (error) {
      console.error('Error in statistical calculation:', error);
      throw new Error(`Statistical calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Normalize data for comparison
   */
  static normalizeData(
    data: Array<{ key: string; value: number }>,
    method: 'minmax' | 'zscore' | 'percentage' = 'percentage'
  ): Array<{ key: string; value: number; normalizedValue: number }> {
    try {
      const values = data.map(item => item.value);
      
      let normalizedData: Array<{ key: string; value: number; normalizedValue: number }>;

      switch (method) {
        case 'minmax':
          const min = Math.min(...values);
          const max = Math.max(...values);
          const range = max - min;
          
          normalizedData = data.map(item => ({
            ...item,
            normalizedValue: range > 0 ? Number(((item.value - min) / range).toFixed(4)) : 0
          }));
          break;

        case 'zscore':
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const stdDev = Math.sqrt(
            values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
          );
          
          normalizedData = data.map(item => ({
            ...item,
            normalizedValue: stdDev > 0 ? Number(((item.value - mean) / stdDev).toFixed(4)) : 0
          }));
          break;

        case 'percentage':
        default:
          const total = values.reduce((sum, val) => sum + val, 0);
          
          normalizedData = data.map(item => ({
            ...item,
            normalizedValue: total > 0 ? Number(((item.value / total) * 100).toFixed(2)) : 0
          }));
          break;
      }

      return normalizedData;

    } catch (error) {
      console.error('Error in data normalization:', error);
      throw new Error(`Data normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect anomalies in data using statistical methods
   */
  static detectAnomalies(
    data: Array<{ timestamp: Date; value: number }>,
    options: {
      method?: 'zscore' | 'iqr' | 'isolation';
      sensitivity?: number;
    } = {}
  ): Array<{ timestamp: Date; value: number; isAnomaly: boolean; score: number }> {
    try {
      const { method = 'zscore', sensitivity = 2 } = options;
      const values = data.map(item => item.value);

      let anomalies: Array<{ timestamp: Date; value: number; isAnomaly: boolean; score: number }>;

      switch (method) {
        case 'zscore':
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const stdDev = Math.sqrt(
            values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
          );
          
          anomalies = data.map(item => {
            const zScore = stdDev > 0 ? Math.abs((item.value - mean) / stdDev) : 0;
            return {
              ...item,
              isAnomaly: zScore > sensitivity,
              score: Number(zScore.toFixed(4))
            };
          });
          break;

        case 'iqr':
          const sorted = [...values].sort((a, b) => a - b);
          const n = sorted.length;
          const q1 = sorted[Math.floor(n * 0.25)];
          const q3 = sorted[Math.floor(n * 0.75)];
          const iqr = q3 - q1;
          const lowerBound = q1 - sensitivity * iqr;
          const upperBound = q3 + sensitivity * iqr;
          
          anomalies = data.map(item => ({
            ...item,
            isAnomaly: item.value < lowerBound || item.value > upperBound,
            score: Math.max(
              Math.abs(item.value - lowerBound) / iqr,
              Math.abs(item.value - upperBound) / iqr
            )
          }));
          break;

        case 'isolation':
        default:
          // Simplified isolation forest approach
          anomalies = data.map(item => {
            const score = Math.random(); // Placeholder for actual isolation forest
            return {
              ...item,
              isAnomaly: score > 0.8,
              score: Number(score.toFixed(4))
            };
          });
          break;
      }

      return anomalies;

    } catch (error) {
      console.error('Error in anomaly detection:', error);
      throw new Error(`Anomaly detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default DataProcessor;