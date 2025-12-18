const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { cache } = require('../config/redis');

const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware, adminOnly);

// ==================== PROFILE ====================

// @route   GET /api/admin/profile
// @desc    Get profile data
router.get('/profile', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profile LIMIT 1');
    res.json({
      success: true,
      profile: result.rows[0] || null
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/profile
// @desc    Update profile
router.put('/profile', async (req, res) => {
  try {
    const { name, title, bio, email, phone, location, github, linkedin, twitter, profile_pic, resume_url } = req.body;
    
    const existingProfile = await db.query('SELECT id FROM profile LIMIT 1');
    
    if (existingProfile.rows.length === 0) {
      // Create new profile
      const result = await db.query(`
        INSERT INTO profile (name, title, bio, email, phone, location, github, linkedin, twitter, profile_pic, resume_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [name, title, bio, email, phone, location, github, linkedin, twitter, profile_pic, resume_url]);
      
      // Invalidate profile cache
      await cache.invalidate.profile();
      
      res.json({ success: true, profile: result.rows[0] });
    } else {
      // Update existing
      const result = await db.query(`
        UPDATE profile SET 
          name = COALESCE($1, name),
          title = COALESCE($2, title),
          bio = COALESCE($3, bio),
          email = COALESCE($4, email),
          phone = COALESCE($5, phone),
          location = COALESCE($6, location),
          github = COALESCE($7, github),
          linkedin = COALESCE($8, linkedin),
          twitter = COALESCE($9, twitter),
          profile_pic = COALESCE($10, profile_pic),
          resume_url = COALESCE($11, resume_url),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
        RETURNING *
      `, [name, title, bio, email, phone, location, github, linkedin, twitter, profile_pic, resume_url, existingProfile.rows[0].id]);
      
      // Invalidate profile cache
      await cache.invalidate.profile();
      
      res.json({ success: true, profile: result.rows[0] });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== SKILLS ====================

// @route   GET /api/admin/skills
// @desc    Get all skills
router.get('/skills', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM skills ORDER BY category, display_order');
    res.json({ success: true, skills: result.rows });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/skills
// @desc    Add new skill
router.post('/skills', [
  body('name').notEmpty().trim(),
  body('category').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, category, icon_url, emoji, proficiency, display_order } = req.body;
    
    const result = await db.query(`
      INSERT INTO skills (name, category, icon_url, emoji, proficiency, display_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, category, icon_url, emoji, proficiency || 80, display_order || 0]);

    // Invalidate skills cache
    await cache.invalidate.skills();

    res.status(201).json({ success: true, skill: result.rows[0] });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/skills/:id
// @desc    Update skill
router.put('/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, icon_url, emoji, proficiency, display_order } = req.body;

    const result = await db.query(`
      UPDATE skills SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        icon_url = COALESCE($3, icon_url),
        emoji = COALESCE($4, emoji),
        proficiency = COALESCE($5, proficiency),
        display_order = COALESCE($6, display_order)
      WHERE id = $7
      RETURNING *
    `, [name, category, icon_url, emoji, proficiency, display_order, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    // Invalidate skills cache
    await cache.invalidate.skills();

    res.json({ success: true, skill: result.rows[0] });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/skills/:id
// @desc    Delete skill
router.delete('/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM skills WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    // Invalidate skills cache
    await cache.invalidate.skills();

    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== PROJECTS ====================

// @route   GET /api/admin/projects
// @desc    Get all projects
router.get('/projects', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects ORDER BY display_order, created_at DESC');
    res.json({ success: true, projects: result.rows });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/projects
// @desc    Add new project
router.post('/projects', [
  body('title').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, long_description, image_url, tech_stack, github_url, live_url, featured, display_order } = req.body;

    const result = await db.query(`
      INSERT INTO projects (title, description, long_description, image_url, tech_stack, github_url, live_url, featured, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [title, description, long_description, image_url, tech_stack, github_url, live_url, featured || false, display_order || 0]);

    // Invalidate projects cache
    await cache.invalidate.projects();

    res.status(201).json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/projects/:id
// @desc    Update project
router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, long_description, image_url, tech_stack, github_url, live_url, featured, display_order } = req.body;

    const result = await db.query(`
      UPDATE projects SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        long_description = COALESCE($3, long_description),
        image_url = COALESCE($4, image_url),
        tech_stack = COALESCE($5, tech_stack),
        github_url = COALESCE($6, github_url),
        live_url = COALESCE($7, live_url),
        featured = COALESCE($8, featured),
        display_order = COALESCE($9, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [title, description, long_description, image_url, tech_stack, github_url, live_url, featured, display_order, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Invalidate projects cache
    await cache.invalidate.projects();
    await cache.invalidate.project(id);

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/projects/:id
// @desc    Delete project
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Invalidate projects cache
    await cache.invalidate.projects();
    await cache.invalidate.project(id);

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== CERTIFICATES ====================

// @route   GET /api/admin/certificates
router.get('/certificates', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM certificates ORDER BY issue_date DESC');
    res.json({ success: true, certificates: result.rows });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/certificates
router.post('/certificates', [
  body('title').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, issuer, issue_date, credential_url, image_url, description } = req.body;

    const result = await db.query(`
      INSERT INTO certificates (title, issuer, issue_date, credential_url, image_url, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, issuer, issue_date, credential_url, image_url, description]);

    // Invalidate certificates cache
    await cache.invalidate.certificates();

    res.status(201).json({ success: true, certificate: result.rows[0] });
  } catch (error) {
    console.error('Add certificate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/certificates/:id
router.put('/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, issuer, issue_date, credential_url, image_url, description } = req.body;

    const result = await db.query(`
      UPDATE certificates SET
        title = COALESCE($1, title),
        issuer = COALESCE($2, issuer),
        issue_date = COALESCE($3, issue_date),
        credential_url = COALESCE($4, credential_url),
        image_url = COALESCE($5, image_url),
        description = COALESCE($6, description)
      WHERE id = $7
      RETURNING *
    `, [title, issuer, issue_date, credential_url, image_url, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // Invalidate certificates cache
    await cache.invalidate.certificates();

    res.json({ success: true, certificate: result.rows[0] });
  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/certificates/:id
router.delete('/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM certificates WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // Invalidate certificates cache
    await cache.invalidate.certificates();

    res.json({ success: true, message: 'Certificate deleted' });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== CONTACT MESSAGES ====================

// @route   GET /api/admin/messages
router.get('/messages', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/messages/:id/read
router.put('/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'UPDATE contact_messages SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, message: result.rows[0] });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/messages/:id
router.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM contact_messages WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== VISIT STATS ====================

// @route   GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const visitStats = await db.query('SELECT * FROM visit_stats ORDER BY page');
    const totalVisits = await db.query('SELECT SUM(visits) as total FROM visit_stats');
    const recentVisits = await db.query(`
      SELECT page, COUNT(*) as count, DATE(visited_at) as date 
      FROM page_visits 
      WHERE visited_at > NOW() - INTERVAL '7 days'
      GROUP BY page, DATE(visited_at)
      ORDER BY date DESC
    `);
    const unreadMessages = await db.query('SELECT COUNT(*) FROM contact_messages WHERE is_read = false');

    res.json({
      success: true,
      stats: {
        pageStats: visitStats.rows,
        totalVisits: parseInt(totalVisits.rows[0]?.total) || 0,
        recentVisits: recentVisits.rows,
        unreadMessages: parseInt(unreadMessages.rows[0]?.count) || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== EXPERIENCE ====================

// @route   GET /api/admin/experience
router.get('/experience', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM experience ORDER BY start_date DESC');
    res.json({ success: true, experience: result.rows });
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/experience
router.post('/experience', async (req, res) => {
  try {
    const { company, position, start_date, end_date, is_current, description, location, company_logo } = req.body;

    const result = await db.query(`
      INSERT INTO experience (company, position, start_date, end_date, is_current, description, location, company_logo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [company, position, start_date, end_date, is_current, description, location, company_logo]);

    // Invalidate experience cache
    await cache.invalidate.experience();

    res.status(201).json({ success: true, experience: result.rows[0] });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/experience/:id
router.put('/experience/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company, position, start_date, end_date, is_current, description, location, company_logo } = req.body;

    const result = await db.query(`
      UPDATE experience SET
        company = COALESCE($1, company),
        position = COALESCE($2, position),
        start_date = COALESCE($3, start_date),
        end_date = COALESCE($4, end_date),
        is_current = COALESCE($5, is_current),
        description = COALESCE($6, description),
        location = COALESCE($7, location),
        company_logo = COALESCE($8, company_logo)
      WHERE id = $9
      RETURNING *
    `, [company, position, start_date, end_date, is_current, description, location, company_logo, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    // Invalidate experience cache
    await cache.invalidate.experience();

    res.json({ success: true, experience: result.rows[0] });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/experience/:id
router.delete('/experience/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM experience WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    // Invalidate experience cache
    await cache.invalidate.experience();

    res.json({ success: true, message: 'Experience deleted' });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== EDUCATION ====================

// @route   GET /api/admin/education
router.get('/education', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM education ORDER BY start_date DESC');
    res.json({ success: true, education: result.rows });
  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/education
router.post('/education', async (req, res) => {
  try {
    const { institution, degree, field_of_study, start_date, end_date, grade, description, logo_url } = req.body;

    const result = await db.query(`
      INSERT INTO education (institution, degree, field_of_study, start_date, end_date, grade, description, logo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [institution, degree, field_of_study, start_date, end_date, grade, description, logo_url]);

    // Invalidate education cache
    await cache.invalidate.education();

    res.status(201).json({ success: true, education: result.rows[0] });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/education/:id
router.put('/education/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { institution, degree, field_of_study, start_date, end_date, grade, description, logo_url } = req.body;

    const result = await db.query(`
      UPDATE education SET
        institution = COALESCE($1, institution),
        degree = COALESCE($2, degree),
        field_of_study = COALESCE($3, field_of_study),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        grade = COALESCE($6, grade),
        description = COALESCE($7, description),
        logo_url = COALESCE($8, logo_url)
      WHERE id = $9
      RETURNING *
    `, [institution, degree, field_of_study, start_date, end_date, grade, description, logo_url, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Education not found' });
    }

    // Invalidate education cache
    await cache.invalidate.education();

    res.json({ success: true, education: result.rows[0] });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/education/:id
router.delete('/education/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM education WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Education not found' });
    }

    // Invalidate education cache
    await cache.invalidate.education();

    res.json({ success: true, message: 'Education deleted' });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== BLOGS ====================

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
  const words = content.replace(/<[^>]*>/g, '').replace(/[#*`]/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute) || 1;
};

// @route   GET /api/admin/blogs
// @desc    Get all blogs (including drafts)
router.get('/blogs', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM blogs 
      ORDER BY created_at DESC
    `);
    res.json({ success: true, blogs: result.rows });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/blogs/:id
// @desc    Get single blog by ID
router.get('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM blogs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.json({ success: true, blog: result.rows[0] });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/blogs
// @desc    Create new blog
router.post('/blogs', [
  body('title').notEmpty().trim(),
  body('content').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { 
      title, content, excerpt, cover_image, tags, category, 
      is_published, is_featured, meta_description, author, attachments
    } = req.body;

    const slug = generateSlug(title);
    const reading_time = calculateReadingTime(content);
    const published_at = is_published ? new Date() : null;

    const result = await db.query(`
      INSERT INTO blogs (
        title, slug, content, excerpt, cover_image, tags, category,
        reading_time, is_published, is_featured, meta_description, published_at, author, attachments
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      title, slug, content, excerpt, cover_image, 
      tags || [], category, reading_time, 
      is_published || false, is_featured || false, 
      meta_description, published_at,
      author || 'Abhishek Kumar R',
      JSON.stringify(attachments || [])
    ]);

    // Invalidate blog cache
    await cache.delByPattern('portfolio:blogs:*');

    res.status(201).json({ success: true, blog: result.rows[0] });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/blogs/:id
// @desc    Update blog
router.put('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, content, excerpt, cover_image, tags, category,
      is_published, is_featured, meta_description, author, attachments
    } = req.body;

    // Get current blog to check publish status change
    const currentBlog = await db.query('SELECT is_published, published_at FROM blogs WHERE id = $1', [id]);
    if (currentBlog.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const reading_time = content ? calculateReadingTime(content) : undefined;
    
    // Set published_at if publishing for first time
    let published_at = currentBlog.rows[0].published_at;
    if (is_published && !currentBlog.rows[0].is_published) {
      published_at = new Date();
    }

    const result = await db.query(`
      UPDATE blogs SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        excerpt = COALESCE($3, excerpt),
        cover_image = COALESCE($4, cover_image),
        tags = COALESCE($5, tags),
        category = COALESCE($6, category),
        reading_time = COALESCE($7, reading_time),
        is_published = COALESCE($8, is_published),
        is_featured = COALESCE($9, is_featured),
        meta_description = COALESCE($10, meta_description),
        published_at = $11,
        author = COALESCE($12, author),
        attachments = COALESCE($13, attachments),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `, [
      title, content, excerpt, cover_image, tags, category,
      reading_time, is_published, is_featured, meta_description,
      published_at, author, attachments ? JSON.stringify(attachments) : null, id
    ]);

    // Invalidate blog cache
    await cache.delByPattern('portfolio:blogs:*');

    res.json({ success: true, blog: result.rows[0] });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/blogs/:id
// @desc    Delete blog
router.delete('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM blogs WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Invalidate blog cache
    await cache.delByPattern('portfolio:blogs:*');

    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/blogs/:id/publish
// @desc    Toggle publish status
router.put('/blogs/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    const published_at = is_published ? new Date() : null;

    const result = await db.query(`
      UPDATE blogs SET 
        is_published = $1,
        published_at = COALESCE(published_at, $2),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [is_published, published_at, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Invalidate blog cache
    await cache.delByPattern('portfolio:blogs:*');

    res.json({ success: true, blog: result.rows[0] });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== PHOTO VAULT ====================

// @route   GET /api/admin/photos/albums
// @desc    Get all albums
router.get('/photos/albums', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pa.*, 
        p.thumbnail_url as cover_thumbnail,
        p.url as cover_url
      FROM photo_albums pa
      LEFT JOIN photos p ON pa.cover_photo_id = p.id
      ORDER BY pa.created_at DESC
    `);
    res.json({ success: true, albums: result.rows });
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/photos/albums
// @desc    Create album
router.post('/photos/albums', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Album name is required' });
    }

    const result = await db.query(`
      INSERT INTO photo_albums (name, description)
      VALUES ($1, $2)
      RETURNING *
    `, [name, description || null]);

    res.json({ success: true, album: result.rows[0] });
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/photos/albums/:id
// @desc    Update album
router.put('/photos/albums/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, cover_photo_id } = req.body;

    const result = await db.query(`
      UPDATE photo_albums SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        cover_photo_id = COALESCE($3, cover_photo_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [name, description, cover_photo_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }

    res.json({ success: true, album: result.rows[0] });
  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/photos/albums/:id
// @desc    Delete album (photos will be moved to uncategorized)
router.delete('/photos/albums/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Don't delete the uncategorized album
    const album = await db.query('SELECT name FROM photo_albums WHERE id = $1', [id]);
    if (album.rows[0]?.name === 'Uncategorized') {
      return res.status(400).json({ success: false, message: 'Cannot delete the Uncategorized album' });
    }

    // Get uncategorized album id
    const uncategorized = await db.query("SELECT id FROM photo_albums WHERE name = 'Uncategorized'");
    const uncategorizedId = uncategorized.rows[0]?.id;

    // Move photos to uncategorized
    if (uncategorizedId) {
      await db.query('UPDATE photos SET album_id = $1 WHERE album_id = $2', [uncategorizedId, id]);
    }

    // Delete album
    await db.query('DELETE FROM photo_albums WHERE id = $1', [id]);

    res.json({ success: true, message: 'Album deleted' });
  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/photos
// @desc    Get photos with pagination
router.get('/photos', async (req, res) => {
  try {
    const { 
      album_id, 
      page = 1, 
      limit = 36, 
      favorites_only = false,
      search = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereClause = '';
    let paramIndex = 1;

    // Build WHERE clause
    const conditions = [];

    if (album_id && album_id !== 'all') {
      conditions.push(`album_id = $${paramIndex}`);
      params.push(parseInt(album_id));
      paramIndex++;
    }

    if (favorites_only === 'true') {
      conditions.push('is_favorite = true');
    }

    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR $${paramIndex + 1} = ANY(tags))`);
      params.push(`%${search}%`, search.toLowerCase());
      paramIndex += 2;
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM photos ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const totalPhotos = parseInt(countResult.rows[0].count);

    // Get photos
    const photosQuery = `
      SELECT p.*, pa.name as album_name
      FROM photos p
      LEFT JOIN photo_albums pa ON p.album_id = pa.id
      ${whereClause}
      ORDER BY p.upload_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit), offset);

    const result = await db.query(photosQuery, params);

    res.json({
      success: true,
      photos: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPhotos,
        totalPages: Math.ceil(totalPhotos / parseInt(limit)),
        hasMore: offset + result.rows.length < totalPhotos
      }
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/photos
// @desc    Save photo metadata (after Cloudinary upload)
router.post('/photos', async (req, res) => {
  try {
    const { 
      url, 
      public_id, 
      thumbnail_url, 
      album_id, 
      title, 
      description, 
      width, 
      height, 
      file_size, 
      format,
      tags 
    } = req.body;

    if (!url || !public_id) {
      return res.status(400).json({ success: false, message: 'URL and public_id are required' });
    }

    // Get default album if no album specified
    let finalAlbumId = album_id;
    if (!finalAlbumId) {
      const defaultAlbum = await db.query("SELECT id FROM photo_albums WHERE name = 'Uncategorized'");
      finalAlbumId = defaultAlbum.rows[0]?.id;
    }

    const result = await db.query(`
      INSERT INTO photos (url, public_id, thumbnail_url, album_id, title, description, width, height, file_size, format, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [url, public_id, thumbnail_url, finalAlbumId, title, description, width, height, file_size, format, tags || []]);

    // Update album photo count
    if (finalAlbumId) {
      await db.query(`
        UPDATE photo_albums SET 
          photo_count = (SELECT COUNT(*) FROM photos WHERE album_id = $1),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [finalAlbumId]);
    }

    res.json({ success: true, photo: result.rows[0] });
  } catch (error) {
    console.error('Save photo error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/photos/bulk
// @desc    Save multiple photos metadata
router.post('/photos/bulk', async (req, res) => {
  try {
    const { photos, album_id } = req.body;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ success: false, message: 'Photos array is required' });
    }

    // Get default album if no album specified
    let finalAlbumId = album_id;
    if (!finalAlbumId) {
      const defaultAlbum = await db.query("SELECT id FROM photo_albums WHERE name = 'Uncategorized'");
      finalAlbumId = defaultAlbum.rows[0]?.id;
    }

    const savedPhotos = [];
    for (const photo of photos) {
      const result = await db.query(`
        INSERT INTO photos (url, public_id, thumbnail_url, album_id, title, width, height, file_size, format)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        photo.url, 
        photo.public_id, 
        photo.thumbnail_url, 
        finalAlbumId, 
        photo.title || photo.original_filename,
        photo.width,
        photo.height,
        photo.bytes,
        photo.format
      ]);
      savedPhotos.push(result.rows[0]);
    }

    // Update album photo count
    if (finalAlbumId) {
      await db.query(`
        UPDATE photo_albums SET 
          photo_count = (SELECT COUNT(*) FROM photos WHERE album_id = $1),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [finalAlbumId]);
    }

    res.json({ success: true, photos: savedPhotos, count: savedPhotos.length });
  } catch (error) {
    console.error('Bulk save photos error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/photos/:id
// @desc    Update photo metadata
router.put('/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { album_id, title, description, tags, is_favorite } = req.body;

    // Get current album to update counts
    const currentPhoto = await db.query('SELECT album_id FROM photos WHERE id = $1', [id]);
    const oldAlbumId = currentPhoto.rows[0]?.album_id;

    const result = await db.query(`
      UPDATE photos SET
        album_id = COALESCE($1, album_id),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        tags = COALESCE($4, tags),
        is_favorite = COALESCE($5, is_favorite)
      WHERE id = $6
      RETURNING *
    `, [album_id, title, description, tags, is_favorite, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    // Update album counts if album changed
    if (album_id && album_id !== oldAlbumId) {
      if (oldAlbumId) {
        await db.query(`
          UPDATE photo_albums SET photo_count = (SELECT COUNT(*) FROM photos WHERE album_id = $1)
          WHERE id = $1
        `, [oldAlbumId]);
      }
      await db.query(`
        UPDATE photo_albums SET photo_count = (SELECT COUNT(*) FROM photos WHERE album_id = $1)
        WHERE id = $1
      `, [album_id]);
    }

    res.json({ success: true, photo: result.rows[0] });
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/photos/:id/favorite
// @desc    Toggle favorite status
router.put('/photos/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      UPDATE photos SET is_favorite = NOT is_favorite
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    res.json({ success: true, photo: result.rows[0] });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/photos/:id
// @desc    Delete photo (metadata only - Cloudinary deletion handled separately)
router.delete('/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const photo = await db.query('SELECT * FROM photos WHERE id = $1', [id]);
    if (photo.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    const albumId = photo.rows[0].album_id;
    const publicId = photo.rows[0].public_id;

    await db.query('DELETE FROM photos WHERE id = $1', [id]);

    // Update album count
    if (albumId) {
      await db.query(`
        UPDATE photo_albums SET photo_count = (SELECT COUNT(*) FROM photos WHERE album_id = $1)
        WHERE id = $1
      `, [albumId]);
    }

    res.json({ success: true, message: 'Photo deleted', public_id: publicId });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/photos/bulk
// @desc    Delete multiple photos
router.delete('/photos/bulk', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Photo IDs are required' });
    }

    // Get public_ids for Cloudinary deletion
    const photos = await db.query(
      'SELECT public_id, album_id FROM photos WHERE id = ANY($1)',
      [ids]
    );

    const publicIds = photos.rows.map(p => p.public_id);
    const albumIds = [...new Set(photos.rows.map(p => p.album_id).filter(Boolean))];

    // Delete photos
    await db.query('DELETE FROM photos WHERE id = ANY($1)', [ids]);

    // Update album counts
    for (const albumId of albumIds) {
      await db.query(`
        UPDATE photo_albums SET photo_count = (SELECT COUNT(*) FROM photos WHERE album_id = $1)
        WHERE id = $1
      `, [albumId]);
    }

    res.json({ 
      success: true, 
      message: `${ids.length} photos deleted`, 
      public_ids: publicIds 
    });
  } catch (error) {
    console.error('Bulk delete photos error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/photos/stats
// @desc    Get photo vault statistics
router.get('/photos/stats', async (req, res) => {
  try {
    const [totalPhotos, totalAlbums, favorites, storage] = await Promise.all([
      db.query('SELECT COUNT(*) FROM photos'),
      db.query('SELECT COUNT(*) FROM photo_albums'),
      db.query('SELECT COUNT(*) FROM photos WHERE is_favorite = true'),
      db.query('SELECT COALESCE(SUM(file_size), 0) as total_size FROM photos')
    ]);

    res.json({
      success: true,
      stats: {
        totalPhotos: parseInt(totalPhotos.rows[0].count),
        totalAlbums: parseInt(totalAlbums.rows[0].count),
        favorites: parseInt(favorites.rows[0].count),
        totalStorageBytes: parseInt(storage.rows[0].total_size),
        totalStorageMB: (parseInt(storage.rows[0].total_size) / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get photo stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
