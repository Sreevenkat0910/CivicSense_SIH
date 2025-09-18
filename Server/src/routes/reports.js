import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { supabase } from '../lib/supabase.js';
import { generateReportId } from '../utils/id.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Mock data for testing when database is not available
const mockReports = [
  {
    id: '1',
    report_id: 'PUBW-2024-000001',
    title: 'Broken Street Light',
    category: 'Infrastructure',
    description: 'Street light on Main Road near Central Park is not working for the past 3 days',
    location_text: 'Main Road, Central Park',
    latitude: 18.4361,
    longitude: 79.1282,
    department: 'Public Works',
    mandal_area: 'Central Zone',
    priority: 'medium',
    status: 'submitted',
    reporter_email: 'citizen@civicsense.com',
    reporter_user_id: 'citizen-001',
    assigned_to: null,
    resolution_notes: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    users: {
      user_id: 'citizen-001',
      full_name: 'Vikram Rao',
      email: 'citizen@civicsense.com',
      mobile: '+91 9876543214'
    }
  },
  {
    id: '2',
    report_id: 'WATR-2024-000001',
    title: 'Water Leakage',
    category: 'Water',
    description: 'Water pipe leakage causing water wastage and road damage',
    location_text: 'Gandhi Nagar, Block A',
    latitude: 18.4361,
    longitude: 79.1282,
    department: 'Water Department',
    mandal_area: 'North Zone',
    priority: 'high',
    status: 'in_progress',
    reporter_email: 'citizen@civicsense.com',
    reporter_user_id: 'citizen-001',
    assigned_to: 'Water Department Team',
    resolution_notes: 'Team dispatched, repair work in progress',
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-16T14:30:00Z',
    users: {
      user_id: 'citizen-001',
      full_name: 'Vikram Rao',
      email: 'citizen@civicsense.com',
      mobile: '+91 9876543214'
    }
  },
  {
    id: '3',
    report_id: 'PUBW-2024-000002',
    title: 'Pothole on Highway',
    category: 'Roads',
    description: 'Large pothole on National Highway causing traffic issues',
    location_text: 'NH-44, Near Toll Plaza',
    latitude: 18.4361,
    longitude: 79.1282,
    department: 'Public Works',
    mandal_area: 'South Zone',
    priority: 'high',
    status: 'resolved',
    reporter_email: 'citizen@civicsense.com',
    reporter_user_id: 'citizen-001',
    assigned_to: 'Road Maintenance Team',
    resolution_notes: 'Pothole filled and road resurfaced',
    created_at: '2024-01-13T08:00:00Z',
    updated_at: '2024-01-17T16:00:00Z',
    users: {
      user_id: 'citizen-001',
      full_name: 'Vikram Rao',
      email: 'citizen@civicsense.com',
      mobile: '+91 9876543214'
    }
  }
];

// Check if database is available
const isDatabaseAvailable = () => {
  return false; // Force mock data usage for now
};

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

    if (isDatabaseAvailable()) {
      // Use Supabase database
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
          reporter_user_id: reporterUserId?.trim() || null,
          priority: priority || 'medium',
          status: 'pending'
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
    } else {
      // Use mock data
      const departmentCode = department.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'GEN';
      const reportId = `${departmentCode}-2024-${String(mockReports.length + 1).padStart(6, '0')}`;
      
      const newReport = {
        id: String(mockReports.length + 1),
        report_id: reportId,
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        location_text: locationText?.trim() || null,
        latitude: latitude || null,
        longitude: longitude || null,
        department: department.trim(),
        mandal_area: 'Central Zone',
        priority: priority || 'medium',
        status: 'submitted',
        reporter_email: reporterEmail?.trim() || null,
        reporter_user_id: reporterUserId?.trim() || null,
        assigned_to: null,
        resolution_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        users: {
          user_id: reporterUserId || 'citizen-001',
          full_name: 'Test User',
          email: reporterEmail || 'test@example.com',
          mobile: '+91 9876543210'
        }
      };

      // Add to mock data
      mockReports.push(newReport);

      return res.status(201).json({ 
        success: true,
        reportId: newReport.report_id, 
        id: newReport.id,
        title: newReport.title,
        category: newReport.category,
        createdAt: newReport.created_at
      });
    }
  } catch (err) {
    console.error('Report creation error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      department, 
      category, 
      priority,
      mandal_area,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    if (isDatabaseAvailable()) {
      // Database available - use Supabase
      // Build query
      let query = supabase
        .from('reports')
        .select(`
          id,
          report_id,
          title,
          category,
          description,
          location_text,
          latitude,
          longitude,
          photos,
          voice_note_url,
          department,
          mandal_area,
          priority,
          status,
          reporter_email,
          reporter_user_id,
          created_at,
          updated_at,
          assigned_to,
          resolution_notes,
          users!reports_reporter_user_id_fkey (
            user_id,
            full_name,
            email,
            mobile
          )
        `);

      // Apply filters
      if (status) query = query.eq('status', status);
      if (department) query = query.eq('department', department);
      if (category) query = query.eq('category', category);
      if (priority) query = query.eq('priority', priority);
      if (mandal_area) query = query.eq('mandal_area', mandal_area);

      // Apply sorting
      query = query.order(sort_by, { ascending: sort_order === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: reports, error, count } = await query;

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch reports' });
      }

      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true });

      return res.status(200).json({ 
        success: true,
        reports: reports || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        }
      });
    } else {
      // Use mock data
      let filteredReports = [...mockReports];

      // Apply filters
      if (status) filteredReports = filteredReports.filter(r => r.status === status);
      if (department) filteredReports = filteredReports.filter(r => r.department === department);
      if (category) filteredReports = filteredReports.filter(r => r.category === category);
      if (priority) filteredReports = filteredReports.filter(r => r.priority === priority);
      if (mandal_area) filteredReports = filteredReports.filter(r => r.mandal_area === mandal_area);

      // Apply sorting
      filteredReports.sort((a, b) => {
        const aVal = a[sort_by];
        const bVal = b[sort_by];
        if (sort_order === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit;
      const paginatedReports = filteredReports.slice(from, to);

      return res.status(200).json({ 
        success: true,
        reports: paginatedReports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredReports.length,
          pages: Math.ceil(filteredReports.length / limit)
        }
      });
    }
  } catch (err) {
    console.error('Get reports error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get a specific report by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDatabaseAvailable()) {
      // Use Supabase database
      const { data: report, error } = await supabase
        .from('reports')
        .select(`
          id,
          report_id,
          title,
          category,
          description,
          location_text,
          latitude,
          longitude,
          photos,
          voice_note_url,
          department,
          mandal_area,
          priority,
          status,
          reporter_email,
          reporter_user_id,
          created_at,
          updated_at,
          assigned_to,
          resolution_notes,
          users!reports_reporter_user_id_fkey (
            user_id,
            full_name,
            email,
            mobile
          )
        `)
        .eq('id', id)
        .single();

      if (error || !report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      return res.status(200).json({ 
        success: true,
        report: report
      });
    } else {
      // Use mock data
      const report = mockReports.find(r => r.id === id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      return res.status(200).json({ 
        success: true,
        report: report
      });
    }
  } catch (err) {
    console.error('Get report error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Update report status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to, resolution_notes } = req.body;
    const { userId } = req.user;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['submitted', 'triaged', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    if (isDatabaseAvailable()) {
      // Use Supabase database
      const { data: updatedReport, error } = await supabase
        .from('reports')
        .update({
          status,
          assigned_to: assigned_to || null,
          resolution_notes: resolution_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to update report status' });
      }

      return res.status(200).json({
        success: true,
        report: updatedReport
      });
    } else {
      // Use mock data
      const reportIndex = mockReports.findIndex(r => r.id === id);
      if (reportIndex === -1) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Update the mock report
      mockReports[reportIndex] = {
        ...mockReports[reportIndex],
        status,
        assigned_to: assigned_to || mockReports[reportIndex].assigned_to,
        resolution_notes: resolution_notes || mockReports[reportIndex].resolution_notes,
        updated_at: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        report: mockReports[reportIndex]
      });
    }
  } catch (err) {
    console.error('Update report status error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get reports by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch user reports' });
    }

    const { count: totalCount } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('reporter_user_id', userId);

    return res.status(200).json({
      success: true,
      reports: reports || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (err) {
    console.error('Get user reports error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get nearby reports
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Use PostGIS for geographic queries if available, otherwise use simple distance calculation
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch nearby reports' });
    }

    // Filter by distance (simple calculation)
    const nearbyReports = reports.filter(report => {
      const distance = calculateDistance(latitude, longitude, report.latitude, report.longitude);
      return distance <= radiusKm;
    });

    return res.status(200).json({
      success: true,
      reports: nearbyReports,
      count: nearbyReports.length
    });
  } catch (err) {
    console.error('Get nearby reports error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default router;


