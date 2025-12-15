import HeroSection from '../components/HeroSection';
import SolarSystem from '../components/SolarSystem';
import profileImg from '../assets/image.png';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { publicAPI } from '../services/api';

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await publicAPI.getProfile();
        if (response.success && response.profile) {
          setProfile(response.profile);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 25;
    const y = (e.clientY - rect.top - rect.height / 2) / 25;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Solar System as background overlay - centered */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="opacity-30 scale-[1.2] md:scale-[1.5] lg:scale-[1.8]">
          <SolarSystem />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 xl:gap-32 items-center min-h-screen py-20 lg:py-0">
          
          {/* Left Side - Profile Circle with 3D effect */}
          <div className="order-2 lg:order-1 flex items-center justify-center">
            <motion.div 
              className="relative"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Animated glow rings */}
              <motion.div 
                className="absolute -inset-8 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 60px rgba(99, 102, 241, 0.3), 0 0 120px rgba(139, 92, 246, 0.2)',
                    '0 0 80px rgba(139, 92, 246, 0.4), 0 0 140px rgba(236, 72, 153, 0.3)',
                    '0 0 60px rgba(99, 102, 241, 0.3), 0 0 120px rgba(139, 92, 246, 0.2)',
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Rotating border ring */}
              <motion.div
                className="absolute -inset-3 rounded-full border-2 border-dashed border-indigo-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              {/* 3D Profile container */}
              <motion.div 
                className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] lg:w-[400px] lg:h-[400px] rounded-full p-[4px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
                style={{
                  transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
                  transformStyle: 'preserve-3d',
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/20 via-transparent to-pink-400/20" />
                
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 shadow-2xl">
                  <motion.img 
                    src={profile?.profile_pic || profileImg} 
                    alt={profile?.name || "Abhishek Kumar R"} 
                    className="w-full h-full object-cover"
                    style={{
                      transform: `translateZ(50px) scale(1.05)`,
                    }}
                  />
                </div>
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
                  }}
                  animate={{
                    backgroundPosition: ['200% 0', '-200% 0'],
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                />
              </motion.div>
              
              {/* Floating badges around profile */}
              <motion.div 
                className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/90 backdrop-blur-md rounded-full border border-indigo-400/40 shadow-lg shadow-indigo-500/10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-indigo-300 text-sm font-medium flex items-center gap-1.5">
                  <span>🚀</span> Developer
                </span>
              </motion.div>
              
              <motion.div 
                className="absolute top-1/4 -right-4 sm:-right-8 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-full border border-sky-400/40 shadow-lg shadow-sky-500/10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <span className="text-sky-300 text-xs flex items-center gap-1">
                  <span>⚛️</span> React
                </span>
              </motion.div>
              
              <motion.div 
                className="absolute top-1/2 -left-4 sm:-left-8 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-full border border-green-400/40 shadow-lg shadow-green-500/10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <span className="text-green-300 text-xs flex items-center gap-1">
                  <span>🐍</span> Python
                </span>
              </motion.div>
              
              <motion.div 
                className="absolute bottom-1/4 -right-4 sm:-right-8 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-full border border-yellow-400/40 shadow-lg shadow-yellow-500/10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                <span className="text-yellow-300 text-xs flex items-center gap-1">
                  <span>✨</span> JavaScript
                </span>
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-full border border-orange-400/40 shadow-lg shadow-orange-500/10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <span className="text-orange-300 text-xs flex items-center gap-1">
                  <span>🗄️</span> SQL
                </span>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Right Side - Welcome Message */}
          <div className="order-1 lg:order-2 flex items-center justify-center lg:justify-center">
            <HeroSection profile={profile} />
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 animate-bounce z-10">
        <span className="text-light-muted text-xs tracking-wider">SCROLL</span>
        <div className="w-5 h-8 border-2 border-light-muted rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-light-muted rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Home;
