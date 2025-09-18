import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Mock data for testing when database is not available
const mockSchedules = [
  {
    id: '1',
    user_id: 'admin-001',
    title: 'Weekly Team Meeting',
    description: 'Review progress and plan upcoming tasks',
    start_time: '2024-01-20T10:00:00Z',
    end_time: '2024-01-20T11:00:00Z',
    location: 'Conference Room A',
    is_recurring: true,
    recurrence_pattern: 'weekly',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    user_id: 'dept-001',
    title: 'Department Review',
    description: 'Monthly department performance review',
    start_time: '2024-01-22T14:00:00Z',
    end_time: '2024-01-22T16:00:00Z',
    location: 'Department Office',
    is_recurring: false,
    recurrence_pattern: null,
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z'
  },
  {
    id: '3',
    user_id: 'citizen-001',
    title: 'Community Meeting',
    description: 'Discuss local civic issues',
    start_time: '2024-01-25T18:00:00Z',
    end_time: '2024-01-25T20:00:00Z',
    location: 'Community Center',
    is_recurring: false,
    recurrence_pattern: null,
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z'
  },
  {
    id: '4',
    user_id: 'admin-001',
    title: 'System Maintenance',
    description: 'Scheduled system maintenance window',
    start_time: '2024-01-28T02:00:00Z',
    end_time: '2024-01-28T04:00:00Z',
    location: 'Data Center',
    is_recurring: true,
    recurrence_pattern: 'monthly',
    created_at: '2024-01-18T12:00:00Z',
    updated_at: '2024-01-18T12:00:00Z'
  },
  {
    id: '5',
    user_id: 'dept-001',
    title: 'Training Session',
    description: 'New software training for team members',
    start_time: '2024-01-30T09:00:00Z',
    end_time: '2024-01-30T17:00:00Z',
    location: 'Training Room',
    is_recurring: false,
    recurrence_pattern: null,
    created_at: '2024-01-19T14:00:00Z',
    updated_at: '2024-01-19T14:00:00Z'
  }
];

// Check if database is available
const isDatabaseAvailable = () => {
  return false; // Temporarily use mock data until database is properly set up
};

// Get schedules for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { 
      page = 1, 
      limit = 20, 
      start_date, 
      end_date,
      is_recurring 
    } = req.query;

    if (isDatabaseAvailable()) {
      // Use Supabase database
      let query = supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

      // Apply date filters
      if (start_date) {
        query = query.gte('start_time', start_date);
      }
      if (end_date) {
        query = query.lte('end_time', end_date);
      }
      if (is_recurring !== undefined) {
        query = query.eq('is_recurring', is_recurring === 'true');
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: schedules, error } = await query;

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch schedules' });
      }

      // Get total count
      const { count: totalCount } = await supabase
        .from('schedules')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return res.status(200).json({
        success: true,
        schedules: schedules || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        }
      });
    } else {
      // Use mock data
      let filteredSchedules = mockSchedules.filter(schedule => schedule.user_id === userId);

      // Apply date filters
      if (start_date) {
        filteredSchedules = filteredSchedules.filter(schedule => 
          new Date(schedule.start_time) >= new Date(start_date)
        );
      }
      if (end_date) {
        filteredSchedules = filteredSchedules.filter(schedule => 
          new Date(schedule.end_time) <= new Date(end_date)
        );
      }
      if (is_recurring !== undefined) {
        filteredSchedules = filteredSchedules.filter(schedule => 
          schedule.is_recurring === (is_recurring === 'true')
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);

      return res.status(200).json({
        success: true,
        schedules: paginatedSchedules,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredSchedules.length,
          pages: Math.ceil(filteredSchedules.length / limit)
        }
      });
    }
  } catch (err) {
    console.error('Get schedules error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get schedule by ID
router.get('/:scheduleId', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { userId } = req.user;

    const { data: schedule, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .single();

    if (error || !schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    return res.status(200).json({
      success: true,
      schedule: schedule
    });
  } catch (err) {
    console.error('Get schedule error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Create new schedule
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { 
      title, 
      description, 
      start_time, 
      end_time, 
      location,
      is_recurring = false,
      recurrence_pattern 
    } = req.body;

    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: 'title, start_time, and end_time are required' });
    }

    // Validate time range
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    
    if (endDate <= startDate) {
      return res.status(400).json({ error: 'end_time must be after start_time' });
    }

    // Validate recurrence pattern if recurring
    if (is_recurring && recurrence_pattern) {
      const validPatterns = ['daily', 'weekly', 'monthly'];
      if (!validPatterns.includes(recurrence_pattern)) {
        return res.status(400).json({ error: 'Invalid recurrence pattern' });
      }
    }

    if (isDatabaseAvailable()) {
      // Use Supabase database
      const { data: schedule, error } = await supabase
        .from('schedules')
        .insert({
          user_id: userId,
          title: title.trim(),
          description: description?.trim() || null,
          start_time: start_time,
          end_time: end_time,
          location: location?.trim() || null,
          is_recurring: is_recurring,
          recurrence_pattern: is_recurring ? recurrence_pattern : null
        })
        .select('*')
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to create schedule' });
      }

      return res.status(201).json({
        success: true,
        schedule: schedule
      });
    } else {
      // Use mock data
      const newSchedule = {
        id: String(mockSchedules.length + 1),
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || null,
        start_time: start_time,
        end_time: end_time,
        location: location?.trim() || null,
        is_recurring: is_recurring,
        recurrence_pattern: is_recurring ? recurrence_pattern : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockSchedules.push(newSchedule);

      return res.status(201).json({
        success: true,
        schedule: newSchedule
      });
    }
  } catch (err) {
    console.error('Create schedule error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Update schedule
router.patch('/:scheduleId', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { userId } = req.user;
    const { 
      title, 
      description, 
      start_time, 
      end_time, 
      location,
      is_recurring,
      recurrence_pattern 
    } = req.body;

    // Check if schedule exists and belongs to user
    const { data: existingSchedule, error: checkError } = await supabase
      .from('schedules')
      .select('id')
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (start_time) updateData.start_time = start_time;
    if (end_time) updateData.end_time = end_time;
    if (location !== undefined) updateData.location = location?.trim() || null;
    if (is_recurring !== undefined) updateData.is_recurring = is_recurring;
    if (recurrence_pattern !== undefined) updateData.recurrence_pattern = recurrence_pattern;

    updateData.updated_at = new Date().toISOString();

    // Validate time range if both times are provided
    if (start_time && end_time) {
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      
      if (endDate <= startDate) {
        return res.status(400).json({ error: 'end_time must be after start_time' });
      }
    }

    const { data: schedule, error } = await supabase
      .from('schedules')
      .update(updateData)
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to update schedule' });
    }

    return res.status(200).json({
      success: true,
      schedule: schedule
    });
  } catch (err) {
    console.error('Update schedule error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Delete schedule
router.delete('/:scheduleId', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { userId } = req.user;

    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to delete schedule' });
    }

    return res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (err) {
    console.error('Delete schedule error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get schedules for a specific date range (for calendar views)
router.get('/calendar/:startDate/:endDate', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const { userId } = req.user;

    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate)
      .lte('end_time', endDate)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch calendar schedules' });
    }

    return res.status(200).json({
      success: true,
      schedules: schedules || []
    });
  } catch (err) {
    console.error('Get calendar schedules error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get upcoming schedules (next 7 days)
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit = 10 } = req.query;

    const now = new Date().toISOString();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekISO = nextWeek.toISOString();

    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', now)
      .lte('start_time', nextWeekISO)
      .order('start_time', { ascending: true })
      .limit(parseInt(limit));

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch upcoming schedules' });
    }

    return res.status(200).json({
      success: true,
      schedules: schedules || []
    });
  } catch (err) {
    console.error('Get upcoming schedules error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

export default router;
