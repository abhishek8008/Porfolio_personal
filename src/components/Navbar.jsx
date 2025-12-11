import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Sun, Moon, Github, Linkedin, Mail } from "lucide-react";

const navLinks = [
  { id: "home", label: "Home", path: "/" },
  { id: "about", label: "About", path: "/about" },
  { id: "skills", label: "Skills", path: "/skills" },
  { id: "projects", label: "Projects", path: "/projects" },
  { id: "contact", label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") || "dark"
  );
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-[#050816]/80 border-b border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)]"
          : "bg-transparent"
      }`}
    >
      {/* ⭐ Starfield Effect when Scrolled */}
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

      {/* ⬇️ px-10 here to move everything a bit right */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-10 py-3 md:py-4">
        {/* LOGO — Planet + Orbit (moved right via inline marginLeft) */}
        <NavLink
          to="/"
          className="flex items-center gap-4 select-none"
          style={{ marginLeft: "24px" }} // ⬅ move logo block further right
          
        >
          <motion.div
            whileHover={{ scale: 1.08, rotateX: 6, rotateY: -6, y: -2 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute inset-0 translate-y-2 blur-xl bg-[radial-gradient(circle,rgba(56,189,248,0.3),transparent_60%)]" />

            {/* Planet */}
            <div className="relative h-13 w-13 flex items-center justify-center">
              {/* Orbit Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 17, ease: "linear" }}
                className="absolute inset-x-[-7px] inset-y-[6px] rounded-full border border-cyan-300/70 opacity-70 shadow-[0_0_15px_rgba(56,189,248,0.55)]"
              />

              <div
                className="relative h-11 w-11 rounded-full border border-white/20 overflow-hidden 
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
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold tracking-[0.22em] text-white drop-shadow-2xl">
                  AKR
                </span>
              </div>

              {/* Moon */}
              <motion.div
                animate={{ y: [-2, 3, -2] }}
                transition={{ repeat: Infinity, duration: 2.3 }}
                className="absolute top-0 right-0 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_10px_cyan] border border-white/60"
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
          </ul>

          <div className="flex items-center gap-3">
            <NavLink
              to="/contact"
              className="px-4 py-2 rounded-full text-white text-xs md:text-sm
                bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 font-semibold
                shadow-md shadow-purple-500/40 hover:scale-[1.03] transition-transform flex items-center gap-1.5 w-25 h-6 justify-center"
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
        <div className="flex md:hidden gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mx-3 mb-3 p-4 rounded-2xl border border-white/10 bg-[#050816]/95 backdrop-blur-xl">
          <ul className="flex flex-col gap-2 text-slate-100 text-sm">
            {navLinks.map((link) => (
              <li key={link.id}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-xl ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-400/20 border border-white/10"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <a
                href="https://github.com/abhishek8oo8"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
              >
                <Github size={18} />
              </a>
              <a
                href="https://linkedin.com/in/abhishek-kumar-r"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
              >
                <Linkedin size={18} />
              </a>
            </div>

            <NavLink
              to="/contact"
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-500/40"
            >
              <Mail size={14} />
              Let&apos;s Talk
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
