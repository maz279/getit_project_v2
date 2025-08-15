
export interface ImportExportStats {
  totalImports: number;
  totalExports: number;
  successfulOperations: number;
  failedOperations: number;
  avgProcessingTime: number;
  dataProcessedToday: number;
  activeOperations: number;
  scheduledOperations: number;
}

export interface ImportOperation {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: 'csv' | 'xlsx' | 'xml' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  startTime: Date;
  endTime?: Date;
  errors: ImportError[];
  mapping: FieldMapping[];
  validationRules: ValidationRule[];
  duplicateHandling: 'skip' | 'update' | 'create-new';
  createdBy: string;
}

export interface ExportOperation {
  id: string;
  fileName: string;
  fileType: 'csv' | 'xlsx' | 'xml' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  startTime: Date;
  endTime?: Date;
  filters: ExportFilter[];
  fields: string[];
  format: ExportFormat;
  createdBy: string;
  downloadUrl?: string;
}

export interface BulkOperation {
  id: string;
  operationType: 'update-prices' | 'update-inventory' | 'update-status' | 'delete-products' | 'assign-categories';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  startTime: Date;
  endTime?: Date;
  criteria: BulkCriteria;
  changes: BulkChanges;
  createdBy: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
  value: any;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: any;
  required: boolean;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'unique' | 'numeric' | 'email' | 'url' | 'date' | 'regex';
  parameters?: any;
  message: string;
}

export interface ExportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
}

export interface ExportFormat {
  delimiter?: string;
  encoding?: string;
  includeHeaders: boolean;
  dateFormat?: string;
  numberFormat?: string;
}

export interface BulkCriteria {
  categories?: string[];
  vendors?: string[];
  priceRange?: [number, number];
  stockRange?: [number, number];
  status?: string[];
  tags?: string[];
}

export interface BulkChanges {
  price?: {
    type: 'percentage' | 'fixed' | 'replace';
    value: number;
  };
  inventory?: {
    type: 'add' | 'subtract' | 'replace';
    value: number;
  };
  status?: string;
  category?: string;
  tags?: string[];
}

export interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  fileType: 'csv' | 'xlsx' | 'xml' | 'json';
  fieldMappings: FieldMapping[];
  validationRules: ValidationRule[];
  sampleData: any[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  fileType: 'csv' | 'xlsx' | 'xml' | 'json';
  fields: string[];
  filters: ExportFilter[];
  format: ExportFormat;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}
