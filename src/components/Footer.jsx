import { motion } from "framer-motion";
import {
  FaReact,
  FaNodeJs,
  FaGithub,
  FaHtml5,
  FaCss3Alt,
} from "react-icons/fa";
import { SiTailwindcss, SiMongodb, SiJavascript } from "react-icons/si";

const Footer = () => {
  const year = new Date().getFullYear();

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
      {/* 🌊 Wave Top Border */}
      {/* <div className="w-full overflow-hidden leading-[0]">
        <svg
          className="block w-full h-10 text-slate-950"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,256L48,245.3C96,235,192,213,288,186.7C384,160,480,128,576,117.3C672,107,768,117,864,133.3C960,149,1056,171,1152,160C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div> */}

      {/* Main Footer Content */}
      <div className="pt-10 pb-8 flex flex-col items-center justify-center gap-6 px-4 select-none">
        {/* 🌈 Gradient Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full max-w-lg h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-4 animate-pulse"
        />

        {/* 🧩 Tech Icons Row */}
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

        {/* ✨ Slogan */}
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

        {/* 🔝 Back to Top Button */}
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
          Back to Top ↑
        </motion.button>

        {/* © Bottom Credit */}
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
         <div className="h-1" />
      </div>
    </footer>
  );
};

export default Footer;
