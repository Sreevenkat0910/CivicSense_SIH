import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { supabase } from '../lib/supabase.js';
import { generateReportId } from '../utils/id.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/photos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload photos endpoint
router.post('/upload-photos', upload.array('photos', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded' });
    }

    const uploadedPhotos = req.files.map(file => ({
      url: `http://192.168.1.8:4000/uploads/photos/${file.filename}`,
      caption: '',
      fileName: file.originalname,
      type: file.mimetype,
      size: file.size,
    }));

    return res.status(200).json({
      success: true,
      photos: uploadedPhotos
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// Create a new report
router.post('/', async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      locationText,
      latitude,
      longitude,
      photos = [],
      voiceNoteUrl,
      department,
      reporterEmail,
      reporterUserId,
      priority = 'medium',
    } = req.body;

    if (!title || !category || !description || !department) {
      return res.status(400).json({ error: 'Missing required fields: title, category, description, and department are required' });
    }

    // Validate photos format - should be array of objects with url and optional caption
    if (photos && !Array.isArray(photos)) {
      return res.status(400).json({ error: 'Photos must be an array' });
    }

    // Validate each photo object
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        if (!photo.url || typeof photo.url !== 'string') {
          return res.status(400).json({ error: 'Each photo must have a valid URL' });
        }
      }
    }

    // Validate voice note URL if provided
    if (voiceNoteUrl && typeof voiceNoteUrl !== 'string') {
      return res.status(400).json({ error: 'Voice note URL must be a string' });
    }

    // Validate coordinates if provided
    if (latitude !== undefined && (typeof latitude !== 'number' || latitude < -90 || latitude > 90)) {
      return res.status(400).json({ error: 'Invalid latitude value' });
    }
    if (longitude !== undefined && (typeof longitude !== 'number' || longitude < -180 || longitude > 180)) {
      return res.status(400).json({ error: 'Invalid longitude value' });
    }

    const departmentCode = department.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'GEN';
    const reportId = await generateReportId(departmentCode);

    const { data, error } = await supabase
      .from('reports')
      .insert({
        report_id: reportId,
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        location_text: locationText?.trim() || null,
        latitude: latitude || null,
        longitude: longitude || null,
        photos: photos || [],
        voice_note_url: voiceNoteUrl || null,
        department: department.trim(),
        reporter_email: reporterEmail?.trim() || null,
      })
      .select('id, report_id, title, category, created_at')
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ 
      success: true,
      reportId: data.report_id, 
      id: data.id,
      title: data.title,
      category: data.category,
      createdAt: data.created_at
    });
  } catch (err) {
    console.error('Report creation error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ 
      success: true,
      reports: data,
      count: data.length
    });
  } catch (err) {
    console.error('Get reports error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get a specific report by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('report_id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.status(200).json({ 
      success: true,
      report: data
    });
  } catch (err) {
    console.error('Get report error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

export default router;


