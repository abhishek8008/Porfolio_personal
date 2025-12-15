const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/database');

const projects = [
  {
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with React, Node.js, and MongoDB. Features include user authentication, payment integration, and admin dashboard.",
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    tech_stack: ["React", "Node.js", "MongoDB", "Stripe"],
    github_url: "https://github.com/abhishek8oo8",
    live_url: "#",
    featured: true,
    display_order: 1
  },
  {
    title: "AI Chatbot Assistant",
    description: "An intelligent chatbot powered by OpenAI API with natural language processing capabilities and conversation memory.",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    tech_stack: ["Python", "OpenAI", "Flask", "React"],
    github_url: "https://github.com/abhishek8oo8",
    live_url: "#",
    featured: true,
    display_order: 2
  },
  {
    title: "Task Management App",
    description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
    image_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
    tech_stack: ["React", "Firebase", "Tailwind CSS"],
    github_url: "https://github.com/abhishek8oo8",
    live_url: "#",
    featured: true,
    display_order: 3
  },
  {
    title: "Weather Dashboard",
    description: "Real-time weather application with beautiful UI, 7-day forecasts, and location-based weather updates.",
    image_url: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&h=400&fit=crop",
    tech_stack: ["JavaScript", "API", "CSS3"],
    github_url: "https://github.com/abhishek8oo8",
    live_url: "#",
    featured: false,
    display_order: 4
  },
  {
    title: "Portfolio Website",
    description: "A modern, responsive portfolio website with space theme, 3D animations, and smooth transitions built with React and Framer Motion.",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    tech_stack: ["React", "Tailwind CSS", "Framer Motion"],
    github_url: "https://github.com/abhishek8oo8",
    live_url: "#",
    featured: false,
    display_order: 5
  },
  {
    title: "Social Media Analytics",
    description: "A comprehensive analytics dashboard for social media metrics with data visualization and reporting features.",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    tech_stack: ["Python", "Django", "Chart.js"],
    github_url: "https://github.com/abhishek8oo8",
    live_url: "#",
    featured: false,
    display_order: 6
  }
];

const seedProjects = async () => {
  try {
    console.log('🌱 Seeding projects...');

    // Check if projects already exist
    const existingProjects = await db.query('SELECT COUNT(*) FROM projects');
    
    if (parseInt(existingProjects.rows[0].count) > 0) {
      console.log('⚠️  Projects already exist in database. Clearing existing projects...');
      await db.query('DELETE FROM projects');
      console.log('✅ Existing projects cleared');
    }

    // Insert each project
    for (const project of projects) {
      await db.query(
        `INSERT INTO projects (title, description, image_url, tech_stack, github_url, live_url, featured, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          project.title,
          project.description,
          project.image_url,
          project.tech_stack,
          project.github_url,
          project.live_url,
          project.featured,
          project.display_order
        ]
      );
      console.log(`✅ Added project: ${project.title}`);
    }

    console.log('\n🎉 All projects seeded successfully!');
    console.log(`📊 Total projects: ${projects.length}`);
    
    // Verify
    const result = await db.query('SELECT id, title, featured FROM projects ORDER BY display_order');
    console.log('\n📋 Projects in database:');
    result.rows.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title} ${p.featured ? '⭐' : ''}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    process.exit(1);
  }
};

seedProjects();
