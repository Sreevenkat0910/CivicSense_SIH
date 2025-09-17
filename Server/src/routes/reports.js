import express from 'express';
import Report from '../models/Report.js';
import User from '../models/User.js';
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

    let reportedBy = undefined;
    if (reporterEmail) {
      const reporter = await User.findOne({ email: reporterEmail });
      if (reporter) reportedBy = reporter._id;
    }

    const report = await Report.create({
      reportId,
      title,
      category,
      description,
      locationText,
      location: latitude && longitude ? { type: 'Point', coordinates: [longitude, latitude] } : undefined,
      photos,
      voiceNoteUrl,
      department,
      reportedBy,
    });

    return res.status(201).json({ reportId: report.reportId, _id: report._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


