// Simple logger to replace Winston temporarily
// This prevents the "write after end" errors while we debug

export const log = (message: string) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

export const error = (message: string, err?: any) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`, err || '');
};

export const warn = (message: string) => {
  console.warn(`[${new Date().toISOString()}] WARN: ${message}`);
};

export const info = (message: string) => {
  console.info(`[${new Date().toISOString()}] INFO: ${message}`);
};

export const debug = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`);
  }
};