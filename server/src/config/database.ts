import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bloodpressure',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'changeme123',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Initialize database schema by running migrations
 */
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        await client.query(sql);
        console.log(`✓ Migration ${file} completed`);
      }
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get a client from the pool
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Query helper with error logging
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  try {
    const result = await pool.query(text, params);
    return { rows: result.rows, rowCount: result.rowCount || 0 };
  } catch (error) {
    console.error('Database query error:', error, 'Query:', text);
    throw error;
  }
}

/**
 * Close all connections in the pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
