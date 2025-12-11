const ProfileSection = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <div className="absolute w-[320px] h-[320px] md:w-[400px] md:h-[400px] rounded-full border border-primary/20 animate-pulse" />
      <div className="absolute w-[360px] h-[360px] md:w-[450px] md:h-[450px] rounded-full border border-secondary/10" />
      <div className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full border border-accent/5" />
      
      {/* Rotating gradient ring */}
      <div 
        className="absolute w-[280px] h-[280px] md:w-[350px] md:h-[350px] rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(99, 102, 241, 0.3), transparent, rgba(168, 85, 247, 0.3), transparent)',
          animation: 'spin 8s linear infinite',
        }}
      />
      
      {/* Profile image container */}
      <div className="relative z-10">
        {/* Glowing background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl scale-110" />
        
        {/* Image wrapper with border */}
        <div className="relative w-[250px] h-[250px] md:w-[320px] md:h-[320px] rounded-full p-1 bg-gradient-to-br from-primary via-secondary to-accent">
          <div className="w-full h-full rounded-full overflow-hidden bg-dark-light">
            {/* Profile Image - Replace src with your actual image */}
            <img
              src="/profile.jpg"
              alt="Abhishek Kumar R"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image doesn't load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback - Initials */}
            <div 
              className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20"
              style={{ display: 'none' }}
            >
              <span className="text-6xl md:text-8xl font-bold gradient-text font-poppins">AK</span>
            </div>
          </div>
        </div>
        
        {/* Floating badges */}
        <div className="absolute -top-2 -right-2 md:top-0 md:right-0 px-3 py-1.5 bg-primary/90 rounded-full text-xs font-medium text-white shadow-lg shadow-primary/30 animate-bounce">
          👋 Hello!
        </div>
        
        <div className="absolute -bottom-2 -left-2 md:bottom-4 md:-left-4 px-3 py-1.5 bg-secondary/90 rounded-full text-xs font-medium text-white shadow-lg shadow-secondary/30">
          💻 Open to Work
        </div>
        
        <div className="absolute top-1/2 -right-8 md:-right-12 transform -translate-y-1/2 px-3 py-1.5 bg-accent/90 rounded-full text-xs font-medium text-white shadow-lg shadow-accent/30">
          🚀 Developer
        </div>
      </div>
      
      {/* Decorative dots */}
      <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-primary animate-ping" />
      <div className="absolute bottom-20 right-10 w-3 h-3 rounded-full bg-secondary animate-pulse" />
      <div className="absolute top-1/3 right-5 w-2 h-2 rounded-full bg-accent animate-ping" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-10 left-20 w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  );
};

export default ProfileSection;
