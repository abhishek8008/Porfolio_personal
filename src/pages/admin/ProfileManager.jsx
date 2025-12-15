import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Upload, Loader2, Github, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import { adminAPI, uploadAPI } from '../../services/api';
import styles from './ProfileManager.module.css';

const ProfileManager = () => {
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    github: '',
    linkedin: '',
    twitter: '',
    profile_pic: '',
    resume_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await adminAPI.getProfile();
      if (response.success && response.profile) {
        setProfile(response.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadProfilePic(file);
      if (response.success) {
        setProfile(prev => ({ ...prev, profile_pic: response.data.url }));
        setMessage({ type: 'success', text: 'Profile picture uploaded!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadResume(file);
      if (response.success) {
        setProfile(prev => ({ ...prev, resume_url: response.data.url }));
        setMessage({ type: 'success', text: 'Resume uploaded!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await adminAPI.updateProfile(profile);
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>
          <User />
          Edit Profile
        </h1>
        <p className={styles.subtitle}>Update your personal information and social links.</p>
      </div>

      {/* Message */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Profile Picture */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Profile Picture</h2>
          <div className={styles.profilePicSection}>
            <div className={styles.avatarWrapper}>
              {profile.profile_pic ? (
                <img 
                  src={profile.profile_pic} 
                  alt="Profile" 
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <User />
                </div>
              )}
              {uploading && (
                <div className={styles.uploadOverlay}>
                  <Loader2 />
                </div>
              )}
            </div>
            <div className={styles.uploadControls}>
              <label className={styles.uploadBtn}>
                <Upload />
                Upload Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
              <p className={styles.uploadHint}>JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className={styles.sectionCard} style={{ marginTop: '1.5rem' }}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="Your full name"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Title / Role</label>
              <input
                type="text"
                name="title"
                value={profile.title || ''}
                onChange={handleChange}
                placeholder="e.g. Full Stack Developer"
                className={styles.input}
              />
            </div>
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Bio</label>
              <textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleChange}
                rows={4}
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className={styles.sectionCard} style={{ marginTop: '1.5rem' }}>
          <h2 className={styles.sectionTitle}>Contact Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={profile.email || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="your@email.com"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Location</label>
              <input
                type="text"
                name="location"
                value={profile.location || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="City, Country"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className={styles.sectionCard} style={{ marginTop: '1.5rem' }}>
          <h2 className={styles.sectionTitle}>Social Links</h2>
          <div className={styles.socialGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>GitHub</label>
              <div className={styles.inputWithIcon}>
                <span className={styles.inputIcon}><Github size={18} /></span>
                <input
                  type="url"
                  name="github"
                  value={profile.github || ''}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className={styles.input}
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>LinkedIn</label>
              <div className={styles.inputWithIcon}>
                <span className={styles.inputIcon}><Linkedin size={18} /></span>
                <input
                  type="url"
                  name="linkedin"
                  value={profile.linkedin || ''}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className={styles.input}
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Twitter</label>
              <div className={styles.inputWithIcon}>
                <span className={styles.inputIcon}><Twitter size={18} /></span>
                <input
                  type="url"
                  name="twitter"
                  value={profile.twitter || ''}
                  onChange={handleChange}
                  placeholder="https://twitter.com/username"
                  className={styles.input}
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resume */}
        <div className={styles.sectionCard} style={{ marginTop: '1.5rem' }}>
          <h2 className={styles.sectionTitle}>Resume</h2>
          <div className={styles.resumeSection}>
            <label className={styles.uploadBtn}>
              <Upload />
              Upload Resume (PDF)
              <input 
                type="file" 
                accept=".pdf" 
                style={{ display: 'none' }}
                onChange={handleResumeUpload}
                disabled={uploading}
              />
            </label>
            {profile.resume_url && (
              <a 
                href={`https://docs.google.com/viewer?url=${encodeURIComponent(profile.resume_url)}&embedded=true`}
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.resumeLink}
              >
                <ExternalLink /> View Current Resume
              </a>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className={styles.submitSection} style={{ marginTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={saving}
            className={styles.submitBtn}
          >
            {saving ? (
              <>
                <Loader2 className={styles.spinner} style={{ width: '18px', height: '18px', border: 'none' }} />
                Saving...
              </>
            ) : (
              <>
                <Save />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileManager;
