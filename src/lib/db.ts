import postgres from 'postgres'
import 'dotenv/config'

// Get the database URL from environment variable or use a default for development
const databaseUrl = process.env.DATABASE_URL || import.meta.env.VITE_DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pullupclub'

// Connection configuration
const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 10, // Max number of connections
  idle_timeout: 20, // Idle connection timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Disable prepared statements for Supabase
})

// Test the connection
async function testConnection() {
  try {
    await sql`SELECT version()`
    console.log('Database connected successfully')
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}

// Initialize connection
testConnection()

export default sql

// Helper functions
export const query = {
  // Example query helper
  async findUserById(userId: string) {
    try {
      const result = await sql`
        SELECT * FROM profiles 
        WHERE user_id = ${userId}
      `
      return result[0]
    } catch (error) {
      console.error('Error finding user:', error)
      throw error
    }
  },
  
  // Add more query helpers as needed
} 