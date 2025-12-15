import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  MessageSquare, 
  FolderOpen, 
  Award,
  TrendingUp,
  Clock,
  User
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import styles from './DashboardHome.module.css';

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Visits',
      value: stats?.totalVisits || 0,
      icon: Eye,
      colorClass: 'Blue',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    {
      title: 'Unread Messages',
      value: stats?.unreadMessages || 0,
      icon: MessageSquare,
      colorClass: 'Green',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    },
    {
      title: 'Projects',
      value: stats?.pageStats?.length || 5,
      icon: FolderOpen,
      colorClass: 'Purple',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
    },
    {
      title: 'Certificates',
      value: stats?.certificates || 0,
      icon: Award,
      colorClass: 'Orange',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
    }
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome back! Here's an overview of your portfolio.</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={styles.statCard}
              style={{ '--gradient': stat.gradient }}
            >
              <div className={styles.statCardHeader}>
                <div className={`${styles.statIconWrapper} ${styles[`bg${stat.colorClass}`]}`}>
                  <Icon className={styles[`icon${stat.colorClass}`]} />
                </div>
                <TrendingUp className={styles.trendIcon} size={16} />
              </div>
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Page Stats */}
      {stats?.pageStats && stats.pageStats.length > 0 && (
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            <Eye /> Page Views
          </h2>
          <div className={styles.pageStatsList}>
            {stats.pageStats.map((page) => (
              <div key={page.page} className={styles.pageStatItem}>
                <div className={styles.pageStatName}>
                  <div className={styles.pageStatDot} />
                  <span>{page.page}</span>
                </div>
                <div className={styles.pageStatMeta}>
                  <span className={styles.pageStatViews}>{page.visits} views</span>
                  <span className={styles.pageStatDate}>
                    <Clock />
                    {page.last_visit ? new Date(page.last_visit).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          <Link to="/admin/projects" className={styles.quickAction}>
            <FolderOpen className={styles.iconPurple} />
            <span>Add Project</span>
          </Link>
          <Link to="/admin/certificates" className={styles.quickAction}>
            <Award className={styles.iconOrange} />
            <span>Add Certificate</span>
          </Link>
          <Link to="/admin/messages" className={styles.quickAction}>
            <MessageSquare className={styles.iconGreen} />
            <span>View Messages</span>
          </Link>
          <Link to="/admin/profile" className={styles.quickAction}>
            <User className={styles.iconBlue} />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
