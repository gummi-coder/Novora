import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: 'myapp_user',
  host: 'localhost',
  database: 'myapp_db',
  password: 'your_strong_password',
  port: 5432,
});

async function initializeDatabase() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);
    console.log('Database schema initialized successfully');

    // Test the connection by inserting a test user
    const testUser = {
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'hashed_password_here', // In production, this should be properly hashed
      role: 'admin'
    };

    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      [testUser.name, testUser.email, testUser.password, testUser.role]
    );
    console.log('Test user created successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeDatabase().catch(console.error); 