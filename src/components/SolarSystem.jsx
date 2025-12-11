const SolarSystem = () => {
  // Planets data - representing your skills/technologies
  const planets = [
    { 
      name: 'React', 
      color: '#61DAFB', 
      size: 28, 
      orbitSize: 140, 
      duration: 15,
      icon: '⚛️'
    },
    { 
      name: 'Python', 
      color: '#3776AB', 
      size: 24, 
      orbitSize: 190, 
      duration: 20,
      icon: '🐍'
    },
    { 
      name: 'JavaScript', 
      color: '#F7DF1E', 
      size: 22, 
      orbitSize: 240, 
      duration: 25,
      icon: '✨'
    },
    { 
      name: 'SQL', 
      color: '#00758F', 
      size: 20, 
      orbitSize: 290, 
      duration: 30,
      icon: '🗄️'
    },
    { 
      name: 'Tailwind', 
      color: '#06B6D4', 
      size: 18, 
      orbitSize: 340, 
      duration: 35,
      icon: '🎨'
    },
    { 
      name: 'Git', 
      color: '#F05032', 
      size: 16, 
      orbitSize: 385, 
      duration: 40,
      icon: '📦'
    },
  ];

  return (
    <div className="solar-system-container relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
      {/* The Sun - Center */}
      <div className="absolute z-20">
        {/* Outer glow - very subtle */}
        <div className="absolute inset-0 w-[60px] h-[60px] md:w-[80px] md:h-[80px] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-yellow-500/20 blur-xl" />
        
        {/* Sun core */}
        <div className="sun-core relative w-[35px] h-[35px] md:w-[45px] md:h-[45px] rounded-full flex items-center justify-center">
          {/* Sun gradient */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #FDE047 0%, #FACC15 50%, #F97316 100%)',
              boxShadow: '0 0 15px rgba(250, 204, 21, 0.5)'
            }}
          />
        </div>
      </div>

      {/* Orbit rings and Planets */}
      {planets.map((planet, index) => (
        <div key={planet.name} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Orbit ring */}
          <div
            className="orbit-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]"
            style={{
              width: `${planet.orbitSize}px`,
              height: `${planet.orbitSize}px`,
            }}
          />

          {/* Planet container - rotating */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: `${planet.orbitSize}px`,
              height: `${planet.orbitSize}px`,
              marginLeft: `-${planet.orbitSize / 2}px`,
              marginTop: `-${planet.orbitSize / 2}px`,
              animation: `orbit ${planet.duration}s linear infinite`,
              animationDelay: `${index * -3}s`
            }}
          >
            {/* The Planet - smaller and more subtle */}
            <div
              className="planet absolute"
              style={{
                width: `${planet.size * 0.7}px`,
                height: `${planet.size * 0.7}px`,
                top: '0',
                left: '50%',
                marginLeft: `-${(planet.size * 0.7) / 2}px`,
                marginTop: `-${(planet.size * 0.7) / 2}px`,
                background: `radial-gradient(circle at 30% 30%, ${planet.color}aa, ${planet.color}55 70%, ${planet.color}22 100%)`,
                borderRadius: '50%',
                boxShadow: `0 0 8px ${planet.color}33`,
                animation: `counter-orbit ${planet.duration}s linear infinite`,
                animationDelay: `${index * -3}s`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SolarSystem;
