const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/database');

const initPhotoVault = async () => {
  try {
    console.log('🔧 Initializing Photo Vault tables...');

    // Create albums table
    await db.query(`
      CREATE TABLE IF NOT EXISTS photo_albums (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cover_photo_id INTEGER,
        photo_count INTEGER DEFAULT 0,
        is_private BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ photo_albums table created');

    // Create photos table with metadata only (images stored in Cloudinary)
    await db.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        album_id INTEGER REFERENCES photo_albums(id) ON DELETE SET NULL,
        url VARCHAR(1000) NOT NULL,
        public_id VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(1000),
        title VARCHAR(255),
        description TEXT,
        width INTEGER,
        height INTEGER,
        file_size INTEGER,
        format VARCHAR(50),
        tags TEXT[],
        is_favorite BOOLEAN DEFAULT false,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        taken_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ photos table created');

    // Create indexes for better query performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
      CREATE INDEX IF NOT EXISTS idx_photos_upload_date ON photos(upload_date DESC);
      CREATE INDEX IF NOT EXISTS idx_photos_is_favorite ON photos(is_favorite);
      CREATE INDEX IF NOT EXISTS idx_photos_tags ON photos USING GIN(tags);
    `);
    console.log('✅ Indexes created');

    // Add foreign key for album cover
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_album_cover'
        ) THEN
          ALTER TABLE photo_albums 
          ADD CONSTRAINT fk_album_cover 
          FOREIGN KEY (cover_photo_id) 
          REFERENCES photos(id) 
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    console.log('✅ Foreign key constraints added');

    // Create default "Uncategorized" album
    const existingDefault = await db.query(
      "SELECT id FROM photo_albums WHERE name = 'Uncategorized'"
    );
    
    if (existingDefault.rows.length === 0) {
      await db.query(`
        INSERT INTO photo_albums (name, description, is_private)
        VALUES ('Uncategorized', 'Photos without a specific album', true)
      `);
      console.log('✅ Default album created');
    }

    console.log('✅ Photo Vault initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing Photo Vault:', error);
    process.exit(1);
  }
};

initPhotoVault();
