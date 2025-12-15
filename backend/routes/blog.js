const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { cache, CACHE_KEYS, CACHE_TTL } = require('../config/redis');

const router = express.Router();

// Helper: Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
};

// Helper: Calculate reading time
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute) || 1;
};

// ==================== PUBLIC BLOG ROUTES ====================

// @route   GET /api/blogs
// @desc    Get all published blogs (with pagination, search, filter)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '', 
      tag = '',
      featured = ''
    } = req.query;
    
    const offset = (page - 1) * limit;
    let query = `
      SELECT id, title, slug, excerpt, cover_image, tags, category, 
             reading_time, views, author, published_at, is_featured
      FROM blogs 
      WHERE is_published = true
    `;
    const params = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Category filter
    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Tag filter
    if (tag) {
      query += ` AND $${paramIndex} = ANY(tags)`;
      params.push(tag);
      paramIndex++;
    }

    // Featured filter
    if (featured === 'true') {
      query += ` AND is_featured = true`;
    }

    // Get total count
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add ordering and pagination
    query += ` ORDER BY is_featured DESC, published_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      blogs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/blogs/featured
// @desc    Get featured blogs
router.get('/featured', async (req, res) => {
  try {
    const cacheKey = 'portfolio:blogs:featured';
    
    // Try cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, blogs: cached, fromCache: true });
    }

    const result = await db.query(`
      SELECT id, title, slug, excerpt, cover_image, tags, category, 
             reading_time, views, author, published_at
      FROM blogs 
      WHERE is_published = true AND is_featured = true
      ORDER BY published_at DESC
      LIMIT 3
    `);

    await cache.set(cacheKey, result.rows, 1800); // 30 min cache

    res.json({ success: true, blogs: result.rows, fromCache: false });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/blogs/categories
// @desc    Get all categories with post count
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT category, COUNT(*) as count
      FROM blogs 
      WHERE is_published = true AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json({ success: true, categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/blogs/tags
// @desc    Get all tags with post count
router.get('/tags', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT UNNEST(tags) as tag, COUNT(*) as count
      FROM blogs 
      WHERE is_published = true
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 20
    `);

    res.json({ success: true, tags: result.rows });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await db.query(`
      SELECT * FROM blogs 
      WHERE slug = $1 AND is_published = true
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Increment view count (async, don't wait)
    db.query('UPDATE blogs SET views = views + 1 WHERE slug = $1', [slug]);

    // Get related posts
    const blog = result.rows[0];
    const relatedResult = await db.query(`
      SELECT id, title, slug, excerpt, cover_image, reading_time, published_at
      FROM blogs 
      WHERE is_published = true 
        AND id != $1 
        AND (category = $2 OR tags && $3::text[])
      ORDER BY published_at DESC
      LIMIT 3
    `, [blog.id, blog.category, blog.tags || []]);

    res.json({ 
      success: true, 
      blog: { ...blog, views: blog.views + 1 },
      relatedPosts: relatedResult.rows
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
