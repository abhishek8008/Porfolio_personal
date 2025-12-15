import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  FaReact,
  FaNodeJs,
  FaGithub,
  FaHtml5,
  FaCss3Alt,
} from "react-icons/fa";
import { SiTailwindcss, SiMongodb, SiJavascript } from "react-icons/si";
import { publicAPI } from "../services/api";

// Digital LED Digit Component
const LEDDigit = ({ digit }) => {
  return (
    <div className="relative w-6 h-10 md:w-8 md:h-12 flex items-center justify-center">
      <span 
        className="font-mono text-2xl md:text-3xl font-bold text-green-400"
        style={{
          fontFamily: "'Orbitron', 'Courier New', monospace",
          textShadow: '0 0 10px #4ade80, 0 0 20px #4ade80, 0 0 30px #22c55e, 0 0 40px #22c55e'
        }}
      >
        {digit}
      </span>
    </div>
  );
};

// Digital LED Counter Component
const DigitalLEDCounter = ({ count }) => {
  const paddedCount = String(count).padStart(6, '0');
  const digits = paddedCount.split('');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-2"
    >
      <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-slate-500 font-medium">
        Home Page Visitors
      </span>
      
      <div 
        className="relative px-4 py-3 rounded-lg border-2 border-slate-700/80"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(74,222,128,0.15), 0 4px 15px rgba(0,0,0,0.5)'
        }}
      >
        <div 
          className="absolute inset-1 rounded pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.3) 100%)'
          }}
        />
        
        <div className="flex items-center gap-0.5">
          {digits.map((digit, index) => (
            <LEDDigit key={index} digit={digit} />
          ))}
        </div>

        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden rounded"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)'
          }}
        />
      </div>
    </motion.div>
  );
};

const Footer = () => {
  const year = new Date().getFullYear();
  const location = useLocation();
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const trackCurrentPage = async () => {
      try {
        // Track visit for current page (for admin stats)
        await publicAPI.trackVisit(location.pathname || '/');
      } catch (error) {
        console.error('Failed to track visit:', error);
      }
    };
    trackCurrentPage();
  }, [location.pathname]);

  useEffect(() => {
    const fetchHomePageCount = async () => {
      try {
        // Only show home page visitor count in footer
        const response = await publicAPI.getVisitorCount('/');
        if (response.success) {
          setVisitorCount(response.totalVisits || 0);
        }
      } catch (error) {
        console.error('Failed to fetch visitor count:', error);
      }
    };
    fetchHomePageCount();
  }, []);

  const techIcons = [
    { Icon: FaReact, label: "React" },
    { Icon: SiTailwindcss, label: "Tailwind CSS" },
    { Icon: SiJavascript, label: "JavaScript" },
    { Icon: FaNodeJs, label: "Node.js" },
    { Icon: SiMongodb, label: "MongoDB" },
    { Icon: FaGithub, label: "GitHub" },
    { Icon: FaHtml5, label: "HTML5" },
    { Icon: FaCss3Alt, label: "CSS3" },
  ];

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-10 bg-gradient-to-t from-slate-950 via-slate-900 to-transparent mt-10">
      <div className="pt-10 pb-8 flex flex-col items-center justify-center gap-6 px-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full max-w-lg h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-4 animate-pulse"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-5 text-slate-400 text-2xl"
        >
          {techIcons.map(({ Icon, label }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.15, y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 15 }}
              className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/60 hover:border-purple-500/70 hover:bg-slate-800/80 shadow-[0_0_20px_rgba(0,0,0,0.35)] cursor-default"
              title={label}
            >
              <Icon className="hover:text-purple-300 transition-colors" />
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-slate-400 text-sm tracking-wide text-center px-4"
        >
          Crafting <span className="text-cyan-400 font-semibold">modern</span>{" "}
          web experiences with{" "}
          <span className="text-purple-400 font-semibold">clean code</span> &
          <span className="text-pink-400 font-semibold"> creativity</span>.
        </motion.p>

        {/* Digital LED Visitor Counter */}
        <DigitalLEDCounter count={visitorCount} />

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          onClick={handleScrollTop}
          className="mt-2 px-5 py-2 rounded-full border border-purple-500/70 text-xs uppercase tracking-[0.15em] text-slate-200 bg-slate-900/70 hover:bg-purple-600/20 hover:border-purple-400/80 backdrop-blur-md shadow-[0_0_20px_rgba(88,28,135,0.4)] w-32 h-5 justify-center flex items-center cursor-pointer"
        >
          Back to Top
        </motion.button>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-4 text-slate-500 text-xs text-center"
        >
          © {year}{" "}
          <span className="text-purple-300 font-semibold">
            Abhishek Kumar R
          </span>{" "}
          — All Rights Reserved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Link
            to="/admin/login"
            className="text-slate-600 hover:text-slate-400 text-[10px] tracking-wide transition-colors duration-300"
          >
            Admin
          </Link>
        </motion.div>

        <div className="h-1" />
      </div>
    </footer>
  );
};

export default Footer;
