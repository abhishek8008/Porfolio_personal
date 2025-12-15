import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Skills from './pages/Skills';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import DashboardHome from './pages/admin/DashboardHome';
import ProfileManager from './pages/admin/ProfileManager';
import ProjectsManager from './pages/admin/ProjectsManager';
import CertificatesManager from './pages/admin/CertificatesManager';
import SkillsManager from './pages/admin/SkillsManager';
import EducationManager from './pages/admin/EducationManager';
import MessagesManager from './pages/admin/MessagesManager';
import { Mail, BarChart3 } from 'lucide-react';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/skills" element={<Layout><Skills /></Layout>} />
      <Route path="/projects" element={<Layout><Projects /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        {/* Nested Admin Routes */}
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<ProfileManager />} />
        <Route path="skills" element={<SkillsManager />} />
        <Route path="projects" element={<ProjectsManager />} />
        <Route path="certificates" element={<CertificatesManager />} />
        <Route path="education" element={<EducationManager />} />
        <Route path="messages" element={<MessagesManager />} />
        <Route path="stats" element={<StatsManager />} />
      </Route>
    </Routes>
  );
}

// Styled placeholder components for admin sections
const PlaceholderPage = ({ title, subtitle, Icon }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
    <div>
      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#ffffff',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        letterSpacing: '-0.025em'
      }}>
        {Icon && <Icon size={28} color="#f97316" />}
        {title}
      </h1>
      <p style={{
        color: '#9ca3af',
        margin: '0.5rem 0 0 0',
        fontSize: '0.95rem'
      }}>{subtitle}</p>
    </div>
    <div style={{
      background: 'rgba(30, 30, 45, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '1rem',
      padding: '3rem',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: 'rgba(249, 115, 22, 0.1)',
        borderRadius: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem'
      }}>
        {Icon && <Icon size={40} color="#f97316" />}
      </div>
      <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
        Coming Soon
      </h3>
      <p style={{ color: '#6b7280', margin: 0 }}>
        This feature is being built. Check back soon!
      </p>
    </div>
  </div>
);

const StatsManager = () => (
  <PlaceholderPage 
    title="Analytics" 
    subtitle="Track your portfolio's performance and visitors"
    Icon={BarChart3}
  />
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
