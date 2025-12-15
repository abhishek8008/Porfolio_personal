import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Plus, Edit3, Trash2, Save, X, 
  Loader2, Calendar, MapPin, Award 
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import styles from './EducationManager.module.css';

const EducationManager = () => {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const emptyEdu = {
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    grade: '',
    description: '',
    logo_url: ''
  };

  const [formData, setFormData] = useState(emptyEdu);

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      const response = await adminAPI.getEducation();
      if (response.success) {
        setEducation(response.education || []);
      }
    } catch (error) {
      console.error('Failed to fetch education:', error);
      setMessage({ type: 'error', text: 'Failed to load education' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (edu = null) => {
    if (edu) {
      setEditingEdu(edu);
      setFormData({
        ...edu,
        start_date: edu.start_date ? edu.start_date.split('T')[0] : '',
        end_date: edu.end_date ? edu.end_date.split('T')[0] : ''
      });
    } else {
      setEditingEdu(null);
      setFormData(emptyEdu);
    }
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEdu(null);
    setFormData(emptyEdu);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let response;
      if (editingEdu) {
        response = await adminAPI.updateEducation(editingEdu.id, formData);
      } else {
        response = await adminAPI.addEducation(formData);
      }

      if (response.success) {
        setMessage({ type: 'success', text: editingEdu ? 'Education updated!' : 'Education added!' });
        fetchEducation();
        setTimeout(() => handleCloseModal(), 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this education entry?')) return;

    try {
      const response = await adminAPI.deleteEducation(id);
      if (response.success) {
        setEducation(prev => prev.filter(e => e.id !== id));
        setMessage({ type: 'success', text: 'Education deleted!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} />
        <p>Loading education...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <GraduationCap className={styles.titleIcon} />
            Education
          </h1>
          <p className={styles.subtitle}>Manage your educational background</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal()}
          className={styles.addButton}
        >
          <Plus size={20} />
          Add Education
        </motion.button>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`${styles.message} ${styles[message.type]}`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Education List */}
      <div className={styles.eduList}>
        {education.length === 0 ? (
          <div className={styles.emptyState}>
            <GraduationCap size={48} />
            <h3>No Education Added</h3>
            <p>Add your educational qualifications to showcase your background</p>
          </div>
        ) : (
          education.map((edu, index) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={styles.eduCard}
            >
              <div className={styles.eduHeader}>
                <div className={styles.eduIcon}>
                  <GraduationCap size={24} />
                </div>
                <div className={styles.eduInfo}>
                  <h3 className={styles.institution}>{edu.institution}</h3>
                  <p className={styles.degree}>{edu.degree}</p>
                  {edu.field_of_study && (
                    <p className={styles.field}>{edu.field_of_study}</p>
                  )}
                </div>
                <div className={styles.actions}>
                  <button
                    onClick={() => handleOpenModal(edu)}
                    className={styles.editBtn}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className={styles.eduMeta}>
                <span className={styles.metaItem}>
                  <Calendar size={14} />
                  {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                </span>
                {edu.grade && (
                  <span className={styles.metaItem}>
                    <Award size={14} />
                    {edu.grade}
                  </span>
                )}
              </div>

              {edu.description && (
                <p className={styles.description}>{edu.description}</p>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.modalOverlay}
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={styles.modal}
            >
              <div className={styles.modalHeader}>
                <h2>{editingEdu ? 'Edit Education' : 'Add Education'}</h2>
                <button onClick={handleCloseModal} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Institution *</label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Stanford University"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Degree *</label>
                    <input
                      type="text"
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      required
                      placeholder="e.g., B.Tech, MBA"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Field of Study</label>
                    <input
                      type="text"
                      name="field_of_study"
                      value={formData.field_of_study}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Start Date *</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      placeholder="Leave empty if current"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Grade/Score</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    placeholder="e.g., CGPA: 8.5, 85%"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional details about your education"
                  />
                </div>

                {/* Message in Modal */}
                {message.text && (
                  <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                  </div>
                )}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={styles.submitBtn}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={18} className={styles.spinnerBtn} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {editingEdu ? 'Update' : 'Add'} Education
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationManager;
