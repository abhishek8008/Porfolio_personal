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

// Certificates data from About.jsx - matching actual database schema
// Schema: id, title, issuer, issue_date, credential_url, image_url, description
const certificatesData = [
  {
    title: "AI Foundations",
    issuer: "Oracle",
    issue_date: "2025-10-01",
    credential_url: null,
    image_url: null,
    description: "Comprehensive certification covering AI fundamentals, machine learning concepts, and practical applications of artificial intelligence."
  },
  {
    title: "AWS Cloud Practitioner",
    issuer: "Amazon Web Services",
    issue_date: "2025-09-01",
    credential_url: null,
    image_url: null,
    description: "Foundational certification demonstrating overall understanding of AWS Cloud, including core services, security, architecture, pricing, and support."
  },
  {
    title: "Social Networks",
    issuer: "IIT Ropar - NPTEL",
    issue_date: "2024-10-01",
    credential_url: null,
    image_url: null,
    description: "Advanced course on social network analysis, graph theory, community detection, and network dynamics from IIT Ropar through NPTEL."
  },
  {
    title: "Programming in C++",
    issuer: "Codio - Coursera",
    issue_date: "2023-06-01",
    credential_url: null,
    image_url: null,
    description: "Comprehensive C++ programming certification covering object-oriented programming, data structures, memory management, and modern C++ features."
  }
];

async function seedCertificates() {
  const client = await pool.connect();
  
  try {
    console.log('🏆 Starting certificates seeding...\n');
    
    // Clear existing certificates data
    await client.query('DELETE FROM certificates');
    console.log('✅ Cleared existing certificates data\n');
    
    // Insert certificate entries
    for (const cert of certificatesData) {
      const result = await client.query(
        `INSERT INTO certificates (
          title, issuer, issue_date, credential_url, image_url, description
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          cert.title,
          cert.issuer,
          cert.issue_date,
          cert.credential_url,
          cert.image_url,
          cert.description
        ]
      );
      console.log(`✅ Added: ${cert.title} - ${cert.issuer}`);
    }
    
    console.log('\n🎉 Certificates seeding completed successfully!');
    console.log(`📜 Total certificates: ${certificatesData.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding certificates:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedCertificates();
