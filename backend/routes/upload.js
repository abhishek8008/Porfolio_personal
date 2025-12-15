const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  }
});

// Multer for blog attachments (documents)
const uploadAttachment = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, ZIP'));
    }
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'portfolio',
      ...options
    };

    cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }).end(buffer);
  });
};

// @route   POST /api/upload/image
// @desc    Upload image to Cloudinary
// @access  Private (Admin only)
router.post('/image', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'portfolio/images';
    
    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// @route   POST /api/upload/profile-pic
// @desc    Upload profile picture
// @access  Private (Admin only)
router.post('/profile-pic', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'portfolio/profile',
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    console.error('Upload profile pic error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// @route   POST /api/upload/project-image
// @desc    Upload project image
// @access  Private (Admin only)
router.post('/project-image', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'portfolio/projects',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 630, crop: 'fill' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      message: 'Project image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    console.error('Upload project image error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// @route   POST /api/upload/certificate
// @desc    Upload certificate image
// @access  Private (Admin only)
router.post('/certificate', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'portfolio/certificates',
      resource_type: 'image',
      transformation: [
        { width: 800, quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    console.error('Upload certificate error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// @route   POST /api/upload/resume
// @desc    Upload resume (PDF)
// @access  Private (Admin only)
router.post('/resume', authMiddleware, adminOnly, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, message: 'Only PDF files are allowed for resume' });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'portfolio/resume',
      resource_type: 'raw',
      public_id: `resume_${Date.now()}`
    });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// @route   DELETE /api/upload/:public_id
// @desc    Delete file from Cloudinary
// @access  Private (Admin only)
router.delete('/:public_id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { public_id } = req.params;
    const { resource_type } = req.query;

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type || 'image'
    });

    if (result.result === 'ok') {
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to delete file' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ success: false, message: error.message || 'Delete failed' });
  }
});

// @route   POST /api/upload/blog-image
// @desc    Upload blog cover image
// @access  Private (Admin only)
router.post('/blog-image', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'portfolio/blog',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 630, crop: 'fill' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      message: 'Blog image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    console.error('Upload blog image error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// @route   POST /api/upload/blog-attachment
// @desc    Upload blog attachment (PDF, DOC, PPT, etc.)
// @access  Private (Admin only)
router.post('/blog-attachment', authMiddleware, adminOnly, uploadAttachment.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const originalName = req.file.originalname;
    const fileExtension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'portfolio/blog-attachments',
      resource_type: 'raw',
      public_id: `${baseName}_${Date.now()}.${fileExtension}`,
      use_filename: true
    });

    res.json({
      success: true,
      message: 'Attachment uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        filename: originalName,
        size: req.file.size,
        type: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload blog attachment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

module.exports = router;
