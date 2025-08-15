import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { getEnterpriseDB } from './database/enterprise-db';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Legacy database connection for backward compatibility
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Enterprise database connection (Phase 1 implementation)
let enterpriseDB: ReturnType<typeof getEnterpriseDB> | null = null;

export function getDB() {
  if (process.env.ENTERPRISE_MODE === 'true') {
    if (!enterpriseDB) {
      enterpriseDB = getEnterpriseDB();
    }
    return enterpriseDB.getDB();
  }
  return db;
}

export function getEnterpriseDatabase() {
  if (!enterpriseDB) {
    enterpriseDB = getEnterpriseDB();
  }
  return enterpriseDB;
}
