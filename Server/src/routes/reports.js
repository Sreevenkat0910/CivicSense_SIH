import express from 'express';
import { supabase } from '../lib/supabase.js';
import { generateReportId } from '../utils/id.js';

const router = express.Router();

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
    } = req.body;

    if (!title || !category || !description || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const departmentCode = department.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'GEN';
    const reportId = await generateReportId(departmentCode);

    const { data, error } = await supabase
      .from('reports')
      .insert({
        report_id: reportId,
        title,
        category,
        description,
        location_text: locationText,
        latitude,
        longitude,
        photos,
        voice_note_url: voiceNoteUrl,
        department,
        reporter_email: reporterEmail || null,
      })
      .select('id, report_id')
      .single();
    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ reportId: data.report_id, id: data.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


