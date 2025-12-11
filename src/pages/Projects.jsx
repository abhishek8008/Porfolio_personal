// src/pages/Projects.jsx - FULLY UPGRADED LUXURY CYBER THEME
import React from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink, Folder, Star } from "lucide-react";

const projects = [
  {
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with React, Node.js, and MongoDB. Features include user authentication, payment integration, and admin dashboard.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    tags: ["React", "Node.js", "MongoDB", "Stripe"],
    github: "https://github.com/abhishek8oo8",
    live: "#",
    featured: true,
  },
  {
    title: "AI Chatbot Assistant",
    description: "An intelligent chatbot powered by OpenAI API with natural language processing capabilities and conversation memory.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    tags: ["Python", "OpenAI", "Flask", "React"],
    github: "https://github.com/abhishek8oo8",
    live: "#",
    featured: true,
  },
  {
    title: "Task Management App",
    description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
    tags: ["React", "Firebase", "Tailwind CSS"],
    github: "https://github.com/abhishek8oo8",
    live: "#",
    featured: true,
  },
  {
    title: "Weather Dashboard",
    description: "Real-time weather application with beautiful UI, 7-day forecasts, and location-based weather updates.",
    image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&h=400&fit=crop",
    tags: ["JavaScript", "API", "CSS3"],
    github: "https://github.com/abhishek8oo8",
    live: "#",
    featured: false,
  },
  {
    title: "Portfolio Website",
    description: "A modern, responsive portfolio website with space theme, 3D animations, and smooth transitions built with React and Framer Motion.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    tags: ["React", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/abhishek8oo8",
    live: "#",
    featured: false,
  },
  {
    title: "Social Media Analytics",
    description: "A comprehensive analytics dashboard for social media metrics with data visualization and reporting features.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    tags: ["Python", "Django", "Chart.js"],
    github: "https://github.com/abhishek8oo8",
    live: "#",
    featured: false,
  },
];

const ProjectCard = ({ project, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
      whileHover={{ y: -12, scale: 1.03 }}
      className="group relative h-full"
    >
      <div className="relative h-full bg-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-700 shadow-2xl hover:shadow-purple-500/30">
        {/* Glow on hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-700 -z-10" />

        <div className="relative h-56 overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {project.featured && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white shadow-lg">
              <Star className="w-4 h-4 fill-white" />
              Featured
            </div>
          )}

          {/* Hover Buttons */}
          <div className="absolute inset-0 flex items-center justify-center gap-8 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
            <motion.a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 360 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-black/70 backdrop-blur-xl border-2 border-purple-400/80 flex items-center justify-center text-purple-300 hover:bg-purple-600 hover:text-white shadow-2xl transition-all"
            >
              <Github className="w-6 h-6" />
            </motion.a>
            <motion.a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: -360 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-black/70 backdrop-blur-xl border-2 border-cyan-400/80 flex items-center justify-center text-cyan-300 hover:bg-cyan-600 hover:text-white shadow-2xl transition-all"
            >
              <ExternalLink className="w-6 h-6" />
            </motion.a>
          </div>
        </div>

        <div className="p-7 space-y-5">
          <div className="flex items-center justify-between">
            <Folder className="w-11 h-11 text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
            <div className="flex gap-5">
              <a href={project.github} className="text-gray-400 hover:text-purple-400 transition"><Github className="w-6 h-6" /></a>
              <a href={project.live} className="text-gray-400 hover:text-cyan-400 transition"><ExternalLink className="w-6 h-6" /></a>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-500">
            {project.title}
          </h3>

          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {project.tags.map((tag, i) => (
              <span
                key={i}
                className="px-4 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full border border-purple-500/40 backdrop-blur-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom glowing line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
      </div>
    </motion.div>
  );
};

const Projects = () => {
  return (
    <section className="relative min-h-screen bg-[#0b0014] overflow-hidden ">
      {/* Animated Nebula Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen blur-3xl opacity-50 animate-pulse" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-pink-600 rounded-full mix-blend-screen blur-3xl opacity-40 animate-pulse animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen blur-3xl opacity-30 animate-pulse animation-delay-4000" />

        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-transparent to-[#0b0014]" />
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse { animation: pulse-slow 15s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      <div className="relative z-10 pt-40 pb-32 flex justify-center">
        <div className="w-full max-w-7xl px-6 text-center space-y-20">

          {/* Badge */}
          <div className="h-8 md:h-15"/>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-full text-purple-300 font-medium backdrop-blur-xl text-sm md:text-base">
              <Folder className="w-5 h-5" />
              Selected Work
            </div>
          </motion.div>

          {/* Title */}
        {/* TITLE + DESCRIPTION — GUARANTEED CENTERED WITH MANUAL CSS */}
<div style={{ textAlign: 'center', width: '100%' }}>
  {/* Main Title */}
  <motion.h1
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 0.2 }}
    style={{
      fontSize: 'clamp(3rem, 8vw, 7rem)',
      fontWeight: 900,
      lineHeight: '1.1',
      color: 'white',
      margin: '0 auto',
      padding: '0 1rem',
      maxWidth: '1400px',
    }}
  >
    Crafting the{" "}
    <span
      style={{
        background: 'linear-gradient(to right, #a855f7, #ec4899, #06b6d4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))',
      }}
    >
      Future
    </span>
    <br className="hidden md:block" />
    One Project at a Time
  </motion.h1>

  {/* Description — FORCED CENTER */}
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6, duration: 1 }}
    style={{
      color: '#cbd5e1',
      fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
      lineHeight: '1.8',
      maxWidth: '900px',
      margin: '2.5rem auto 0 auto',
      padding: '0 1.5rem',
      textAlign: 'center',
    }}
  >
    High-impact digital experiences built with modern tech stacks, pixel-perfect design, and relentless attention to performance.
  </motion.p>
</div>

          {/* Projects Grid */}
          <div className="h-7 md:h-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} index={index} />
            ))}
          </div>

          {/* CTA Button */}
           <div className="h-7 md:h-10" />
          <motion.a
            href="https://github.com/abhishek8oo8"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 mt-12 w-80 h-10  justify-center"
          >
            <Github className="w-7 h-12" />
            Explore All Projects on GitHub
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default Projects;