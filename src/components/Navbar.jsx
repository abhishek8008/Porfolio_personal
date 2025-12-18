import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Github, Linkedin, Mail, Image } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { id: "home", label: "Home", path: "/" },
  { id: "about", label: "About", path: "/about" },
  { id: "skills", label: "Skills", path: "/skills" },
  { id: "projects", label: "Projects", path: "/projects" },
  { id: "blog", label: "Blog", path: "/blog" },
  { id: "contact", label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") || "dark"
  );
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  // Close menu on route change
  useEffect(() => setOpen(false), [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLinkClick = () => {
    setOpen(false);
  };

  // Animation variants for mobile menu
  const menuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "afterChildren",
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.08,
      },
    },
  };

  const linkVariants = {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-[#050816]/80 border-b border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)]"
            : "bg-transparent"
        }`}
      >
        {/* Starfield Effect when Scrolled */}
        <div
          className={`absolute inset-0 -z-10 pointer-events-none transition-opacity duration-700 ${
            scrolled ? "opacity-25" : "opacity-0"
          } bg-[radial-gradient(circle,rgba(255,255,255,0.33)_1px,transparent_2px)]
            [background-size:2px_2px] animate-starFloat`}
        />
        <div
          className={`absolute inset-0 -z-10 pointer-events-none transition-opacity duration-700 ${
            scrolled ? "opacity-40" : "opacity-0"
          } bg-[radial-gradient(circle,rgba(255,255,255,0.22)_1.2px,transparent_3px)]
            [background-size:4px_4px] animate-starTwinkle`}
        />

        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 md:px-10 py-3 md:py-4">
          {/* LOGO */}
          <NavLink
            to="/"
            className="flex items-center gap-4 select-none ml-2 md:ml-6"
          >
            <motion.div
              whileHover={{ scale: 1.08, rotateX: 6, rotateY: -6, y: -2 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="relative"
            >
              {/* Glow */}
              <div className="absolute inset-0 translate-y-2 blur-xl bg-[radial-gradient(circle,rgba(56,189,248,0.3),transparent_60%)]" />

              {/* Planet */}
              <div className="relative h-10 w-10 md:h-13 md:w-13 flex items-center justify-center">
                {/* Orbit Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 17, ease: "linear" }}
                  className="absolute inset-x-[-7px] inset-y-[6px] rounded-full border border-cyan-300/70 opacity-70 shadow-[0_0_15px_rgba(56,189,248,0.55)]"
                />

                <div
                  className="relative h-9 w-9 md:h-11 md:w-11 rounded-full border border-white/20 overflow-hidden 
                  bg-gradient-to-br from-[#4f46e5] via-[#ec4899] to-[#f97316]
                  shadow-[0_0_26px_rgba(236,72,153,0.75)]"
                >
                  {/* Planet texture */}
                  <div className="absolute inset-x-[-10%] top-2 h-3 bg-white/10 blur-[2px] rounded-full" />
                  <div className="absolute inset-x-[-10%] top-5 h-3 bg-black/15 blur-[3px] rounded-full" />
                  <div className="absolute inset-x-[-10%] top-8 h-3 bg-white/8 blur-[2px] rounded-full" />

                  {/* Highlights */}
                  <div className="absolute -top-2 -left-1 w-6 h-6 bg-[radial-gradient(circle,white,transparent)] opacity-70" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.85),transparent_55%)]" />

                  {/* Initials */}
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-[11px] font-extrabold tracking-[0.22em] text-white drop-shadow-2xl">
                    AKR
                  </span>
                </div>

                {/* Moon */}
                <motion.div
                  animate={{ y: [-2, 3, -2] }}
                  transition={{ repeat: Infinity, duration: 2.3 }}
                  className="absolute top-0 right-0 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-cyan-300 shadow-[0_0_10px_cyan] border border-white/60"
                />
              </div>
            </motion.div>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex gap-6 text-sm">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `relative px-1 py-1 ${
                        isActive ? "text-white" : "text-slate-300 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.label}
                        <span
                          className={`absolute inset-x-0 -bottom-1 mx-auto h-[2px] rounded-full 
                          bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 transition-all duration-300
                          ${isActive ? "w-full" : "w-0"}`}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
              {/* Photos - Admin Only */}
              {isAuthenticated && (
                <li>
                  <NavLink
                    to="/photos"
                    className={({ isActive }) =>
                      `relative px-1 py-1 flex items-center gap-1.5 ${
                        isActive ? "text-white" : "text-slate-300 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Image size={14} />
                        Photos
                        <span
                          className={`absolute inset-x-0 -bottom-1 mx-auto h-[2px] rounded-full 
                          bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 transition-all duration-300
                          ${isActive ? "w-full" : "w-0"}`}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              )}
            </ul>

            <div className="flex items-center gap-3">
              <NavLink
                to="/contact"
                className="px-4 py-2 rounded-full text-white text-xs md:text-sm
                  bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 font-semibold
                  shadow-md shadow-purple-500/40 hover:scale-[1.03] transition-transform flex items-center gap-1.5 justify-center w-25 h-6"
              >
                <Mail size={14} /> Let&apos;s Talk
            </NavLink>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden gap-2 items-center">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 z-50 relative"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
    </header>

    {/* Full-Screen Mobile Menu */}
    <AnimatePresence>
      {open && (
        <motion.div
          variants={menuVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="fixed inset-0 z-40 md:hidden bg-[#050816]/98 backdrop-blur-xl flex flex-col"
        >
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
            <nav className="w-full max-w-sm">
              <ul className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <motion.li key={link.id} variants={linkVariants}>
                    <NavLink
                      to={link.path}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `block w-full text-center py-4 px-6 rounded-2xl text-xl font-medium transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-400/20 text-white border border-purple-500/30"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.li>
                ))}
                {/* Photos - Admin Only */}
                {isAuthenticated && (
                  <motion.li variants={linkVariants}>
                    <NavLink
                      to="/photos"
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `w-full text-center py-4 px-6 rounded-2xl text-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-400/20 text-white border border-purple-500/30"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <Image size={20} />
                      Photos
                    </NavLink>
                  </motion.li>
                )}
              </ul>
            </nav>
          </div>

          {/* Bottom Section - Social & CTA */}
          <motion.div
            variants={linkVariants}
            className="px-6 pb-10 pt-6"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Social Icons */}
              <div className="flex gap-4">
                <a
                  href="https://github.com/abhishek8oo8"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Github size={22} />
                </a>
                <a
                  href="https://linkedin.com/in/abhishek-kumar-r"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Linkedin size={22} />
                </a>
                <a
                  href="mailto:akr393456@gmail.com"
                  className="p-3 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Mail size={22} />
                </a>
              </div>

              {/* CTA Button */}
              <NavLink
                to="/contact"
                onClick={handleLinkClick}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/40"
              >
                <Mail size={18} />
                Let&apos;s Talk
              </NavLink>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}
