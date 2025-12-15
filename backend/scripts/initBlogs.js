// Script to add blog table to database
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const createBlogTable = async () => {
  try {
    console.log('Creating blogs table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        cover_image VARCHAR(500),
        tags TEXT[], -- Array of tags
        category VARCHAR(100),
        reading_time INT DEFAULT 5,
        views INT DEFAULT 0,
        is_published BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        meta_description VARCHAR(300),
        author VARCHAR(100) DEFAULT 'Abhishek Kumar',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP
      );
    `);
    
    // Create index for faster slug lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
    `);
    
    // Create index for published posts
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(is_published, published_at DESC);
    `);

    console.log('✅ Blogs table created successfully!');
    
    // Insert sample blog post
    const samplePost = await pool.query(`
      INSERT INTO blogs (title, slug, excerpt, content, tags, category, reading_time, is_published, is_featured, published_at)
      VALUES (
        'Welcome to My Blog',
        'welcome-to-my-blog',
        'This is my first blog post where I share my journey as a developer and the exciting projects I am working on.',
        '# Welcome to My Blog!\n\nHello and welcome to my personal blog! 🎉\n\n## About This Blog\n\nThis is a space where I''ll be sharing:\n\n- **Technical tutorials** and guides\n- **Project showcases** and case studies\n- **Industry insights** and trends\n- **Personal experiences** in tech\n\n## What to Expect\n\nI''ll be posting regularly about:\n\n### Web Development\nFrom React and Node.js to the latest frameworks, I''ll share practical tips and best practices.\n\n### Cloud & DevOps\nExploring AWS, Docker, Kubernetes, and modern deployment strategies.\n\n### AI & Machine Learning\nDiving into the fascinating world of artificial intelligence and its applications.\n\n## Stay Connected\n\nDon''t forget to check back regularly for new content. You can also connect with me on [GitHub](https://github.com/abhishek8008) and [LinkedIn](https://linkedin.com/in/abhishek).\n\nHappy coding! 🚀',
        ARRAY['welcome', 'introduction', 'blog'],
        'General',
        3,
        true,
        true,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (slug) DO NOTHING
      RETURNING id;
    `);
    
    if (samplePost.rows.length > 0) {
      console.log('✅ Sample blog post created!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating blogs table:', error);
    process.exit(1);
  }
};

createBlogTable();
