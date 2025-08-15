/**
 * Logger utility for ML service
 */

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[ML-Service] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[ML-Service] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ML-Service] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  debug: (message: string, meta?: any) => {
    console.debug(`[ML-Service] ${message}`, meta ? JSON.stringify(meta) : '');
  }
};