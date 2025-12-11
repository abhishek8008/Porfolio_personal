import { useEffect, useState } from 'react';

const SpaceBackground = () => {
  const [shootingStars, setShootingStars] = useState([]);

  // Generate shooting stars periodically
  useEffect(() => {
    const createShootingStar = () => {
      const id = Date.now();
      const star = {
        id,
        top: Math.random() * 50 + '%',
        left: Math.random() * 100 + '%',
        duration: Math.random() * 1 + 0.5,
        delay: 0,
      };
      setShootingStars(prev => [...prev, star]);
      
      // Remove after animation
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== id));
      }, 2000);
    };

    // Create shooting star every 3-6 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.5) createShootingStar();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Layer 1: Deep space gradient base */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #030712 0%, #0f172a 40%, #1e1b4b 70%, #0f172a 90%, #030712 100%)'
        }}
      />
      
      {/* Layer 2: Nebula effects */}
      <div 
        className="absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full opacity-20 animate-nebula-float"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      
      <div 
        className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full opacity-25 animate-nebula-float-reverse"
        style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      <div 
        className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-15 animate-nebula-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Layer 3: Static stars */}
      <div className="absolute inset-0">
        <div className="stars-small" />
        <div className="stars-medium" />
        <div className="stars-large" />
      </div>

      {/* Layer 4: Moving/Twinkling stars */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={`twinkle-${i}`}
            className="absolute rounded-full bg-white animate-twinkle-star"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 3 + 2 + 's',
            }}
          />
        ))}
      </div>

      {/* Layer 5: Floating/Drifting stars */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={`drift-${i}`}
            className="absolute rounded-full bg-white/80 animate-star-drift"
            style={{
              width: Math.random() * 1.5 + 0.5 + 'px',
              height: Math.random() * 1.5 + 0.5 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 10 + 's',
              animationDuration: Math.random() * 20 + 30 + 's',
            }}
          />
        ))}
      </div>

      {/* Layer 6: Shooting stars */}
      {shootingStars.map(star => (
        <div
          key={star.id}
          className="absolute h-px animate-shooting-star"
          style={{
            top: star.top,
            left: star.left,
            width: '100px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4), transparent)',
            animationDuration: star.duration + 's',
            transform: 'rotate(-45deg)',
          }}
        />
      ))}

      {/* Subtle vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(3, 7, 18, 0.5) 100%)'
        }}
      />
    </div>
  );
};

export default SpaceBackground;
