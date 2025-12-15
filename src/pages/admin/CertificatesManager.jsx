import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Plus, Edit3, Trash2, Save, X, Upload, 
  Loader2, ExternalLink, Calendar, Building2 
} from 'lucide-react';
import { adminAPI, uploadAPI } from '../../services/api';
import styles from './CertificatesManager.module.css';

const CertificatesManager = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const emptyCert = {
    title: '',
    issuer: '',
    issue_date: '',
    credential_url: '',
    image_url: '',
    description: ''
  };

  const [formData, setFormData] = useState(emptyCert);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await adminAPI.getCertificates();
      if (response.success) {
        setCertificates(response.certificates || []);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      setMessage({ type: 'error', text: 'Failed to load certificates' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      if (response.success) {
        setFormData(prev => ({ ...prev, image_url: response.data.url }));
        setMessage({ type: 'success', text: 'Image uploaded!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenModal = (cert = null) => {
    if (cert) {
      setEditingCert(cert);
      setFormData({
        ...cert,
        issue_date: cert.issue_date ? cert.issue_date.split('T')[0] : ''
      });
    } else {
      setEditingCert(null);
      setFormData(emptyCert);
    }
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCert(null);
    setFormData(emptyCert);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let response;
      if (editingCert) {
        response = await adminAPI.updateCertificate(editingCert.id, formData);
      } else {
        response = await adminAPI.addCertificate(formData);
      }

      if (response.success) {
        setMessage({ type: 'success', text: `Certificate ${editingCert ? 'updated' : 'created'} successfully!` });
        fetchCertificates();
        setTimeout(() => handleCloseModal(), 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
      const response = await adminAPI.deleteCertificate(id);
      if (response.success) {
        setCertificates(prev => prev.filter(c => c.id !== id));
        setMessage({ type: 'success', text: 'Certificate deleted successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <Award />
            Certificates Manager
          </h1>
          <p className={styles.subtitle}>Display your achievements and certifications</p>
        </div>
        <button className={styles.addButton} onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Add Certificate
        </button>
      </div>

      {/* Message */}
      {message.text && !showModal && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Certificates Grid */}
      <div className={styles.certsGrid}>
        {certificates.length === 0 ? (
          <div className={styles.emptyState}>
            <Award size={48} />
            <h3>No certificates yet</h3>
            <p>Add your first certificate to showcase your achievements</p>
            <button className={styles.addButton} onClick={() => handleOpenModal()}>
              <Plus size={20} />
              Add Certificate
            </button>
          </div>
        ) : (
          certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={styles.certCard}
            >
              <div className={styles.certIcon}>
                <Award size={32} />
              </div>
              
              <div className={styles.certContent}>
                <h3 className={styles.certTitle}>{cert.title}</h3>
                
                <div className={styles.certMeta}>
                  <span className={styles.certIssuer}>
                    <Building2 size={14} />
                    {cert.issuer}
                  </span>
                  {cert.issue_date && (
                    <span className={styles.certDate}>
                      <Calendar size={14} />
                      {formatDate(cert.issue_date)}
                    </span>
                  )}
                </div>

                {cert.description && (
                  <p className={styles.certDescription}>
                    {cert.description.substring(0, 80)}
                    {cert.description.length > 80 && '...'}
                  </p>
                )}

                {cert.credential_url && (
                  <a 
                    href={cert.credential_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.credentialLink}
                  >
                    <ExternalLink size={14} />
                    View Credential
                  </a>
                )}
              </div>

              <div className={styles.certActions}>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleOpenModal(cert)}
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(cert.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={styles.modal}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>{editingCert ? 'Edit Certificate' : 'Add New Certificate'}</h2>
                <button className={styles.closeButton} onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              {message.text && (
                <div className={`${styles.alert} ${styles.modalAlert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Image Upload */}
                <div className={styles.imageUpload}>
                  <div className={styles.imagePreview}>
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" />
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <Award size={32} />
                        <span>Certificate Image</span>
                      </div>
                    )}
                    {uploading && (
                      <div className={styles.uploadOverlay}>
                        <Loader2 className={styles.spinnerIcon} />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                    id="certImage"
                  />
                  <label htmlFor="certImage" className={styles.uploadButton}>
                    <Upload size={16} />
                    {formData.image_url ? 'Change Image' : 'Upload Image'}
                  </label>
                </div>

                {/* Title */}
                <div className={styles.formGroup}>
                  <label htmlFor="title">Certificate Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="AWS Cloud Practitioner"
                  />
                </div>

                {/* Issuer */}
                <div className={styles.formGroup}>
                  <label htmlFor="issuer">
                    <Building2 size={14} /> Issuing Organization *
                  </label>
                  <input
                    type="text"
                    id="issuer"
                    name="issuer"
                    value={formData.issuer}
                    onChange={handleChange}
                    required
                    placeholder="Amazon Web Services"
                  />
                </div>

                {/* Issue Date & Credential URL */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="issue_date">
                      <Calendar size={14} /> Issue Date
                    </label>
                    <input
                      type="date"
                      id="issue_date"
                      name="issue_date"
                      value={formData.issue_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="credential_url">
                      <ExternalLink size={14} /> Credential URL
                    </label>
                    <input
                      type="url"
                      id="credential_url"
                      name="credential_url"
                      value={formData.credential_url}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Description */}
                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief description of the certification"
                  />
                </div>

                {/* Submit */}
                <div className={styles.formActions}>
                  <button type="button" onClick={handleCloseModal} className={styles.cancelButton}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className={styles.submitButton}>
                    {saving ? (
                      <>
                        <Loader2 className={styles.spinnerIcon} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {editingCert ? 'Update Certificate' : 'Add Certificate'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificatesManager;
