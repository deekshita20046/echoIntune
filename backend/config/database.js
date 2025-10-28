import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

/**
 * PostgreSQL Database Configuration
 * 
 * This file configures the connection pool to the PostgreSQL database.
 * Configuration is loaded from environment variables (see .env.example)
 * 
 * Default values:
 * - Database: echoIntune
 * - User: deekshita (change in .env)
 * - Host: localhost
 * - Port: 5432
 */

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'deekshita',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'echoIntune',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Connection event handlers
pool.on('error', (err) => {
  // Critical database errors - application cannot continue
  process.exit(-1)
})

/**
 * Query function - Executes a parameterized SQL query
 * @param {string} text - SQL query string with placeholders ($1, $2, etc.)
 * @param {Array} params - Array of values to replace placeholders
 * @returns {Promise} Query result object with rows, rowCount, etc.
 */
export const query = async (text, params) => {
  try {
    const res = await pool.query(text, params)
    return res
  } catch (error) {
    // Re-throw error to be handled by route error handlers
    throw error
  }
}

export default pool

