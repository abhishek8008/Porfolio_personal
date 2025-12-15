const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seedAdmin = async () => {
  try {
    console.log('🌱 Seeding admin user...');

    const email = process.env.ADMIN_EMAIL || 'akrpersonal@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'Akr123321@';
    const name = 'Abhishek Kumar R';

    // Check if admin already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists. Updating password...');
      const hashedPassword = await bcrypt.hash(password, 12);
      await db.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, email]
      );
      console.log('✅ Admin password updated!');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert admin user
      await db.query(
        `INSERT INTO users (email, password, name, role) 
         VALUES ($1, $2, $3, $4)`,
        [email, hashedPassword, name, 'admin']
      );
      console.log('✅ Admin user created!');
    }

    // Seed initial profile if not exists
    const existingProfile = await db.query('SELECT id FROM profile LIMIT 1');
    
    if (existingProfile.rows.length === 0) {
      await db.query(`
        INSERT INTO profile (name, title, bio, email, phone, location, github, linkedin)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'Abhishek Kumar R',
        'Full Stack Developer & Data Analyst',
        'Passionate developer with expertise in building modern web applications and data-driven solutions.',
        'akr393456@gmail.com',
        '+91-9535563061',
        'Bengaluru, Karnataka, India',
        'https://github.com/abhishek8oo8',
        'https://linkedin.com/in/abhishek-kumar-r'
      ]);
      console.log('✅ Initial profile created!');
    }

    // Seed initial visit stats
    const pages = ['home', 'about', 'skills', 'projects', 'contact'];
    for (const page of pages) {
      const exists = await db.query('SELECT id FROM visit_stats WHERE page = $1', [page]);
      if (exists.rows.length === 0) {
        await db.query(
          'INSERT INTO visit_stats (page, visits, unique_visitors) VALUES ($1, 0, 0)',
          [page]
        );
      }
    }
    console.log('✅ Visit stats initialized!');

    console.log('\n🎉 Admin seeding complete!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedAdmin();
