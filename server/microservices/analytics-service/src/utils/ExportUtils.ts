/**
 * Export Utilities
 * Professional data export capabilities for Amazon.com/Shopee.sg-level reporting
 */

import * as XLSX from 'xlsx';
import { parse as json2csv } from 'json2csv';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  fileName?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  customHeaders?: Record<string, string>;
  filters?: Record<string, any>;
  formatting?: {
    currency?: string;
    dateFormat?: string;
    numberFormat?: string;
  };
}

export interface ExportResult {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  size: number;
  generatedAt: Date;
}

export class ExportUtils {

  /**
   * Export data to CSV format
   */
  static async exportToCSV(
    data: Array<Record<string, any>>,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    try {
      const { 
        fileName = `export_${Date.now()}.csv`,
        includeHeaders = true,
        customHeaders,
        filters,
        formatting
      } = options;

      // Apply filters if provided
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

      // Process data with formatting
      const processedData = filteredData.map(item => {
        const processed: Record<string, any> = {};
        
        Object.entries(item).forEach(([key, value]) => {
          const headerKey = customHeaders?.[key] || key;
          
          // Apply formatting
          if (formatting) {
            if (typeof value === 'number') {
              if (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')) {
                processed[headerKey] = this.formatCurrency(value, formatting.currency);
              } else {
                processed[headerKey] = this.formatNumber(value, formatting.numberFormat);
              }
            } else if (value instanceof Date) {
              processed[headerKey] = this.formatDate(value, formatting.dateFormat);
            } else {
              processed[headerKey] = value;
            }
          } else {
            processed[headerKey] = value;
          }
        });
        
        return processed;
      });

      // Generate CSV
      const fields = Object.keys(processedData[0] || {});
      const csv = json2csv(processedData, { fields, withBOM: true });
      const buffer = Buffer.from(csv, 'utf8');

      return {
        buffer,
        fileName,
        mimeType: 'text/csv',
        size: buffer.length,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error(`CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export data to Excel format
   */
  static async exportToExcel(
    data: Array<Record<string, any>> | Record<string, Array<Record<string, any>>>,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    try {
      const { 
        fileName = `export_${Date.now()}.xlsx`,
        sheetName = 'Sheet1',
        includeHeaders = true,
        customHeaders,
        filters,
        formatting
      } = options;

      const workbook = XLSX.utils.book_new();

      // Handle multiple sheets or single sheet
      const sheets = Array.isArray(data) ? { [sheetName]: data } : data;

      Object.entries(sheets).forEach(([currentSheetName, sheetData]) => {
        // Apply filters if provided
        let filteredData = sheetData;
        if (filters) {
          filteredData = sheetData.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
              if (Array.isArray(value)) {
                return value.includes(item[key]);
              }
              return item[key] === value;
            });
          });
        }

        // Process data with formatting
        const processedData = filteredData.map(item => {
          const processed: Record<string, any> = {};
          
          Object.entries(item).forEach(([key, value]) => {
            const headerKey = customHeaders?.[key] || key;
            
            // Apply formatting
            if (formatting) {
              if (typeof value === 'number') {
                if (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')) {
                  processed[headerKey] = this.formatCurrency(value, formatting.currency);
                } else {
                  processed[headerKey] = this.formatNumber(value, formatting.numberFormat);
                }
              } else if (value instanceof Date) {
                processed[headerKey] = this.formatDate(value, formatting.dateFormat);
              } else {
                processed[headerKey] = value;
              }
            } else {
              processed[headerKey] = value;
            }
          });
          
          return processed;
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(processedData, {
          header: includeHeaders ? Object.keys(processedData[0] || {}) : undefined
        });

        // Auto-size columns
        const colWidths: Array<{ wch: number }> = [];
        if (processedData.length > 0) {
          Object.keys(processedData[0]).forEach(key => {
            const maxLength = Math.max(
              key.length,
              ...processedData.map(row => String(row[key] || '').length)
            );
            colWidths.push({ wch: Math.min(maxLength + 2, 50) });
          });
          worksheet['!cols'] = colWidths;
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, currentSheetName);
      });

      // Generate Excel buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return {
        buffer,
        fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: buffer.length,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error(`Excel export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export data to JSON format
   */
  static async exportToJSON(
    data: Array<Record<string, any>>,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    try {
      const { 
        fileName = `export_${Date.now()}.json`,
        filters,
        formatting
      } = options;

      // Apply filters if provided
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

      // Process data with formatting
      const processedData = filteredData.map(item => {
        const processed: Record<string, any> = {};
        
        Object.entries(item).forEach(([key, value]) => {
          // Apply formatting
          if (formatting) {
            if (typeof value === 'number') {
              if (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')) {
                processed[key] = this.formatCurrency(value, formatting.currency);
              } else {
                processed[key] = this.formatNumber(value, formatting.numberFormat);
              }
            } else if (value instanceof Date) {
              processed[key] = this.formatDate(value, formatting.dateFormat);
            } else {
              processed[key] = value;
            }
          } else {
            processed[key] = value;
          }
        });
        
        return processed;
      });

      // Generate JSON with metadata
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          totalRecords: processedData.length,
          originalRecords: data.length,
          filters: filters || null
        },
        data: processedData
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const buffer = Buffer.from(jsonString, 'utf8');

      return {
        buffer,
        fileName,
        mimeType: 'application/json',
        size: buffer.length,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw new Error(`JSON export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate analytics report with multiple data sets
   */
  static async generateAnalyticsReport(
    reportData: {
      summary: Record<string, any>;
      charts: Array<{ title: string; data: any }>;
      tables: Array<{ title: string; data: Array<Record<string, any>> }>;
      metadata: Record<string, any>;
    },
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    try {
      const { 
        format = 'excel',
        fileName = `analytics_report_${Date.now()}`,
        formatting
      } = options;

      const { summary, charts, tables, metadata } = reportData;

      if (format === 'excel') {
        const workbook = XLSX.utils.book_new();

        // Summary sheet
        const summarySheet = XLSX.utils.json_to_sheet([summary]);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

        // Chart data sheets
        charts.forEach((chart, index) => {
          if (chart.data && Array.isArray(chart.data)) {
            const chartSheet = XLSX.utils.json_to_sheet(chart.data);
            XLSX.utils.book_append_sheet(workbook, chartSheet, `Chart_${index + 1}_${chart.title.slice(0, 20)}`);
          }
        });

        // Table data sheets
        tables.forEach((table) => {
          const processedData = table.data.map(item => {
            const processed: Record<string, any> = {};
            
            Object.entries(item).forEach(([key, value]) => {
              if (formatting) {
                if (typeof value === 'number') {
                  if (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')) {
                    processed[key] = this.formatCurrency(value, formatting.currency);
                  } else {
                    processed[key] = this.formatNumber(value, formatting.numberFormat);
                  }
                } else if (value instanceof Date) {
                  processed[key] = this.formatDate(value, formatting.dateFormat);
                } else {
                  processed[key] = value;
                }
              } else {
                processed[key] = value;
              }
            });
            
            return processed;
          });

          const tableSheet = XLSX.utils.json_to_sheet(processedData);
          XLSX.utils.book_append_sheet(workbook, tableSheet, table.title.slice(0, 31));
        });

        // Metadata sheet
        const metadataSheet = XLSX.utils.json_to_sheet([metadata]);
        XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return {
          buffer,
          fileName: `${fileName}.xlsx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: buffer.length,
          generatedAt: new Date()
        };

      } else if (format === 'json') {
        const reportJson = {
          metadata: {
            ...metadata,
            exportedAt: new Date().toISOString(),
            format: 'json'
          },
          summary,
          charts,
          tables
        };

        const jsonString = JSON.stringify(reportJson, null, 2);
        const buffer = Buffer.from(jsonString, 'utf8');

        return {
          buffer,
          fileName: `${fileName}.json`,
          mimeType: 'application/json',
          size: buffer.length,
          generatedAt: new Date()
        };

      } else {
        throw new Error(`Unsupported format for analytics report: ${format}`);
      }

    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw new Error(`Analytics report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Format currency values
   */
  private static formatCurrency(value: number, currency: string = 'BDT'): string {
    try {
      if (currency === 'BDT') {
        return `৳${value.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency
        }).format(value);
      }
    } catch (error) {
      return `${currency} ${value.toFixed(2)}`;
    }
  }

  /**
   * Format number values
   */
  private static formatNumber(value: number, format?: string): string {
    try {
      if (format === 'percentage') {
        return `${value.toFixed(2)}%`;
      } else if (format === 'decimal') {
        return value.toFixed(2);
      } else if (format === 'integer') {
        return Math.round(value).toString();
      } else if (format === 'thousand') {
        return value.toLocaleString('en-US');
      } else {
        return value.toString();
      }
    } catch (error) {
      return value.toString();
    }
  }

  /**
   * Format date values
   */
  private static formatDate(date: Date, format?: string): string {
    try {
      if (format === 'iso') {
        return date.toISOString();
      } else if (format === 'short') {
        return date.toLocaleDateString('en-US');
      } else if (format === 'long') {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else if (format === 'bangladesh') {
        return date.toLocaleDateString('bn-BD');
      } else {
        return date.toLocaleDateString('en-US');
      }
    } catch (error) {
      return date.toString();
    }
  }

  /**
   * Validate export data
   */
  static validateExportData(data: any[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if data exists
    if (!data || !Array.isArray(data)) {
      errors.push('Data must be a non-empty array');
      return { isValid: false, errors, warnings };
    }

    if (data.length === 0) {
      warnings.push('Data array is empty');
    }

    // Check data consistency
    if (data.length > 0) {
      const firstItemKeys = Object.keys(data[0]);
      const inconsistentRows = data.slice(1).some(item => {
        const itemKeys = Object.keys(item);
        return firstItemKeys.length !== itemKeys.length ||
               !firstItemKeys.every(key => itemKeys.includes(key));
      });

      if (inconsistentRows) {
        warnings.push('Data structure is inconsistent across rows');
      }

      // Check for very large datasets
      if (data.length > 100000) {
        warnings.push('Large dataset detected - export may take longer');
      }

      // Check for circular references
      try {
        JSON.stringify(data);
      } catch (error) {
        errors.push('Data contains circular references or non-serializable values');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get export statistics
   */
  static getExportStatistics(data: any[]): {
    totalRows: number;
    totalColumns: number;
    dataTypes: Record<string, number>;
    nullValues: number;
    estimatedSize: number;
  } {
    if (!data || data.length === 0) {
      return {
        totalRows: 0,
        totalColumns: 0,
        dataTypes: {},
        nullValues: 0,
        estimatedSize: 0
      };
    }

    const totalRows = data.length;
    const totalColumns = Object.keys(data[0]).length;
    const dataTypes: Record<string, number> = {};
    let nullValues = 0;

    data.forEach(row => {
      Object.values(row).forEach(value => {
        if (value === null || value === undefined) {
          nullValues++;
        } else {
          const type = typeof value;
          dataTypes[type] = (dataTypes[type] || 0) + 1;
        }
      });
    });

    // Estimate size (rough calculation)
    const jsonString = JSON.stringify(data);
    const estimatedSize = Buffer.byteLength(jsonString, 'utf8');

    return {
      totalRows,
      totalColumns,
      dataTypes,
      nullValues,
      estimatedSize
    };
  }
}

export default ExportUtils;