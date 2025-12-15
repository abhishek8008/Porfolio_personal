import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { blogAPI } from '../services/api';
import styles from './BlogPost.module.css';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchBlogPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogAPI.getBySlug(slug);
      setBlog(response.blog);
      setRelatedPosts(response.relatedPosts || []);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Blog post not found');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderContent = (content) => {
    // Simple markdown-like rendering
    if (!content) return null;
    
    const lines = content.split('\n');
    const elements = [];
    let currentList = [];
    let listType = null;
    let codeBlock = '';
    let inCodeBlock = false;
    let codeLanguage = '';

    const flushList = () => {
      if (currentList.length > 0) {
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <ListTag key={elements.length} className={styles.list}>
            {currentList.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ListTag>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      // Code block handling
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushList();
          elements.push(
            <pre key={elements.length} className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span>{codeLanguage || 'code'}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(codeBlock)}
                  className={styles.copyButton}
                >
                  Copy
                </button>
              </div>
              <code>{codeBlock}</code>
            </pre>
          );
          codeBlock = '';
          inCodeBlock = false;
          codeLanguage = '';
        } else {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlock += (codeBlock ? '\n' : '') + line;
        return;
      }

      // Headers
      if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={elements.length} className={styles.h3}>{line.slice(4)}</h3>);
        return;
      }
      if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={elements.length} className={styles.h2}>{line.slice(3)}</h2>);
        return;
      }
      if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={elements.length} className={styles.h1}>{line.slice(2)}</h1>);
        return;
      }

      // Horizontal rule
      if (line.match(/^[-*_]{3,}$/)) {
        flushList();
        elements.push(<hr key={elements.length} className={styles.hr} />);
        return;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={elements.length} className={styles.blockquote}>
            {line.slice(2)}
          </blockquote>
        );
        return;
      }

      // Unordered list
      if (line.match(/^[-*+]\s/)) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(formatInlineText(line.slice(2)));
        return;
      }

      // Ordered list
      if (line.match(/^\d+\.\s/)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(formatInlineText(line.replace(/^\d+\.\s/, '')));
        return;
      }

      // Empty line
      if (line.trim() === '') {
        flushList();
        return;
      }

      // Paragraph
      flushList();
      elements.push(
        <p key={elements.length} className={styles.paragraph}>
          {formatInlineText(line)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  const formatInlineText = (text) => {
    // Handle inline formatting
    const parts = [];
    let remaining = text;
    let key = 0;

    // Bold and Italic
    const patterns = [
      { regex: /\*\*\*(.+?)\*\*\*/g, wrapper: (text) => <strong key={key++}><em>{text}</em></strong> },
      { regex: /\*\*(.+?)\*\*/g, wrapper: (text) => <strong key={key++}>{text}</strong> },
      { regex: /\*(.+?)\*/g, wrapper: (text) => <em key={key++}>{text}</em> },
      { regex: /`(.+?)`/g, wrapper: (text) => <code key={key++} className={styles.inlineCode}>{text}</code> },
      { regex: /\[(.+?)\]\((.+?)\)/g, wrapper: (text, url) => <a key={key++} href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>{text}</a> },
    ];

    // For simplicity, return text with basic formatting
    let formatted = text;
    
    // Replace patterns with HTML
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`(.+?)`/g, '<code class="inline-code">$1</code>');
    formatted = formatted.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loader}>
          <div className={styles.loaderRing}></div>
          <span>Loading article...</span>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className={styles.errorState}>
        <span className={styles.errorIcon}>📄</span>
        <h2>Article Not Found</h2>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/blog')}>Back to Blog</button>
      </div>
    );
  }

  return (
    <div className={styles.blogPostPage}>
      {/* Hero Section */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.headerContent}>
          <Link to="/blog" className={styles.backLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Blog
          </Link>
          
          <motion.div 
            className={styles.meta}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className={styles.category}>{blog.category}</span>
            <span className={styles.dot}>•</span>
            <span className={styles.readTime}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              {blog.reading_time} min read
            </span>
            <span className={styles.dot}>•</span>
            <span className={styles.views}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {blog.views} views
            </span>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {blog.title}
          </motion.h1>

          <motion.div 
            className={styles.authorInfo}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.authorAvatar}>
              <span>{blog.author?.charAt(0) || 'A'}</span>
            </div>
            <div className={styles.authorDetails}>
              <span className={styles.authorName}>{blog.author || 'Anonymous'}</span>
              <span className={styles.publishDate}>
                {formatDate(blog.published_at || blog.created_at)}
              </span>
            </div>
          </motion.div>
        </div>

        {blog.cover_image && (
          <motion.div 
            className={styles.coverImage}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <img src={blog.cover_image} alt={blog.title} />
          </motion.div>
        )}
      </motion.header>

      {/* Content */}
      <motion.article 
        className={styles.content}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {blog.excerpt && (
          <p className={styles.excerpt}>{blog.excerpt}</p>
        )}
        
        <div className={styles.articleBody}>
          {renderContent(blog.content)}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className={styles.tags}>
            <span className={styles.tagsLabel}>Tags:</span>
            <div className={styles.tagsList}>
              {blog.tags.map((tag) => (
                <Link 
                  key={tag} 
                  to={`/blog?tag=${tag}`}
                  className={styles.tag}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.article>

      {/* Share Section */}
      <motion.div 
        className={styles.shareSection}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <span>Share this article:</span>
        <div className={styles.shareButtons}>
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.shareButton}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a 
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.shareButton}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <button 
            className={styles.shareButton}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <motion.section 
          className={styles.relatedSection}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className={styles.relatedTitle}>Related Articles</h2>
          <div className={styles.relatedGrid}>
            {relatedPosts.map((post, index) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.slug}`}
                className={styles.relatedCard}
              >
                <div className={styles.relatedImage}>
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} />
                  ) : (
                    <div className={styles.relatedPlaceholder}>
                      <span>📄</span>
                    </div>
                  )}
                </div>
                <div className={styles.relatedContent}>
                  <span className={styles.relatedCategory}>{post.category}</span>
                  <h3>{post.title}</h3>
                  <span className={styles.relatedReadTime}>{post.reading_time} min read</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default BlogPost;
