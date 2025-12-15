import { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Code2, 
  FolderOpen, 
  Award, 
  GraduationCap,
  Mail, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Settings,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminDashboard.module.css';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/profile', icon: User, label: 'Profile' },
  { path: '/admin/skills', icon: Code2, label: 'Skills' },
  { path: '/admin/projects', icon: FolderOpen, label: 'Projects' },
  { path: '/admin/certificates', icon: Award, label: 'Certificates' },
  { path: '/admin/education', icon: GraduationCap, label: 'Education' },
  { path: '/admin/messages', icon: Mail, label: 'Messages' },
  { path: '/admin/stats', icon: BarChart3, label: 'Analytics' },
];

const AdminDashboard = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Background Effects */}
      <div className={styles.backgroundEffects}>
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
        <div className={styles.glowOrb3} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Logo */}
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeaderInner}>
            <Link to="/" className={styles.logoLink}>
              <div className={styles.logoIcon}>
                <Settings />
              </div>
              <span className={styles.logoText}>Admin Panel</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className={styles.closeSidebar}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path) && !item.exact;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.name || 'Admin'}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Top Bar */}
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <button
              onClick={() => setSidebarOpen(true)}
              className={styles.menuBtn}
            >
              <Menu size={24} />
            </button>
            <Link to="/" target="_blank" className={styles.viewSiteLink}>
              View Site <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};


export default AdminDashboard;
