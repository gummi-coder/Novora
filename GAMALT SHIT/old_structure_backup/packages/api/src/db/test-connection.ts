import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: 'myapp_user',
  host: 'localhost',
  database: 'myapp_db',
  password: 'your_strong_password',
  port: 5432,
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful!');
    console.log('Current timestamp:', result.rows[0].now);
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await pool.end();
  }
}

testConnection(); 