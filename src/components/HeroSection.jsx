import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import { motion } from "framer-motion";
import { Sparkles, Zap, Globe, Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

function SkillOrb({ position, color, delay = 0 }) {
  const meshRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.scale.setScalar(hovered ? 1.3 : 1);
    }
  });

  return (
    <Float speed={2 + delay} rotationIntensity={1} floatIntensity={2}>
      <Sphere
        ref={meshRef}
        args={[1, 64, 64]}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={color}
          distort={hovered ? 0.6 : 0.3}
          speed={2}
          roughness={0}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={hovered ? 1.5 : 0.8}
        />
      </Sphere>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function HeroSection({ profile }) {
  const socialLinks = [
    { name: "GitHub", url: profile?.github || "https://github.com/abhishek8oo8", icon: Github },
    { name: "LinkedIn", url: profile?.linkedin || "https://linkedin.com/in/abhishek-kumar-r", icon: Linkedin },
    { name: "Email", url: `mailto:${profile?.email || "akr393456@gmail.com"}`, icon: Mail },
  ];

  // Extract first name from profile name
  const firstName = profile?.name?.split(' ')[0] || 'Abhishek';
  const title = profile?.title || 'Full Stack Developer';

  return (
    <div className="relative w-full">
      {/* 3D Canvas Background - Hidden on small mobile for performance */}
      <div className="absolute inset-0 pointer-events-auto hidden sm:block">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Scene />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 sm:mb-8"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span className="text-xs sm:text-sm font-medium text-purple-300">
              Welcome to my Universe
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-poppins leading-tight mb-4 sm:mb-6"
          >
            <span className="text-white">I&apos;m </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
              {firstName}
            </span>
          </motion.h1>

          {/* Subtitle + text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4 sm:mb-5">
              {title}
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Crafting{" "}
              <span className="text-cyan-400 font-medium">modern web experiences</span> with clean
              code, cutting-edge tech, and a passion for turning ideas into reality.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 sm:mt-10 lg:mt-12"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center lg:justify-start">
              <Link to="/projects" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full font-semibold text-white flex items-center gap-3 justify-center hover:scale-105 transition-all shadow-lg shadow-purple-500/40 border-2 border-pink-300/70">
                  Explore Projects
                  <Zap className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <Link to="/contact" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 border-2 border-purple-500/70 rounded-full font-semibold text-white hover:bg-purple-500/20 transition-all backdrop-blur-md flex items-center gap-3 justify-center">
                  Let&apos;s Talk
                  <Globe className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Social Icons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 sm:mt-10 flex gap-4 sm:gap-6 justify-center lg:justify-start"
          >
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all cursor-pointer border border-white/20"
              >
                <social.icon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
