// Script to add attachments column to blogs table
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const addAttachmentsColumn = async () => {
  try {
    console.log('Adding attachments column to blogs table...');
    
    // Add attachments column (JSONB array for storing file metadata)
    await pool.query(`
      ALTER TABLE blogs 
      ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
    `);
    
    console.log('✅ Attachments column added successfully!');
    
    // Update author default if needed
    await pool.query(`
      ALTER TABLE blogs 
      ALTER COLUMN author SET DEFAULT 'Abhishek Kumar R';
    `);
    
    console.log('✅ Author default updated to "Abhishek Kumar R"!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding attachments column:', error);
    process.exit(1);
  }
};

addAttachmentsColumn();
