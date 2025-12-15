import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, Plus, Edit3, Trash2, Save, X, Upload, 
  Loader2, Sparkles, Database, Users, Layers
} from 'lucide-react';
import { adminAPI, uploadAPI } from '../../services/api';
import styles from './SkillsManager.module.css';

const CATEGORIES = ['Languages', 'Frameworks', 'Tools & Platforms', 'Soft Skills'];

const categoryIcons = {
  'Languages': Code2,
  'Frameworks': Sparkles,
  'Tools & Platforms': Database,
  'Soft Skills': Users
};

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeCategory, setActiveCategory] = useState('all');
  
  const emptySkill = {
    name: '',
    category: 'Languages',
    icon_url: '',
    emoji: '',
    proficiency: 80,
    display_order: 0
  };

  const [formData, setFormData] = useState(emptySkill);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await adminAPI.getSkills();
      if (response.success) {
        setSkills(response.skills || []);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      setMessage({ type: 'error', text: 'Failed to load skills' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleOpenModal = (skill = null) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData(skill);
    } else {
      setEditingSkill(null);
      const categorySkills = skills.filter(s => s.category === formData.category);
      setFormData({ ...emptySkill, display_order: categorySkills.length });
    }
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSkill(null);
    setFormData(emptySkill);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let response;
      if (editingSkill) {
        response = await adminAPI.updateSkill(editingSkill.id, formData);
      } else {
        response = await adminAPI.addSkill(formData);
      }

      if (response.success) {
        setMessage({ type: 'success', text: `Skill ${editingSkill ? 'updated' : 'added'} successfully!` });
        fetchSkills();
        setTimeout(() => handleCloseModal(), 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const response = await adminAPI.deleteSkill(id);
      if (response.success) {
        setSkills(prev => prev.filter(s => s.id !== id));
        setMessage({ type: 'success', text: 'Skill deleted successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const filteredSkills = activeCategory === 'all' 
    ? skills 
    : skills.filter(s => s.category === activeCategory);

  const groupedSkills = CATEGORIES.reduce((acc, category) => {
    acc[category] = filteredSkills.filter(s => s.category === category);
    return acc;
  }, {});

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
            <Layers />
            Skills Manager
          </h1>
          <p className={styles.subtitle}>Add, edit, and organize your technical skills</p>
        </div>
        <button className={styles.addButton} onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Add Skill
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

      {/* Category Tabs */}
      <div className={styles.categoryTabs}>
        <button 
          className={`${styles.categoryTab} ${activeCategory === 'all' ? styles.active : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Skills
          <span className={styles.tabCount}>{skills.length}</span>
        </button>
        {CATEGORIES.map(category => {
          const CategoryIcon = categoryIcons[category];
          const count = skills.filter(s => s.category === category).length;
          return (
            <button 
              key={category}
              className={`${styles.categoryTab} ${activeCategory === category ? styles.active : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              <CategoryIcon size={16} />
              {category}
              <span className={styles.tabCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Skills Display */}
      {filteredSkills.length === 0 ? (
        <div className={styles.emptyState}>
          <Layers size={48} />
          <h3>No skills found</h3>
          <p>Add your first skill to showcase your expertise</p>
          <button className={styles.addButton} onClick={() => handleOpenModal()}>
            <Plus size={20} />
            Add Skill
          </button>
        </div>
      ) : activeCategory === 'all' ? (
        // Show grouped by category
        <div className={styles.categorySections}>
          {CATEGORIES.map(category => {
            const categorySkills = groupedSkills[category];
            if (categorySkills.length === 0) return null;
            
            const CategoryIcon = categoryIcons[category];
            return (
              <div key={category} className={styles.categorySection}>
                <h2 className={styles.categoryTitle}>
                  <CategoryIcon size={20} />
                  {category}
                  <span className={styles.categoryCount}>{categorySkills.length}</span>
                </h2>
                <div className={styles.skillsGrid}>
                  {categorySkills.map((skill, index) => (
                    <SkillCard 
                      key={skill.id} 
                      skill={skill} 
                      index={index}
                      onEdit={() => handleOpenModal(skill)}
                      onDelete={() => handleDelete(skill.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Show single category grid
        <div className={styles.skillsGrid}>
          {filteredSkills.map((skill, index) => (
            <SkillCard 
              key={skill.id} 
              skill={skill} 
              index={index}
              onEdit={() => handleOpenModal(skill)}
              onDelete={() => handleDelete(skill.id)}
            />
          ))}
        </div>
      )}

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
                <h2>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h2>
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
                {/* Skill Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="name">Skill Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., React, Python, Teamwork"
                  />
                </div>

                {/* Category */}
                <div className={styles.formGroup}>
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Icon URL & Emoji */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="icon_url">Icon URL</label>
                    <input
                      type="url"
                      id="icon_url"
                      name="icon_url"
                      value={formData.icon_url || ''}
                      onChange={handleChange}
                      placeholder="https://cdn.jsdelivr.net/..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="emoji">Or Emoji</label>
                    <input
                      type="text"
                      id="emoji"
                      name="emoji"
                      value={formData.emoji || ''}
                      onChange={handleChange}
                      placeholder="🚀"
                      maxLength={4}
                    />
                  </div>
                </div>

                {/* Icon Preview */}
                {(formData.icon_url || formData.emoji) && (
                  <div className={styles.iconPreview}>
                    <span>Preview:</span>
                    {formData.icon_url ? (
                      <img src={formData.icon_url} alt="Icon preview" />
                    ) : (
                      <span className={styles.emojiPreview}>{formData.emoji}</span>
                    )}
                  </div>
                )}

                {/* Proficiency */}
                <div className={styles.formGroup}>
                  <label htmlFor="proficiency">
                    Proficiency Level: <span className={styles.proficiencyValue}>{formData.proficiency}%</span>
                  </label>
                  <input
                    type="range"
                    id="proficiency"
                    name="proficiency"
                    min="0"
                    max="100"
                    value={formData.proficiency}
                    onChange={handleChange}
                    className={styles.rangeInput}
                  />
                  <div className={styles.rangeLabels}>
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Expert</span>
                  </div>
                </div>

                {/* Display Order */}
                <div className={styles.formGroup}>
                  <label htmlFor="display_order">Display Order</label>
                  <input
                    type="number"
                    id="display_order"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
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
                        {editingSkill ? 'Update Skill' : 'Add Skill'}
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

// Skill Card Component
const SkillCard = ({ skill, index, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    className={styles.skillCard}
  >
    <div className={styles.skillIcon}>
      {skill.icon_url ? (
        <img src={skill.icon_url} alt={skill.name} />
      ) : (
        <span className={styles.skillEmoji}>{skill.emoji || '🔧'}</span>
      )}
    </div>
    
    <div className={styles.skillInfo}>
      <h3 className={styles.skillName}>{skill.name}</h3>
      <span className={styles.skillCategory}>{skill.category}</span>
      <div className={styles.proficiencyBar}>
        <div 
          className={styles.proficiencyFill} 
          style={{ width: `${skill.proficiency}%` }}
        />
      </div>
      <span className={styles.proficiencyText}>{skill.proficiency}%</span>
    </div>

    <div className={styles.skillActions}>
      <button className={styles.actionButton} onClick={onEdit}>
        <Edit3 size={14} />
      </button>
      <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={onDelete}>
        <Trash2 size={14} />
      </button>
    </div>
  </motion.div>
);

export default SkillsManager;
