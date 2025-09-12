import { Pool } from 'pg';

const pool = new Pool({
  user: 'myapp_user',
  host: 'localhost',
  database: 'myapp_db',
  password: 'your_strong_password',
  port: 5432,
});

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result.rows;
} 