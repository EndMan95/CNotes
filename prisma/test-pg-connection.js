const { Client } = require('pg');
require('dotenv').config();

// Use the DIRECT_URL for direct connection
const client = new Client({
  connectionString: process.env.DIRECT_URL,
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Successfully connected to the database!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Current time from database:', res.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

testConnection();