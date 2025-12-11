import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Database, Users, Sparkles } from "lucide-react";
import styles from "./Skills.module.css";

// Skill data
const skillCategories = [
  {
    title: "Languages",
    icon: Code2,
    color: "indigo",
    skills: [
      { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
      { name: "C++", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
      { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
      { name: "SQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    ]
  },
  {
    title: "Frameworks",
    icon: Sparkles,
    color: "purple",
    skills: [
      { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
      { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
      { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
      { name: "Bootstrap", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
    ]
  },
  {
    title: "Tools & Platforms",
    icon: Database,
    color: "pink",
    skills: [
      { name: "Excel", icon: "https://img.icons8.com/color/96/microsoft-excel-2019--v1.png" },
      { name: "Tableau", icon: "https://img.icons8.com/color/96/tableau-software.png" },
      { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original-wordmark.svg" },
      { name: "Power BI", icon: "https://img.icons8.com/color/96/power-bi.png" },
    ]
  },
  {
    title: "Soft Skills",
    icon: Users,
    color: "cyan",
    skills: [
      { name: "Problem Solving", icon: null, emoji: "🧩" },
      { name: "Teamwork", icon: null, emoji: "🤝" },
      { name: "Collaboration", icon: null, emoji: "👥" },
      { name: "Adaptability", icon: null, emoji: "🔄" },
    ]
  }
];

// Color mappings for skill cards
const cardColorClasses = {
  indigo: styles.skillCardIndigo,
  purple: styles.skillCardPurple,
  pink: styles.skillCardPink,
  cyan: styles.skillCardCyan,
};

const iconColorClasses = {
  indigo: styles.categoryIconIndigo,
  purple: styles.categoryIconPurple,
  pink: styles.categoryIconPink,
  cyan: styles.categoryIconCyan,
};

// 3D Skill Card Component
const SkillCard3D = ({ skill, index, categoryColor }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Floating stars data
  const floatingStars = [
    { id: 1, x: -15, delay: 0 },
    { id: 2, x: 0, delay: 0.15 },
    { id: 3, x: 15, delay: 0.3 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={{
          rotateY: isHovered ? 10 : 0,
          rotateX: isHovered ? -10 : 0,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`${styles.skillCard} ${cardColorClasses[categoryColor]}`}
      >
        <div className={styles.skillCardContent}>
          <motion.div
            animate={{
              rotateY: isHovered ? [0, 360] : 0,
              y: isHovered ? -5 : 0,
            }}
            transition={{
              rotateY: { duration: 2, ease: "linear", repeat: isHovered ? Infinity : 0 },
              y: { duration: 0.3 }
            }}
            className={styles.skillIconWrapper}
          >
            <div className={styles.skillIconShadow} />
            {skill.icon ? (
              <img src={skill.icon} alt={skill.name} className={styles.skillIcon} />
            ) : (
              <span className={styles.skillEmoji}>{skill.emoji}</span>
            )}

            {/* Floating Stars on Hover */}
            {isHovered && floatingStars.map((star) => (
              <motion.div
                key={star.id}
                initial={{ opacity: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: -60,
                  scale: [0, 1, 1, 0],
                  x: star.x,
                }}
                transition={{
                  duration: 1,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className={styles.floatingStar}
              >
                ✦
              </motion.div>
            ))}
          </motion.div>
          <motion.p 
            className={styles.skillName}
            animate={{ scale: isHovered ? 1.05 : 1 }}
          >
            {skill.name}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Category Section Component
const CategorySection = ({ category, index }) => {
  const IconComponent = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={styles.categorySection}
    >
      <div className={styles.categoryHeader}>
        <div className={`${styles.categoryIcon} ${iconColorClasses[category.color]}`}>
          <IconComponent size={24} />
        </div>
        <h3 className={styles.categoryTitle}>{category.title}</h3>
      </div>

      <div className={styles.skillsGrid}>
        {category.skills.map((skill, skillIndex) => (
          <SkillCard3D 
            key={skill.name} 
            skill={skill} 
            index={skillIndex}
            categoryColor={category.color}
          />
        ))}
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const stats = [
    { label: "Languages", value: "4+", colorClass: styles.statValueOrange },
    { label: "Frameworks", value: "4+", colorClass: styles.statValueYellow },
    { label: "Tools", value: "4+", colorClass: styles.statValueAmber },
    { label: "Projects", value: "10+", colorClass: styles.statValueCyan },
  ];

  return (
    <div className={styles.skillsPage}>
      {/* Background */}
      <div className={styles.stars} />
      <div className={styles.nebula1} />
      <div className={styles.nebula2} />

      {/* Sun with reduced glow */}
      <div className={styles.sunContainer}>
        <div className={styles.sun} />
      </div>

      {/* Orbiting Moon */}
      <div className={styles.orbitContainer}>
        <div className={styles.orbitWrapper}>
          <div className={styles.orbitPath} />
          <div className={styles.orbitingMoon}>
            <div className={styles.moon}>
              <div className={styles.moonCrater1} />
              <div className={styles.moonCrater2} />
              <div className={styles.moonCrater3} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className={styles.mainContent}>
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className={styles.contentWrapper}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className={styles.header}>
            <div className={styles.badge}>
              <Code2 size={16} />
              Technical Expertise
            </div>
            
            <h1 className={styles.title}>
              <span className={styles.titleWhite}>My Skills &</span>
              <br />
              <span className={styles.titleGradient}>Technologies</span>
            </h1>
            
            <p className={styles.subtitle}>
              A comprehensive toolkit of programming languages, frameworks, and tools
              that I use to build impactful digital solutions.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className={styles.statsGrid}>
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02, y: -2 }}
                className={styles.statCard}
              >
                <p className={`${styles.statValue} ${stat.colorClass}`}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Skills Categories - 2 rows */}
          <div className={styles.categoriesWrapper}>
            {skillCategories.map((category, index) => (
              <CategorySection key={category.title} category={category} index={index} />
            ))}
          </div>

          {/* CTA */}
          <motion.div variants={itemVariants} className={styles.ctaSection}>
            <div className={styles.ctaButtons}>
              <a href="/projects" className={styles.ctaPrimary}>
                View My Projects
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </a>
              <a href="/contact" className={styles.ctaSecondary}>
                Get In Touch
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Skills;