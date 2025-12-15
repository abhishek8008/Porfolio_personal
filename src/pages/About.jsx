// src/pages/About.jsx
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { Zap, Palette, Code2, Globe, GraduationCap, Award, ExternalLink, Image, X, Eye } from "lucide-react";
import { publicAPI } from "../services/api";


/* ---------- UNIQUE 3D ORBS FOR EDUCATION ---------- */

function EduOrb({ color, variant = 0 }) {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    groupRef.current.rotation.x = 0.3;
  });

  return (
    <group ref={groupRef}>
      {variant === 0 && (
        <>
          {/* solid core */}
          <mesh>
            <sphereGeometry args={[2.1, 64, 64]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              roughness={0.2}
              metalness={0.4}
            />
          </mesh>
          {/* ring orbit */}
          <mesh rotation={[Math.PI / 3, 0, 0.7]}>
            <torusGeometry args={[3, 0.12, 32, 128]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.7}
              wireframe
            />
          </mesh>
        </>
      )}

      {variant === 1 && (
        <>
          {/* faceted crystal */}
          <mesh>
            <icosahedronGeometry args={[2.3, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.1}
            />
          </mesh>
          {/* inner glow sphere */}
          <mesh scale={1.2}>
            <sphereGeometry args={[1.3, 32, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.9}
              transparent
              opacity={0.25}
            />
          </mesh>
        </>
      )}

      {variant === 2 && (
        <>
          {/* wireframe shell */}
          <mesh>
            <sphereGeometry args={[2.5, 48, 48]} />
            <meshStandardMaterial
              color={color}
              wireframe
              emissive={color}
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* inner core */}
          <mesh scale={0.9} position={[0.3, 0.3, 0]}>
            <sphereGeometry args={[1.5, 48, 48]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.7}
              roughness={0.2}
              metalness={0.6}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

function CertPlanet({ color, variant = 0 }) {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.4;
    groupRef.current.rotation.x = 0.3;
  });

  return (
    <group ref={groupRef}>
      {variant === 0 && (
        <>
          {/* Smooth planet core */}
          <mesh>
            <sphereGeometry args={[2.2, 64, 64]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              metalness={0.5}
              roughness={0.25}
            />
          </mesh>
          {/* Single ring */}
          <mesh rotation={[Math.PI / 3, 0, 0.6]}>
            <torusGeometry args={[3.2, 0.12, 32, 128]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.9}
              wireframe
            />
          </mesh>
        </>
      )}

      {variant === 1 && (
        <>
          {/* Crystal-like planet */}
          <mesh>
            <icosahedronGeometry args={[2.3, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>
          {/* Outer hazy shell */}
          <mesh scale={1.3}>
            <sphereGeometry args={[1.8, 48, 48]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              transparent
              opacity={0.18}
            />
          </mesh>
        </>
      )}

      {variant === 2 && (
        <>
          {/* Wireframe sphere */}
          <mesh>
            <sphereGeometry args={[2.4, 48, 48]} />
            <meshStandardMaterial
              color={color}
              wireframe
              emissive={color}
              emissiveIntensity={0.7}
            />
          </mesh>
          {/* Offset inner core */}
          <mesh position={[0.4, 0.3, 0]}>
            <sphereGeometry args={[1.6, 48, 48]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.7}
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
        </>
      )}

      {variant === 3 && (
        <>
          {/* Base planet */}
          <mesh>
            <sphereGeometry args={[2.1, 64, 64]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              metalness={0.6}
              roughness={0.2}
            />
          </mesh>
          {/* Double rings */}
          <mesh rotation={[Math.PI / 2.5, 0.4, 0]}>
            <torusGeometry args={[3, 0.1, 32, 128]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2.5, 0.4, 1.2]}>
            <torusGeometry args={[2.6, 0.08, 32, 128]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              wireframe
            />
          </mesh>
        </>
      )}
    </group>
  );
}


// Fallback data
const fallbackEducation = [
  {
    title: "Lovely Professional University",
    degree: "B.Tech - Computer Science & Engineering",
    score: "CGPA: 6.65",
    year: "2022 – 2026",
    location: "Phagwara, Punjab",
    color: "#c084fc",
  },
  {
    title: "St Francis De Sales",
    degree: "Intermediate (PCM)",
    score: "77%",
    year: "2022",
    location: "Bengaluru, Karnataka",
    color: "#22d3ee",
  },
  {
    title: "B E S High School",
    degree: "Matriculation",
    score: "78.4%",
    year: "2020",
    location: "Bengaluru, Karnataka",
    color: "#a78bfa",
  },
];

const fallbackCertificates = [
  {
    name: "AI Foundations",
    issuer: "Oracle",
    date: "Oct 2025",
    color: "#ec4899",
    icon: "🤖",
  },
  {
    name: "AWS Cloud Practitioner",
    issuer: "Amazon Web Services",
    date: "Sep 2025",
    color: "#0ea5e9",
    icon: "☁️",
  },
  {
    name: "Social Networks",
    issuer: "IIT Ropar - NPTEL",
    date: "Oct 2024",
    color: "#a78bfa",
    icon: "🌐",
  },
  {
    name: "Programming in C++",
    issuer: "Codio - Coursera",
    date: "Jun 2023",
    color: "#22d3ee",
    icon: "💻",
  },
];

// Color palette for dynamic items
const eduColors = ["#c084fc", "#22d3ee", "#a78bfa", "#ec4899", "#f97316"];
const certColors = ["#ec4899", "#0ea5e9", "#a78bfa", "#22d3ee", "#f97316", "#10b981"];

export default function About() {
  const [education, setEducation] = useState(fallbackEducation);
  const [certificates, setCertificates] = useState(fallbackCertificates);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState(''); // 'image' or 'link'

  const openPreview = (url, type) => {
    setPreviewUrl(url);
    setPreviewType(type);
  };

  const closePreview = () => {
    setPreviewUrl('');
    setPreviewType('');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch education
        const eduResponse = await publicAPI.getEducation();
        if (eduResponse.success && eduResponse.education && eduResponse.education.length > 0) {
          const formattedEdu = eduResponse.education.map((edu, index) => {
            // Format end_date for completion display
            let completionDate = '';
            if (edu.end_date) {
              completionDate = new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
            return {
              title: edu.institution,
              degree: edu.degree,
              score: edu.grade || edu.score || '',
              year: edu.start_year && edu.end_year 
                ? `${edu.start_year} – ${edu.end_year}` 
                : (edu.year || ''),
              location: edu.location || '',
              color: eduColors[index % eduColors.length],
              completionDate: completionDate,
            };
          });
          setEducation(formattedEdu);
        }

        // Fetch certificates
        const certResponse = await publicAPI.getCertificates();
        if (certResponse.success && certResponse.certificates && certResponse.certificates.length > 0) {
          const formattedCerts = certResponse.certificates.map((cert, index) => ({
            name: cert.name || cert.title,
            issuer: cert.issuer,
            date: cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
            color: certColors[index % certColors.length],
            icon: cert.icon || "🏆",
            credential_url: cert.credential_url,
            image_url: cert.image_url,
          }));
          setCertificates(formattedCerts);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section id="about" className="relative min-h-screen overflow-hidden bg-black">
      {/* COSMIC BACKGROUND */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 20], fov: 70 }}>
          <Stars
            radius={400}
            depth={100}
            count={9000}
            factor={8}
            saturation={0}
            fade
            speed={5}
          />
          <ambientLight intensity={0.3} />
          <pointLight position={[20, 20, 10]} intensity={2} color="#c084fc" />
          <pointLight position={[-20, -10, 10]} intensity={1.5} color="#22d3ee" />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20">
        <div className="h-20 md:h-28" />

        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4 }}
          className="text-7xl md:text-9xl font-black bg-clip-text text-transparent
                     bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300
                     drop-shadow-2xl mb-16"
        >
          About Me
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1.2 }}
          className="max-w-4xl space-y-8 text-center"
        >
          <p className="text-2xl md:text-3xl text-gray-100 font-light leading-relaxed">
            Hi, I&apos;m a passionate{" "}
            <span className="text-cyan-400 font-bold">Frontend Developer</span> &{" "}
            <span className="text-purple-400 font-bold">Creative Coder</span> currently
            pursuing B.Tech in Computer Science.
          </p>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
            I love building immersive, high-performance web experiences with modern
            tools like React, Tailwind, Three.js, and Framer Motion.
          </p>
        </motion.div>
<div className="h-5 md:h-8" />
        {/* TRAITS */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="flex flex-wrap justify-center gap-8 md:gap-12 mt-16"
        >
          {[
            { icon: Zap, label: "Performance First", color: "text-yellow-400" },
            { icon: Palette, label: "Pixel Perfect", color: "text-pink-400" },
            { icon: Code2, label: "Clean & Modern", color: "text-purple-400" },
            { icon: Globe, label: "Always Learning", color: "text-cyan-400" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-4 bg-white/5 backdrop-blur-xl
                         border border-white/20 rounded-3xl px-10 py-8 hover:bg-white/10
                         hover:border-purple-400/50 transition-all duration-500 group w-45 h-30 justify-center"
            >
              <item.icon
                className={`w-14 h-14 ${item.color} group-hover:scale-110 transition`}
              />
              <span className="text-gray-100 font-medium text-lg">{item.label}</span>
            </div>
          ))}
        </motion.div>
        <div className="h-20 md:h-15" />
        {/* EDUCATION - 3D UNIQUE ORBS */}
        <div className="w-full max-w-7xl mt-32">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-center mb-20
                       bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400"
          >
            <GraduationCap className="inline w-16 h-16 mr-4" />
            Education
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {education.map((edu, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 + 0.4 }}
                className="relative h-80"
              >
                <Canvas>
                  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
                  <ambientLight intensity={0.6} />
                  <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    color={edu.color}
                  />
                  <EduOrb color={edu.color} variant={i} />
                </Canvas>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none ">
                  <div className="text-center text-white bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/30 w-full h-35 px-4 flex flex-col justify-center">
                    <h4 className="text-2xl font-bold">{edu.title}</h4>
                    <p className="text-lg mt-2">{edu.degree}</p>
                    <p className="text-cyan-300 font-semibold">{edu.score}</p>
                    {edu.completionDate && (
                      <p className="text-xs text-purple-300 mt-1">Completed: {edu.completionDate}</p>
                    )}
                    <p className="text-sm text-gray-300 mt-2">
                      {edu.year} • {edu.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CERTIFICATIONS - MODERN GLASSMORPHIC CARDS */}
        
        <div className="w-full max-w-6xl mt-32 mb-20">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-5xl md:text-6xl font-bold text-center mb-20
                       bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 "
          >
            <Award className="inline w-16 h-16 mr-4" />
            Certifications
          </motion.h3>
<div className="h-20 md:h-5 " />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 justify-items-center ">
            {certificates.map((cert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6, type: "spring" }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group relative w-72 cursor-pointer perspective-1000 "
              >
                {/* Glowing background effect */}
                <div 
                  className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-70 blur-xl transition-all duration-500 "
                  style={{ background: `linear-gradient(135deg, ${cert.color}40, transparent)` }}
                />
                
                {/* Main card */}
                <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500 overflow-hidden w-full min-h-[180px] flex flex-col justify-between">
                  
                  {/* Animated gradient border on hover */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${cert.color}30, transparent, ${cert.color}20)`,
                    }}
                  />
                  
                  {/* Floating particles effect */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                    <div 
                      className="absolute w-2 h-2 rounded-full animate-pulse"
                      style={{ background: cert.color, top: '20%', left: '60%' }}
                    />
                    <div 
                      className="absolute w-1.5 h-1.5 rounded-full animate-pulse delay-300"
                      style={{ background: cert.color, top: '50%', left: '80%' }}
                    />
                    <div 
                      className="absolute w-1 h-1 rounded-full animate-pulse delay-500"
                      style={{ background: cert.color, top: '30%', left: '40%' }}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                    {/* Icon with glow */}
                    <div className="flex justify-center mb-3">
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 3, delay: i * 0.2 }}
                        className="text-3xl"
                        style={{ filter: `drop-shadow(0 0 10px ${cert.color})` }}
                      >
                        {cert.icon}
                      </motion.div>
                    </div>
                    
                    {/* Certificate name */}
                    <h4 className="text-lg font-bold text-white text-center mb-1 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
                        style={{ 
                          backgroundImage: `linear-gradient(135deg, white, ${cert.color})`,
                          WebkitBackgroundClip: 'text',
                        }}>
                      {cert.name}
                    </h4>
                    
                    {/* Issuer */}
                    <p className="text-xs text-gray-400 text-center mb-2">{cert.issuer}</p>
                    
                    {/* Date badge with action buttons */}
                    <div className="flex flex-col items-center gap-2">
                      {cert.date && (
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300"
                          style={{ 
                            borderColor: `${cert.color}50`,
                            color: cert.color,
                            background: `${cert.color}15`
                          }}
                        >
                          {cert.date}
                        </span>
                      )}
                      
                      {/* Action Icons - Always visible, beautiful design */}
                      {(cert.credential_url || cert.image_url) && (
                        <div className="flex items-center justify-center gap-2">
                          {cert.credential_url && (
                            <a
                              href={cert.credential_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-full transition-all duration-300 hover:scale-110"
                              style={{ 
                                background: `${cert.color}20`,
                                border: `1px solid ${cert.color}40`,
                              }}
                              title="View Credential"
                            >
                              <ExternalLink 
                                size={14} 
                                style={{ color: cert.color }}
                                className="drop-shadow-sm"
                              />
                            </a>
                          )}
                          {cert.image_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPreview(cert.image_url, 'image');
                              }}
                              className="p-1.5 rounded-full transition-all duration-300 hover:scale-110"
                              style={{ 
                                background: `${cert.color}20`,
                                border: `1px solid ${cert.color}40`,
                              }}
                              title="View Certificate Image"
                            >
                              <Image 
                                size={14} 
                                style={{ color: cert.color }}
                                className="drop-shadow-sm"
                              />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${cert.color}, transparent)` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="h-8 md:h-9 " />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1.2 }}
          className="text-3xl md:text-4xl text-gray-200 text-center mt-20"
        >
          Ready to build something{" "}
          <a
            href="#contact"
            className="font-bold text-transparent bg-clip-text
                       bg-gradient-to-r from-cyan-400 to-purple-400
                       underline underline-offset-8 hover:from-purple-400 hover:to-pink-400
                       transition-all duration-500"
          >
            extraordinary
          </a>{" "}
          together?
        </motion.p>

        <div className="h-15" />
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/95">
                <h3 className="flex items-center gap-2 text-white font-semibold">
                  <Eye size={20} className="text-purple-400" />
                  {previewType === 'image' ? 'Certificate Image' : 'Credential'}
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all"
                  >
                    <ExternalLink size={14} />
                    Open Original
                  </a>
                  <button
                    onClick={closePreview}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="relative w-full h-[70vh] bg-gray-800">
                {previewType === 'image' ? (
                  <img
                    src={previewUrl}
                    alt="Certificate"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Credential Preview"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
