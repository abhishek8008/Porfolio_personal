const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { cache, CACHE_KEYS, CACHE_TTL } = require('../config/redis');

const router = express.Router();

// ==================== PUBLIC ROUTES (with Redis Caching) ====================

// @route   GET /api/public/profile
// @desc    Get public profile data (cached)
router.get('/profile', async (req, res) => {
  try {
    // Try cache first
    const cached = await cache.get(CACHE_KEYS.PROFILE);
    if (cached) {
      return res.json({
        success: true,
        profile: cached,
        fromCache: true
      });
    }

    // Fetch from database
    const result = await db.query('SELECT name, title, bio, profile_pic, resume_url, email, phone, location, github, linkedin, twitter FROM profile LIMIT 1');
    const profile = result.rows[0] || null;

    // Store in cache
    if (profile) {
      await cache.set(CACHE_KEYS.PROFILE, profile, CACHE_TTL.PROFILE);
    }

    res.json({
      success: true,
      profile,
      fromCache: false
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/public/skills
// @desc    Get all skills (cached)
router.get('/skills', async (req, res) => {
  try {
    // Try cache first
    const cached = await cache.get(CACHE_KEYS.SKILLS);
    if (cached) {
      return res.json({ success: true, skills: cached, fromCache: true });
    }

    // Fetch from database
    const result = await db.query('SELECT id, name, category, icon_url, emoji, proficiency FROM skills ORDER BY category, display_order');
    
    // Store in cache
    await cache.set(CACHE_KEYS.SKILLS, result.rows, CACHE_TTL.SKILLS);

    res.json({ success: true, skills: result.rows, fromCache: false });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/public/projects
// @desc    Get all projects (cached)
router.get('/projects', async (req, res) => {
  try {
    // Try cache first
    const cached = await cache.get(CACHE_KEYS.PROJECTS);
    if (cached) {
      return res.json({ success: true, projects: cached, fromCache: true });
    }

    // Fetch from database
    const result = await db.query(`
      SELECT id, title, description, image_url, tech_stack, github_url, live_url, featured 
      FROM projects 
      ORDER BY featured DESC, display_order, created_at DESC
    `);

    // Store in cache
    await cache.set(CACHE_KEYS.PROJECTS, result.rows, CACHE_TTL.PROJECTS);

    res.json({ success: true, projects: result.rows, fromCache: false });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/public/projects/:id
// @desc    Get single project details (cached)
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `${CACHE_KEYS.PROJECT}${id}`;

    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, project: cached, fromCache: true });
    }

    // Fetch from database
    const result = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Store in cache
    await cache.set(cacheKey, result.rows[0], CACHE_TTL.PROJECT);

    res.json({ success: true, project: result.rows[0], fromCache: false });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/public/certificates
// @desc    Get all certificates (cached)
router.get('/certificates', async (req, res) => {
  try {
    // Try cache first
    const cached = await cache.get(CACHE_KEYS.CERTIFICATES);
    if (cached) {
      return res.json({ success: true, certificates: cached, fromCache: true });
    }

    // Fetch from database
    const result = await db.query('SELECT id, title, issuer, issue_date, credential_url, image_url FROM certificates ORDER BY issue_date DESC');

    // Store in cache
    await cache.set(CACHE_KEYS.CERTIFICATES, result.rows, CACHE_TTL.CERTIFICATES);

    res.json({ success: true, certificates: result.rows, fromCache: false });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/public/experience
// @desc    Get all experience (cached)
router.get('/experience', async (req, res) => {
  try {
    // Try cache first
    const cached = await cache.get(CACHE_KEYS.EXPERIENCE);
    if (cached) {
      return res.json({ success: true, experience: cached, fromCache: true });
    }

    // Fetch from database
    const result = await db.query('SELECT * FROM experience ORDER BY is_current DESC, start_date DESC');

    // Store in cache
    await cache.set(CACHE_KEYS.EXPERIENCE, result.rows, CACHE_TTL.EXPERIENCE);

    res.json({ success: true, experience: result.rows, fromCache: false });
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/public/education
// @desc    Get all education (cached)
router.get('/education', async (req, res) => {
  try {
    // Try cache first
    const cached = await cache.get(CACHE_KEYS.EDUCATION);
    if (cached) {
      return res.json({ success: true, education: cached, fromCache: true });
    }

    // Fetch from database
    const result = await db.query('SELECT * FROM education ORDER BY start_date DESC');

    // Store in cache
    await cache.set(CACHE_KEYS.EDUCATION, result.rows, CACHE_TTL.EDUCATION);

    res.json({ success: true, education: result.rows, fromCache: false });
  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/public/visitor-count
// @desc    Get visitor count (short-lived cache)
router.get('/visitor-count', async (req, res) => {
  try {
    const { page } = req.query;
    const cacheKey = `${CACHE_KEYS.VISITOR_COUNT}${page || 'total'}`;

    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached !== null) {
      return res.json({ 
        success: true, 
        totalVisits: cached.totalVisits,
        fromCache: true
      });
    }

    let result;
    if (page) {
      result = await db.query('SELECT COALESCE(visits, 0) as total FROM visit_stats WHERE page = $1', [page]);
    } else {
      result = await db.query('SELECT COALESCE(SUM(visits), 0) as total FROM visit_stats');
    }
    
    const totalVisits = parseInt(result.rows[0]?.total) || 0;

    // Store in cache (short TTL for visitor count)
    await cache.set(cacheKey, { totalVisits }, CACHE_TTL.VISITOR_COUNT);

    res.json({ 
      success: true, 
      totalVisits,
      fromCache: false
    });
  } catch (error) {
    console.error('Get visitor count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/public/contact
// @desc    Submit contact form message (no cache needed)
router.post('/contact', [
  body('name').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('message').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    const result = await db.query(`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `, [name, email, subject || 'No Subject', message]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// @route   POST /api/public/track-visit
// @desc    Track page visits (invalidates visitor cache)
router.post('/track-visit', async (req, res) => {
  try {
    const { page } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers.referer || req.headers.referrer;

    if (!page) {
      return res.status(400).json({ success: false, message: 'Page is required' });
    }

    // Update visit count
    await db.query(`
      INSERT INTO visit_stats (page, visits, unique_visitors, last_visit)
      VALUES ($1, 1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (page) DO UPDATE SET
        visits = visit_stats.visits + 1,
        last_visit = CURRENT_TIMESTAMP
    `, [page]);

    // Log detailed visit
    await db.query(`
      INSERT INTO page_visits (page, ip_address, user_agent, referrer)
      VALUES ($1, $2, $3, $4)
    `, [page, ip, userAgent, referrer]);

    // Invalidate visitor count cache
    await cache.invalidate.visitors();

    res.json({ success: true });
  } catch (error) {
    console.error('Track visit error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/public/cache-stats
// @desc    Get cache statistics (for debugging)
router.get('/cache-stats', async (req, res) => {
  try {
    const stats = await cache.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error getting cache stats' });
  }
});

module.exports = router;
