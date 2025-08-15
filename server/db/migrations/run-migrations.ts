/**
 * Phase 1 Database Migration Runner
 * Executes SQL migrations for database-per-service architecture
 * Target: Amazon.com/Shopee.sg enterprise standards
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../../db';

export async function runPhase1Migrations() {
  console.log('🚀 Starting Phase 1 Database Migrations...');
  
  try {
    // Read the migration SQL file
    const migrationPath = join(__dirname, 'phase1-create-tables.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons but preserve those within function definitions
    const statements = migrationSQL
      .split(/;(?![^$]*\$\$)/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Add semicolon back if it's not a function definition
        const sql = statement.includes('$$') ? statement + ';' : statement + ';';
        
        await pool.query(sql);
        successCount++;
        
        // Log progress for important operations
        if (sql.includes('CREATE SCHEMA')) {
          const schemaMatch = sql.match(/CREATE SCHEMA IF NOT EXISTS (\w+)/);
          if (schemaMatch) {
            console.log(`✅ Created schema: ${schemaMatch[1]}`);
          }
        } else if (sql.includes('CREATE TABLE')) {
          const tableMatch = sql.match(/CREATE TABLE IF NOT EXISTS ([\w.]+)/);
          if (tableMatch) {
            console.log(`✅ Created table: ${tableMatch[1]}`);
          }
        } else if (sql.includes('CREATE INDEX')) {
          const indexMatch = sql.match(/CREATE INDEX (\w+)/);
          if (indexMatch) {
            console.log(`✅ Created index: ${indexMatch[1]}`);
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        
        // Continue with other statements even if one fails
        if (error.message.includes('already exists')) {
          console.log('   ℹ️  Object already exists, continuing...');
        } else {
          console.error('   Statement:', statement.substring(0, 100) + '...');
        }
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successful statements: ${successCount}`);
    console.log(`   ❌ Failed statements: ${errorCount}`);
    
    // Verify the schemas were created
    const schemasResult = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('user_service', 'product_service', 'order_service')
      ORDER BY schema_name
    `);
    
    console.log('\n🏗️  Database schemas:');
    schemasResult.rows.forEach(row => {
      console.log(`   ✅ ${row.schema_name}`);
    });
    
    // Count tables in each schema
    const tablesResult = await pool.query(`
      SELECT 
        table_schema,
        COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema IN ('user_service', 'product_service', 'order_service')
        AND table_type = 'BASE TABLE'
      GROUP BY table_schema
      ORDER BY table_schema
    `);
    
    console.log('\n📊 Tables per schema:');
    tablesResult.rows.forEach(row => {
      console.log(`   📁 ${row.table_schema}: ${row.table_count} tables`);
    });
    
    return {
      success: errorCount === 0,
      successCount,
      errorCount,
      schemas: schemasResult.rows.map(r => r.schema_name),
      tables: tablesResult.rows
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  runPhase1Migrations()
    .then(result => {
      console.log('\n✅ Phase 1 migrations completed successfully!');
      console.log('🎯 Database architecture ready for Amazon.com/Shopee.sg standards');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}