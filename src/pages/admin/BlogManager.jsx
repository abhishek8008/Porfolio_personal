import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { blogAPI } from '../../services/api';
import { uploadAPI } from '../../services/api';
import styles from './BlogManager.module.css';

const DEFAULT_AUTHOR = 'Abhishek Kumar R';

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [previewMode, setPreviewMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageInputType, setImageInputType] = useState('url'); // 'url' or 'file'
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    cover_image: '',
    category: '',
    tags: '',
    is_published: false,
    is_featured: false,
    meta_description: '',
    author: DEFAULT_AUTHOR,
    attachments: [] // Array of {url, filename, size, type}
  });

  const categories = [
    'Technology',
    'Web Development',
    'Programming',
    'Career',
    'Tutorial',
    'Opinion',
    'Project',
    'Other'
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await blogAPI.adminGetAll();
      setBlogs(response.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const blogData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        author: formData.author || DEFAULT_AUTHOR
      };

      if (editingBlog) {
        await blogAPI.update(editingBlog.id, blogData);
      } else {
        await blogAPI.create(blogData);
      }
      
      fetchBlogs();
      closeModal();
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog post');
    }
  };

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadBlogImage(file);
      setFormData(prev => ({ ...prev, cover_image: response.data.url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadBlogAttachment(file);
      const newAttachment = {
        url: response.data.url,
        filename: response.data.filename,
        size: response.data.size,
        type: response.data.type
      };
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }));
    } catch (error) {
      console.error('Error uploading attachment:', error);
      alert('Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
    if (type.includes('excel') || type.includes('sheet')) return '📈';
    if (type.includes('zip')) return '📦';
    return '📎';
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      await blogAPI.delete(id);
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog post');
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      await blogAPI.togglePublish(blog.id, !blog.is_published);
      fetchBlogs();
    } catch (error) {
      console.error('Error toggling publish:', error);
      alert('Failed to update blog status');
    }
  };

  const openModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        cover_image: blog.cover_image || '',
        category: blog.category || '',
        tags: (blog.tags || []).join(', '),
        is_published: blog.is_published || false,
        is_featured: blog.is_featured || false,
        meta_description: blog.meta_description || '',
        author: blog.author || DEFAULT_AUTHOR,
        attachments: blog.attachments || []
      });
      setImageInputType(blog.cover_image ? 'url' : 'url');
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        cover_image: '',
        category: '',
        tags: '',
        is_published: false,
        is_featured: false,
        meta_description: '',
        author: DEFAULT_AUTHOR,
        attachments: []
      });
      setImageInputType('url');
    }
    setPreviewMode(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBlog(null);
    setPreviewMode(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'published' && blog.is_published) ||
                         (filterStatus === 'draft' && !blog.is_published);
    return matchesSearch && matchesStatus;
  });

  const renderPreview = (content) => {
    if (!content) return <p className={styles.previewEmpty}>No content to preview</p>;
    
    return content.split('\n').map((line, index) => {
      if (line.startsWith('### ')) return <h3 key={index}>{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={index}>{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={index}>{line.slice(2)}</h1>;
      if (line.startsWith('> ')) return <blockquote key={index}>{line.slice(2)}</blockquote>;
      if (line.match(/^[-*+]\s/)) return <li key={index}>{line.slice(2)}</li>;
      if (line.trim() === '') return <br key={index} />;
      return <p key={index}>{line}</p>;
    });
  };

  // Insert markdown helper
  const insertMarkdown = (type) => {
    const textarea = document.getElementById('blogContent');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    let newText = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? newText.length : 2;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? newText.length : 1;
        break;
      case 'h1':
        newText = `# ${selectedText || 'Heading 1'}`;
        cursorOffset = 2;
        break;
      case 'h2':
        newText = `## ${selectedText || 'Heading 2'}`;
        cursorOffset = 3;
        break;
      case 'h3':
        newText = `### ${selectedText || 'Heading 3'}`;
        cursorOffset = 4;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        cursorOffset = selectedText ? newText.length - 1 : 1;
        break;
      case 'code':
        newText = selectedText.includes('\n') 
          ? `\`\`\`\n${selectedText || 'code'}\n\`\`\``
          : `\`${selectedText || 'code'}\``;
        break;
      case 'quote':
        newText = `> ${selectedText || 'quote'}`;
        cursorOffset = 2;
        break;
      case 'list':
        newText = `- ${selectedText || 'list item'}`;
        cursorOffset = 2;
        break;
      default:
        return;
    }

    const newContent = formData.content.substring(0, start) + newText + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Focus and set cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  return (
    <div className={styles.blogManager}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>
            <span className={styles.icon}>📝</span>
            Blog Manager
          </h1>
          <p>Create and manage your blog posts</p>
        </div>
        <button className={styles.addButton} onClick={() => openModal()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filterButtons}>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.active : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({blogs.length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'published' ? styles.active : ''}`}
            onClick={() => setFilterStatus('published')}
          >
            Published ({blogs.filter(b => b.is_published).length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'draft' ? styles.active : ''}`}
            onClick={() => setFilterStatus('draft')}
          >
            Drafts ({blogs.filter(b => !b.is_published).length})
          </button>
        </div>
      </div>

      {/* Blog List */}
      <div className={styles.blogList}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Loading posts...</span>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <h3>No blog posts yet</h3>
            <p>Start writing your first blog post</p>
            <button onClick={() => openModal()}>Create Post</button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                className={styles.blogCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={styles.cardLeft}>
                  {blog.cover_image ? (
                    <img src={blog.cover_image} alt={blog.title} className={styles.thumbnail} />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>
                      <span>📄</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div className={styles.badges}>
                      <span className={`${styles.statusBadge} ${blog.is_published ? styles.published : styles.draft}`}>
                        {blog.is_published ? 'Published' : 'Draft'}
                      </span>
                      {blog.is_featured && (
                        <span className={styles.featuredBadge}>⭐ Featured</span>
                      )}
                      {blog.category && (
                        <span className={styles.categoryBadge}>{blog.category}</span>
                      )}
                    </div>
                    <span className={styles.date}>{formatDate(blog.created_at)}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{blog.title}</h3>
                  <p className={styles.cardExcerpt}>{blog.excerpt}</p>
                  <div className={styles.cardMeta}>
                    <span className={styles.metaItem}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      {blog.reading_time || 0} min
                    </span>
                    <span className={styles.metaItem}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      {blog.views || 0} views
                    </span>
                    {blog.tags?.length > 0 && (
                      <div className={styles.tags}>
                        {blog.tags.slice(0, 3).map(tag => (
                          <span key={tag} className={styles.tag}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={`${styles.actionBtn} ${styles.publishBtn}`}
                    onClick={() => handleTogglePublish(blog)}
                    title={blog.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {blog.is_published ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    onClick={() => openModal(blog)}
                    title="Edit"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(blog.id)}
                    title="Delete"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>{editingBlog ? 'Edit Post' : 'Create New Post'}</h2>
                <div className={styles.modalTabs}>
                  <button 
                    className={`${styles.tabBtn} ${!previewMode ? styles.active : ''}`}
                    onClick={() => setPreviewMode(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button 
                    className={`${styles.tabBtn} ${previewMode ? styles.active : ''}`}
                    onClick={() => setPreviewMode(true)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Preview
                  </button>
                </div>
                <button className={styles.closeBtn} onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {previewMode ? (
                <div className={styles.previewContainer}>
                  <div className={styles.previewHeader}>
                    {formData.category && (
                      <span className={styles.previewCategory}>{formData.category}</span>
                    )}
                    <h1 className={styles.previewTitle}>{formData.title || 'Untitled Post'}</h1>
                    {formData.excerpt && (
                      <p className={styles.previewExcerpt}>{formData.excerpt}</p>
                    )}
                  </div>
                  {formData.cover_image && (
                    <img src={formData.cover_image} alt="Cover" className={styles.previewImage} />
                  )}
                  <div className={styles.previewContent}>
                    {renderPreview(formData.content)}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="title">Title *</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter post title"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="author">Author</label>
                      <input
                        type="text"
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        placeholder="Abhishek Kumar R"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="tags">Tags (comma-separated)</label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="react, javascript, tutorial"
                      />
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label>Cover Image</label>
                      <div className={styles.imageInputToggle}>
                        <button
                          type="button"
                          className={`${styles.toggleBtn} ${imageInputType === 'url' ? styles.active : ''}`}
                          onClick={() => setImageInputType('url')}
                        >
                          🔗 URL
                        </button>
                        <button
                          type="button"
                          className={`${styles.toggleBtn} ${imageInputType === 'file' ? styles.active : ''}`}
                          onClick={() => setImageInputType('file')}
                        >
                          📁 Upload
                        </button>
                      </div>
                      {imageInputType === 'url' ? (
                        <input
                          type="url"
                          id="cover_image"
                          name="cover_image"
                          value={formData.cover_image}
                          onChange={handleChange}
                          placeholder="https://example.com/image.jpg"
                        />
                      ) : (
                        <div className={styles.fileUploadWrapper}>
                          <input
                            type="file"
                            id="cover_image_file"
                            accept="image/*"
                            onChange={handleCoverImageUpload}
                            disabled={uploading}
                          />
                          <label htmlFor="cover_image_file" className={styles.fileUploadLabel}>
                            {uploading ? 'Uploading...' : '📷 Choose Image'}
                          </label>
                        </div>
                      )}
                      {formData.cover_image && (
                        <div className={styles.imagePreview}>
                          <img src={formData.cover_image} alt="Cover preview" />
                          <button
                            type="button"
                            className={styles.removeImageBtn}
                            onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label>Attachments (PDF, DOC, PPT, etc.)</label>
                      <div className={styles.attachmentUpload}>
                        <input
                          type="file"
                          id="attachment_file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                          onChange={handleAttachmentUpload}
                          disabled={uploading}
                        />
                        <label htmlFor="attachment_file" className={styles.fileUploadLabel}>
                          {uploading ? 'Uploading...' : '📎 Add Attachment'}
                        </label>
                      </div>
                      {formData.attachments.length > 0 && (
                        <div className={styles.attachmentsList}>
                          {formData.attachments.map((att, index) => (
                            <div key={index} className={styles.attachmentItem}>
                              <span className={styles.attachmentIcon}>{getFileIcon(att.type)}</span>
                              <span className={styles.attachmentName}>{att.filename}</span>
                              <span className={styles.attachmentSize}>{formatFileSize(att.size)}</span>
                              <button
                                type="button"
                                className={styles.removeAttachmentBtn}
                                onClick={() => removeAttachment(index)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label htmlFor="excerpt">Excerpt</label>
                      <textarea
                        id="excerpt"
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        placeholder="Brief description of the post"
                        rows="2"
                      />
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label htmlFor="blogContent">Content (Markdown supported)</label>
                      <div className={styles.toolbar}>
                        <button type="button" onClick={() => insertMarkdown('bold')} title="Bold">
                          <strong>B</strong>
                        </button>
                        <button type="button" onClick={() => insertMarkdown('italic')} title="Italic">
                          <em>I</em>
                        </button>
                        <button type="button" onClick={() => insertMarkdown('h1')} title="Heading 1">
                          H1
                        </button>
                        <button type="button" onClick={() => insertMarkdown('h2')} title="Heading 2">
                          H2
                        </button>
                        <button type="button" onClick={() => insertMarkdown('h3')} title="Heading 3">
                          H3
                        </button>
                        <button type="button" onClick={() => insertMarkdown('link')} title="Link">
                          🔗
                        </button>
                        <button type="button" onClick={() => insertMarkdown('code')} title="Code">
                          {'</>'}
                        </button>
                        <button type="button" onClick={() => insertMarkdown('quote')} title="Quote">
                          ❝
                        </button>
                        <button type="button" onClick={() => insertMarkdown('list')} title="List">
                          •
                        </button>
                      </div>
                      <textarea
                        id="blogContent"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Write your post content here... Use Markdown for formatting."
                        rows="12"
                      />
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label htmlFor="meta_description">Meta Description (SEO)</label>
                      <textarea
                        id="meta_description"
                        name="meta_description"
                        value={formData.meta_description}
                        onChange={handleChange}
                        placeholder="SEO description for search engines"
                        rows="2"
                      />
                    </div>

                    <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          name="is_published"
                          checked={formData.is_published}
                          onChange={handleChange}
                        />
                        <span className={styles.checkmark}></span>
                        Publish immediately
                      </label>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          name="is_featured"
                          checked={formData.is_featured}
                          onChange={handleChange}
                        />
                        <span className={styles.checkmark}></span>
                        Featured post
                      </label>
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      {editingBlog ? 'Update Post' : 'Create Post'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogManager;
