/**
 * Chart Generator Utilities
 * Professional chart data generation for Amazon.com/Shopee.sg-level dashboards
 */

export interface ChartDataPoint {
  label: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  category?: string;
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'funnel';
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  showLegend?: boolean;
  showTooltips?: boolean;
  responsive?: boolean;
  animation?: boolean;
}

export interface GeneratedChart {
  data: any;
  config: ChartConfiguration;
  chartId: string;
  generatedAt: Date;
}

export class ChartGenerator {

  /**
   * Generate line chart data for time series
   */
  static generateLineChart(
    data: TimeSeriesPoint[],
    config: Partial<ChartConfiguration> = {}
  ): GeneratedChart {
    try {
      const chartConfig: ChartConfiguration = {
        type: 'line',
        title: 'Time Series Analysis',
        xAxisLabel: 'Time',
        yAxisLabel: 'Value',
        colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
        showLegend: true,
        showTooltips: true,
        responsive: true,
        animation: true,
        ...config
      };

      // Group data by category if present
      const categories = [...new Set(data.map(d => d.category || 'default'))];
      
      const chartData = {
        labels: [...new Set(data.map(d => d.timestamp))].sort(),
        datasets: categories.map((category, index) => {
          const categoryData = data.filter(d => (d.category || 'default') === category);
          const sortedData = categoryData.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
          
          return {
            label: category === 'default' ? 'Data' : category,
            data: sortedData.map(d => d.value),
            borderColor: chartConfig.colors?.[index % chartConfig.colors.length] || '#3b82f6',
            backgroundColor: `${chartConfig.colors?.[index % chartConfig.colors.length] || '#3b82f6'}20`,
            fill: false,
            tension: 0.1
          };
        })
      };

      return {
        data: chartData,
        config: chartConfig,
        chartId: `line-${Date.now()}`,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating line chart:', error);
      throw new Error(`Line chart generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate bar chart data
   */
  static generateBarChart(
    data: ChartDataPoint[],
    config: Partial<ChartConfiguration> = {}
  ): GeneratedChart {
    try {
      const chartConfig: ChartConfiguration = {
        type: 'bar',
        title: 'Bar Chart Analysis',
        xAxisLabel: 'Categories',
        yAxisLabel: 'Values',
        colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
        showLegend: false,
        showTooltips: true,
        responsive: true,
        animation: true,
        ...config
      };

      const sortedData = data.sort((a, b) => b.value - a.value);

      const chartData = {
        labels: sortedData.map(d => d.label),
        datasets: [{
          label: 'Values',
          data: sortedData.map(d => d.value),
          backgroundColor: sortedData.map((_, index) => 
            chartConfig.colors?.[index % chartConfig.colors!.length] || '#3b82f6'
          ),
          borderColor: sortedData.map((_, index) => 
            chartConfig.colors?.[index % chartConfig.colors!.length] || '#3b82f6'
          ),
          borderWidth: 1
        }]
      };

      return {
        data: chartData,
        config: chartConfig,
        chartId: `bar-${Date.now()}`,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating bar chart:', error);
      throw new Error(`Bar chart generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate pie chart data
   */
  static generatePieChart(
    data: ChartDataPoint[],
    config: Partial<ChartConfiguration> = {}
  ): GeneratedChart {
    try {
      const chartConfig: ChartConfiguration = {
        type: 'pie',
        title: 'Distribution Analysis',
        colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
        showLegend: true,
        showTooltips: true,
        responsive: true,
        animation: true,
        ...config
      };

      // Calculate total for percentages
      const total = data.reduce((sum, d) => sum + d.value, 0);
      
      const chartData = {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: data.map((_, index) => 
            chartConfig.colors?.[index % chartConfig.colors!.length] || '#3b82f6'
          ),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 4
        }],
        metadata: {
          total,
          percentages: data.map(d => ({
            label: d.label,
            percentage: total > 0 ? Number(((d.value / total) * 100).toFixed(1)) : 0
          }))
        }
      };

      return {
        data: chartData,
        config: chartConfig,
        chartId: `pie-${Date.now()}`,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating pie chart:', error);
      throw new Error(`Pie chart generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate area chart data
   */
  static generateAreaChart(
    data: TimeSeriesPoint[],
    config: Partial<ChartConfiguration> = {}
  ): GeneratedChart {
    try {
      const chartConfig: ChartConfiguration = {
        type: 'area',
        title: 'Area Chart Analysis',
        xAxisLabel: 'Time',
        yAxisLabel: 'Value',
        colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
        showLegend: true,
        showTooltips: true,
        responsive: true,
        animation: true,
        ...config
      };

      const categories = [...new Set(data.map(d => d.category || 'default'))];
      
      const chartData = {
        labels: [...new Set(data.map(d => d.timestamp))].sort(),
        datasets: categories.map((category, index) => {
          const categoryData = data.filter(d => (d.category || 'default') === category);
          const sortedData = categoryData.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
          
          return {
            label: category === 'default' ? 'Data' : category,
            data: sortedData.map(d => d.value),
            borderColor: chartConfig.colors?.[index % chartConfig.colors.length] || '#3b82f6',
            backgroundColor: `${chartConfig.colors?.[index % chartConfig.colors.length] || '#3b82f6'}40`,
            fill: true,
            tension: 0.4
          };
        })
      };

      return {
        data: chartData,
        config: chartConfig,
        chartId: `area-${Date.now()}`,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating area chart:', error);
      throw new Error(`Area chart generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate funnel chart data
   */
  static generateFunnelChart(
    data: Array<{ stage: string; value: number; conversionRate?: number }>,
    config: Partial<ChartConfiguration> = {}
  ): GeneratedChart {
    try {
      const chartConfig: ChartConfiguration = {
        type: 'funnel',
        title: 'Conversion Funnel',
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        showLegend: true,
        showTooltips: true,
        responsive: true,
        animation: true,
        ...config
      };

      // Calculate conversion rates if not provided
      const processedData = data.map((item, index) => {
        let conversionRate = item.conversionRate;
        if (conversionRate === undefined && index > 0) {
          conversionRate = data[index - 1].value > 0 ? 
            Number(((item.value / data[index - 1].value) * 100).toFixed(1)) : 0;
        } else if (conversionRate === undefined) {
          conversionRate = 100;
        }

        return {
          ...item,
          conversionRate
        };
      });

      const chartData = {
        labels: processedData.map(d => d.stage),
        datasets: [{
          data: processedData.map(d => d.value),
          backgroundColor: processedData.map((_, index) => 
            chartConfig.colors?.[index % chartConfig.colors!.length] || '#3b82f6'
          ),
          borderColor: '#ffffff',
          borderWidth: 2
        }],
        metadata: {
          conversionRates: processedData.map(d => ({
            stage: d.stage,
            value: d.value,
            conversionRate: d.conversionRate
          })),
          dropOffAnalysis: processedData.map((item, index) => {
            if (index === 0) return { stage: item.stage, dropOff: 0 };
            const previous = processedData[index - 1];
            const dropOff = previous.value - item.value;
            const dropOffRate = previous.value > 0 ? (dropOff / previous.value) * 100 : 0;
            return {
              stage: item.stage,
              dropOff,
              dropOffRate: Number(dropOffRate.toFixed(1))
            };
          })
        }
      };

      return {
        data: chartData,
        config: chartConfig,
        chartId: `funnel-${Date.now()}`,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating funnel chart:', error);
      throw new Error(`Funnel chart generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate heatmap data
   */
  static generateHeatmap(
    data: Array<{ x: string; y: string; value: number }>,
    config: Partial<ChartConfiguration> = {}
  ): GeneratedChart {
    try {
      const chartConfig: ChartConfiguration = {
        type: 'heatmap',
        title: 'Heatmap Analysis',
        xAxisLabel: 'X Axis',
        yAxisLabel: 'Y Axis',
        colors: ['#f0f9ff', '#3b82f6', '#1e40af'],
        showLegend: true,
        showTooltips: true,
        responsive: true,
        animation: true,
        ...config
      };

      // Get unique x and y values
      const xValues = [...new Set(data.map(d => d.x))].sort();
      const yValues = [...new Set(data.map(d => d.y))].sort();

      // Find min and max values for color scaling
      const values = data.map(d => d.value);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);

      // Create matrix data
      const matrixData = yValues.map(y => 
        xValues.map(x => {
          const dataPoint = data.find(d => d.x === x && d.y === y);
          return dataPoint ? dataPoint.value : 0;
        })
      );

      const chartData = {
        labels: {
          x: xValues,
          y: yValues
        },
        datasets: [{
          data: matrixData,
          backgroundColor: (context: any) => {
            const value = context.parsed;
            const normalized = maxValue > minValue ? 
              (value - minValue) / (maxValue - minValue) : 0;
            
            // Generate color based on normalized value
            const intensity = Math.floor(normalized * 255);
            return `rgba(59, 130, 246, ${normalized})`;
          }
        }],
        metadata: {
          minValue,
          maxValue,
          valueRange: maxValue - minValue
        }
      };

      return {
        data: chartData,
        config: chartConfig,
        chartId: `heatmap-${Date.now()}`,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating heatmap:', error);
      throw new Error(`Heatmap generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate dashboard layout with multiple charts
   */
  static generateDashboardLayout(
    charts: GeneratedChart[],
    layout: {
      columns: number;
      spacing?: number;
      responsive?: boolean;
    } = { columns: 2 }
  ): {
    charts: GeneratedChart[];
    layout: any;
    dashboardId: string;
    generatedAt: Date;
  } {
    try {
      const { columns = 2, spacing = 16, responsive = true } = layout;

      const dashboardLayout = {
        type: 'dashboard',
        columns,
        spacing,
        responsive,
        grid: charts.map((chart, index) => ({
          chartId: chart.chartId,
          position: {
            row: Math.floor(index / columns),
            col: index % columns,
            span: 1
          },
          size: {
            width: responsive ? '100%' : `${100 / columns}%`,
            height: '400px'
          }
        }))
      };

      return {
        charts,
        layout: dashboardLayout,
        dashboardId: `dashboard-${Date.now()}`,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating dashboard layout:', error);
      throw new Error(`Dashboard layout generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate chart with real-time configuration
   */
  static generateRealTimeChart(
    initialData: TimeSeriesPoint[],
    config: Partial<ChartConfiguration> & {
      updateInterval?: number;
      maxDataPoints?: number;
      autoScale?: boolean;
    } = {}
  ): GeneratedChart & {
    realTimeConfig: {
      updateInterval: number;
      maxDataPoints: number;
      autoScale: boolean;
      lastUpdate: Date;
    };
  } {
    try {
      const baseChart = this.generateLineChart(initialData, config);
      
      const realTimeConfig = {
        updateInterval: config.updateInterval || 5000, // 5 seconds
        maxDataPoints: config.maxDataPoints || 100,
        autoScale: config.autoScale !== false,
        lastUpdate: new Date()
      };

      return {
        ...baseChart,
        realTimeConfig,
        chartId: `realtime-${Date.now()}`
      };

    } catch (error) {
      console.error('Error generating real-time chart:', error);
      throw new Error(`Real-time chart generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate comparative chart (before/after, A/B testing)
   */
  static generateComparativeChart(
    beforeData: ChartDataPoint[],
    afterData: ChartDataPoint[],
    config: Partial<ChartConfiguration> = {}
  ): GeneratedChart {
    try {
      const chartConfig: ChartConfiguration = {
        type: 'bar',
        title: 'Comparative Analysis',
        xAxisLabel: 'Metrics',
        yAxisLabel: 'Values',
        colors: ['#ef4444', '#10b981'],
        showLegend: true,
        showTooltips: true,
        responsive: true,
        animation: true,
        ...config
      };

      // Combine labels from both datasets
      const allLabels = [...new Set([
        ...beforeData.map(d => d.label),
        ...afterData.map(d => d.label)
      ])];

      const chartData = {
        labels: allLabels,
        datasets: [
          {
            label: 'Before',
            data: allLabels.map(label => {
              const item = beforeData.find(d => d.label === label);
              return item ? item.value : 0;
            }),
            backgroundColor: chartConfig.colors?.[0] || '#ef4444',
            borderColor: chartConfig.colors?.[0] || '#ef4444',
            borderWidth: 1
          },
          {
            label: 'After',
            data: allLabels.map(label => {
              const item = afterData.find(d => d.label === label);
              return item ? item.value : 0;
            }),
            backgroundColor: chartConfig.colors?.[1] || '#10b981',
            borderColor: chartConfig.colors?.[1] || '#10b981',
            borderWidth: 1
          }
        ],
        metadata: {
          improvements: allLabels.map(label => {
            const beforeItem = beforeData.find(d => d.label === label);
            const afterItem = afterData.find(d => d.label === label);
            const beforeValue = beforeItem ? beforeItem.value : 0;
            const afterValue = afterItem ? afterItem.value : 0;
            const change = afterValue - beforeValue;
            const changePercent = beforeValue > 0 ? (change / beforeValue) * 100 : 0;

            return {
              label,
              beforeValue,
              afterValue,
              change,
              changePercent: Number(changePercent.toFixed(1)),
              improved: change > 0
            };
          })
        }
      };

      return {
        data: chartData,
        config: chartConfig,
        chartId: `comparative-${Date.now()}`,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating comparative chart:', error);
      throw new Error(`Comparative chart generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default ChartGenerator;