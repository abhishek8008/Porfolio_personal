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

// Skills data from Skills.jsx
const skillsData = [
  // Languages
  {
    name: "Python",
    category: "Languages",
    icon_url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    emoji: null,
    proficiency: 85,
    display_order: 1
  },
  {
    name: "C++",
    category: "Languages",
    icon_url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
    emoji: null,
    proficiency: 80,
    display_order: 2
  },
  {
    name: "Java",
    category: "Languages",
    icon_url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    emoji: null,
    proficiency: 75,
    display_order: 3
  },
  {
    name: "SQL",
    category: "Languages",
    icon_url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
    emoji: null,
    proficiency: 80,
    display_order: 4
  },
  
  // Frameworks
  {
    name: "HTML5",
    category: "Frameworks",
    icon_url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    emoji: null,
    proficiency: 90,
    display_order: 1
  },
  {
    name: "CSS3",
    category: "Frameworks",
    icon_url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
    emoji: null,
    proficiency: 85,
    display_order: 2
  },
  {
    name: "JavaScript",
    category: "Frameworks",
    icon_url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    emoji: null,
    proficiency: 85,
    display_order: 3
  },
  {
    name: "Bootstrap",
    category: "Frameworks",
    icon_url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
    emoji: null,
    proficiency: 80,
    display_order: 4
  },
  
  // Tools & Platforms
  {
    name: "Excel",
    category: "Tools & Platforms",
    icon_url: "https://img.icons8.com/color/96/microsoft-excel-2019--v1.png",
    emoji: null,
    proficiency: 85,
    display_order: 1
  },
  {
    name: "Tableau",
    category: "Tools & Platforms",
    icon_url: "https://img.icons8.com/color/96/tableau-software.png",
    emoji: null,
    proficiency: 75,
    display_order: 2
  },
  {
    name: "MySQL",
    category: "Tools & Platforms",
    icon_url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original-wordmark.svg",
    emoji: null,
    proficiency: 80,
    display_order: 3
  },
  {
    name: "Power BI",
    category: "Tools & Platforms",
    icon_url: "https://img.icons8.com/color/96/power-bi.png",
    emoji: null,
    proficiency: 70,
    display_order: 4
  },
  
  // Soft Skills
  {
    name: "Problem Solving",
    category: "Soft Skills",
    icon_url: null,
    emoji: "🧩",
    proficiency: 90,
    display_order: 1
  },
  {
    name: "Teamwork",
    category: "Soft Skills",
    icon_url: null,
    emoji: "🤝",
    proficiency: 85,
    display_order: 2
  },
  {
    name: "Collaboration",
    category: "Soft Skills",
    icon_url: null,
    emoji: "👥",
    proficiency: 85,
    display_order: 3
  },
  {
    name: "Adaptability",
    category: "Soft Skills",
    icon_url: null,
    emoji: "🔄",
    proficiency: 90,
    display_order: 4
  }
];

async function seedSkills() {
  const client = await pool.connect();
  
  try {
    console.log('💡 Starting skills seeding...\n');
    
    // Clear existing skills data
    await client.query('DELETE FROM skills');
    console.log('✅ Cleared existing skills data\n');
    
    // Insert skills entries
    for (const skill of skillsData) {
      const result = await client.query(
        `INSERT INTO skills (
          name, category, icon_url, emoji, proficiency, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          skill.name,
          skill.category,
          skill.icon_url,
          skill.emoji,
          skill.proficiency,
          skill.display_order
        ]
      );
      console.log(`✅ Added: ${skill.name} (${skill.category})`);
    }
    
    console.log('\n🎉 Skills seeding completed successfully!');
    console.log(`🛠️  Total skills: ${skillsData.length}`);
    
    // Show category breakdown
    const categories = [...new Set(skillsData.map(s => s.category))];
    console.log('\n📊 Category Breakdown:');
    categories.forEach(cat => {
      const count = skillsData.filter(s => s.category === cat).length;
      console.log(`   • ${cat}: ${count} skills`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding skills:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedSkills();
