import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, Plus, Edit3, Trash2, Save, X, Upload, 
  Loader2, ExternalLink, Github, Star, GripVertical 
} from 'lucide-react';
import { adminAPI, uploadAPI } from '../../services/api';
import styles from './ProjectsManager.module.css';

const ProjectsManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const emptyProject = {
    title: '',
    description: '',
    long_description: '',
    image_url: '',
    tech_stack: [],
    github_url: '',
    live_url: '',
    featured: false,
    display_order: 0
  };

  const [formData, setFormData] = useState(emptyProject);
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await adminAPI.getProjects();
      if (response.success) {
        setProjects(response.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setMessage({ type: 'error', text: 'Failed to load projects' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTech = (e) => {
    e.preventDefault();
    if (techInput.trim() && !formData.tech_stack.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }));
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

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        ...project,
        tech_stack: project.tech_stack || []
      });
    } else {
      setEditingProject(null);
      setFormData({ ...emptyProject, display_order: projects.length });
    }
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData(emptyProject);
    setTechInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let response;
      if (editingProject) {
        response = await adminAPI.updateProject(editingProject.id, formData);
      } else {
        response = await adminAPI.addProject(formData);
      }

      if (response.success) {
        setMessage({ type: 'success', text: `Project ${editingProject ? 'updated' : 'created'} successfully!` });
        fetchProjects();
        setTimeout(() => handleCloseModal(), 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await adminAPI.deleteProject(id);
      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        setMessage({ type: 'success', text: 'Project deleted successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const toggleFeatured = async (project) => {
    try {
      const response = await adminAPI.updateProject(project.id, {
        ...project,
        featured: !project.featured
      });
      if (response.success) {
        fetchProjects();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
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
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <FolderOpen />
            Projects Manager
          </h1>
          <p className={styles.subtitle}>Showcase your best work and projects</p>
        </div>
        <button className={styles.addButton} onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Add Project
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

      {/* Projects Grid */}
      <div className={styles.projectsGrid}>
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <FolderOpen size={48} />
            <h3>No projects yet</h3>
            <p>Add your first project to showcase your work</p>
            <button className={styles.addButton} onClick={() => handleOpenModal()}>
              <Plus size={20} />
              Add Project
            </button>
          </div>
        ) : (
          projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={styles.projectCard}
            >
              <div className={styles.projectImage}>
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <FolderOpen size={32} />
                  </div>
                )}
                {project.featured && (
                  <span className={styles.featuredBadge}>
                    <Star size={12} /> Featured
                  </span>
                )}
              </div>
              
              <div className={styles.projectContent}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.projectDescription}>
                  {project.description?.substring(0, 100)}
                  {project.description?.length > 100 && '...'}
                </p>
                
                <div className={styles.techStack}>
                  {(project.tech_stack || []).slice(0, 4).map((tech, i) => (
                    <span key={i} className={styles.techTag}>{tech}</span>
                  ))}
                  {(project.tech_stack || []).length > 4 && (
                    <span className={styles.techTag}>+{project.tech_stack.length - 4}</span>
                  )}
                </div>

                <div className={styles.projectLinks}>
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                      <Github size={16} />
                    </a>
                  )}
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>

              <div className={styles.projectActions}>
                <button 
                  className={`${styles.actionButton} ${project.featured ? styles.featured : ''}`}
                  onClick={() => toggleFeatured(project)}
                  title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                >
                  <Star size={16} />
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleOpenModal(project)}
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(project.id)}
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
                <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
                <button className={styles.closeButton} onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              {message.text && (
                <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
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
                        <Upload size={24} />
                        <span>Upload Image</span>
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
                    id="projectImage"
                  />
                  <label htmlFor="projectImage" className={styles.uploadButton}>
                    <Upload size={16} />
                    {formData.image_url ? 'Change Image' : 'Upload Image'}
                  </label>
                </div>

                {/* Title */}
                <div className={styles.formGroup}>
                  <label htmlFor="title">Project Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="My Awesome Project"
                  />
                </div>

                {/* Description */}
                <div className={styles.formGroup}>
                  <label htmlFor="description">Short Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={2}
                    placeholder="Brief description of your project"
                  />
                </div>

                {/* Long Description */}
                <div className={styles.formGroup}>
                  <label htmlFor="long_description">Detailed Description</label>
                  <textarea
                    id="long_description"
                    name="long_description"
                    value={formData.long_description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Detailed description with features, challenges, etc."
                  />
                </div>

                {/* Tech Stack */}
                <div className={styles.formGroup}>
                  <label>Tech Stack</label>
                  <div className={styles.techInputWrapper}>
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="Add technology (press Enter)"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTech(e)}
                    />
                    <button type="button" onClick={handleAddTech} className={styles.addTechButton}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className={styles.techTags}>
                    {formData.tech_stack.map((tech, i) => (
                      <span key={i} className={styles.techTagEdit}>
                        {tech}
                        <button type="button" onClick={() => handleRemoveTech(tech)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* URLs */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="github_url">
                      <Github size={14} /> GitHub URL
                    </label>
                    <input
                      type="url"
                      id="github_url"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleChange}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="live_url">
                      <ExternalLink size={14} /> Live URL
                    </label>
                    <input
                      type="url"
                      id="live_url"
                      name="live_url"
                      value={formData.live_url}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Featured Checkbox */}
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                    />
                    <span className={styles.checkmark}></span>
                    <Star size={16} />
                    Mark as Featured Project
                  </label>
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
                        {editingProject ? 'Update Project' : 'Create Project'}
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

export default ProjectsManager;
