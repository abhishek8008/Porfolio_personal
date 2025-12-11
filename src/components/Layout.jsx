import Navbar from './Navbar';
import Footer from './Footer';
import SpaceBackground from './SpaceBackground';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global Space Background */}
      <SpaceBackground />
      
      <Navbar />
      <main className="flex-grow pt-16 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
