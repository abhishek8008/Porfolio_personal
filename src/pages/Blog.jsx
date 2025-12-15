import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { blogAPI } from '../services/api';
import styles from './Blog.module.css';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchQuery, selectedCategory, selectedTag]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, tagsRes, featuredRes] = await Promise.all([
        blogAPI.getCategories(),
        blogAPI.getTags(),
        blogAPI.getFeatured()
      ]);
      setCategories(categoriesRes.categories || []);
      setTags(tagsRes.tags || []);
      setFeaturedBlogs(featuredRes.blogs || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 9,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedTag) params.tag = selectedTag;

      const response = await blogAPI.getAll(params);
      setBlogs(response.blogs || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateSearchParams();
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTag) params.set('tag', selectedTag);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTag('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.blogPage}>
      {/* Hero Section */}
      <motion.section 
        className={styles.heroSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.heroContent}>
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className={styles.gradient}>Blog</span> & Insights
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Exploring ideas, sharing knowledge, and documenting my journey in tech
          </motion.p>
        </div>
        <div className={styles.heroGlow}></div>
      </motion.section>

      {/* Featured Posts */}
      {featuredBlogs.length > 0 && (
        <motion.section 
          className={styles.featuredSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>⭐</span> Featured Posts
          </h2>
          <div className={styles.featuredGrid}>
            {featuredBlogs.slice(0, 2).map((blog, index) => (
              <motion.article
                key={blog.id}
                className={styles.featuredCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link to={`/blog/${blog.slug}`} className={styles.featuredLink}>
                  <div className={styles.featuredImage}>
                    {blog.cover_image ? (
                      <img src={blog.cover_image} alt={blog.title} />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <span>📝</span>
                      </div>
                    )}
                    <div className={styles.featuredOverlay}>
                      <span className={styles.featuredBadge}>Featured</span>
                    </div>
                  </div>
                  <div className={styles.featuredContent}>
                    <div className={styles.featuredMeta}>
                      <span className={styles.category}>{blog.category}</span>
                      <span className={styles.readTime}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6v6l4 2"/>
                        </svg>
                        {blog.reading_time} min read
                      </span>
                    </div>
                    <h3>{blog.title}</h3>
                    <p>{blog.excerpt}</p>
                    <div className={styles.featuredFooter}>
                      <span className={styles.date}>{formatDate(blog.published_at || blog.created_at)}</span>
                      <span className={styles.views}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        {blog.views} views
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </motion.section>
      )}

      {/* Search & Filter Section */}
      <motion.section 
        className={styles.filterSection}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInputWrapper}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.searchButton}>Search</button>
        </form>

        <div className={styles.filterTabs}>
          <div className={styles.filterGroup}>
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.tagsContainer}>
            {tags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                className={`${styles.tagButton} ${selectedTag === tag ? styles.active : ''}`}
                onClick={() => {
                  setSelectedTag(selectedTag === tag ? '' : tag);
                  setCurrentPage(1);
                }}
              >
                #{tag}
              </button>
            ))}
          </div>

          {(searchQuery || selectedCategory || selectedTag) && (
            <button className={styles.clearButton} onClick={clearFilters}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear Filters
            </button>
          )}
        </div>
      </motion.section>

      {/* Blog Grid */}
      <section className={styles.blogGrid}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              className={styles.loadingState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.loader}>
                <div className={styles.loaderRing}></div>
                <span>Loading articles...</span>
              </div>
            </motion.div>
          ) : blogs.length === 0 ? (
            <motion.div 
              className={styles.emptyState}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className={styles.emptyIcon}>📭</span>
              <h3>No articles found</h3>
              <p>Try adjusting your search or filters</p>
              <button onClick={clearFilters}>Clear all filters</button>
            </motion.div>
          ) : (
            <motion.div 
              className={styles.articlesGrid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  className={styles.blogCard}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <Link to={`/blog/${blog.slug}`} className={styles.cardLink}>
                    <div className={styles.cardImage}>
                      {blog.cover_image ? (
                        <img src={blog.cover_image} alt={blog.title} loading="lazy" />
                      ) : (
                        <div className={styles.cardPlaceholder}>
                          <span>📄</span>
                        </div>
                      )}
                      <div className={styles.cardOverlay}>
                        <span className={styles.readMore}>Read Article →</span>
                      </div>
                    </div>
                    <div className={styles.cardContent}>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardCategory}>{blog.category}</span>
                        <span className={styles.cardReadTime}>{blog.reading_time} min</span>
                      </div>
                      <h3 className={styles.cardTitle}>{blog.title}</h3>
                      <p className={styles.cardExcerpt}>{blog.excerpt}</p>
                      <div className={styles.cardFooter}>
                        <span className={styles.cardDate}>
                          {formatDate(blog.published_at || blog.created_at)}
                        </span>
                        <div className={styles.cardTags}>
                          {blog.tags?.slice(0, 2).map((tag) => (
                            <span key={tag} className={styles.cardTag}>#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            className={styles.pagination}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Previous
            </button>
            
            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`${styles.pageNumber} ${currentPage === page ? styles.activePage : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Blog;
