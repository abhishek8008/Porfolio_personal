import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Education data from About.jsx - matching actual database schema
const educationData = [
  {
    institution: "Lovely Professional University",
    degree: "B.Tech - Computer Science & Engineering",
    field_of_study: "Computer Science",
    start_date: "2022-08-01",
    end_date: "2026-06-30",
    grade: "CGPA: 6.65",
    description: "Currently pursuing B.Tech in Computer Science & Engineering at LPU, Phagwara, Punjab. Focus on modern web technologies, cloud computing, and AI/ML."
  },
  {
    institution: "St Francis De Sales",
    degree: "Intermediate (PCM)",
    field_of_study: "Physics, Chemistry, Mathematics",
    start_date: "2020-06-01",
    end_date: "2022-05-31",
    grade: "77%",
    description: "Completed intermediate education with Physics, Chemistry, and Mathematics at Bengaluru, Karnataka."
  },
  {
    institution: "B E S High School",
    degree: "Matriculation",
    field_of_study: "General Education",
    start_date: "2019-06-01",
    end_date: "2020-05-31",
    grade: "78.4%",
    description: "Completed matriculation with strong foundation in Science and Mathematics at Bengaluru, Karnataka."
  }
];

async function seedEducation() {
  const client = await pool.connect();
  
  try {
    console.log('🎓 Starting education seeding...\n');
    
    // Clear existing education data
    await client.query('DELETE FROM education');
    console.log('✅ Cleared existing education data\n');
    
    // Insert education entries
    for (const edu of educationData) {
      const result = await client.query(
        `INSERT INTO education (
          institution, degree, field_of_study, start_date, end_date, 
          grade, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          edu.institution,
          edu.degree,
          edu.field_of_study,
          edu.start_date,
          edu.end_date,
          edu.grade,
          edu.description
        ]
      );
      console.log(`✅ Added: ${edu.institution} - ${edu.degree}`);
    }
    
    console.log('\n🎉 Education seeding completed successfully!');
    console.log(`📚 Total entries: ${educationData.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding education:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedEducation();
