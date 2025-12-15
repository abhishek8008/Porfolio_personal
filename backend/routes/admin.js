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

module.exports = router;
