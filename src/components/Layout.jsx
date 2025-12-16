import Navbar from './Navbar';
import Footer from './Footer';
import SpaceBackground from './SpaceBackground';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Global Space Background */}
      <SpaceBackground />
      
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-18 md:pt-20 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
