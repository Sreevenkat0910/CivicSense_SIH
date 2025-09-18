import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get notifications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 20, is_read } = req.query;

    let query = supabase
      .from('notifications')
      .select(`
        id,
        title,
        message,
        type,
        is_read,
        related_report_id,
        created_at,
        reports!notifications_related_report_id_fkey (
          report_id,
          title,
          status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (is_read !== undefined) {
      query = query.eq('is_read', is_read === 'true');
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return res.status(200).json({
      success: true,
      notifications: notifications || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      },
      unread_count: unreadCount || 0
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.user;

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select('id, is_read')
      .single();

    if (error || !notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.status(200).json({
      success: true,
      notification: notification
    });
  } catch (err) {
    console.error('Mark notification as read error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to mark notifications as read' });
    }

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    console.error('Mark all notifications as read error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.user;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to delete notification' });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (err) {
    console.error('Delete notification error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Create notification (admin/system use)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { target_user_id, title, message, type = 'info', related_report_id } = req.body;

    if (!target_user_id || !title || !message) {
      return res.status(400).json({ error: 'target_user_id, title, and message are required' });
    }

    // Check if current user is admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('usertype_id, user_types(type_name)')
      .eq('user_id', userId)
      .single();

    if (userError || !currentUser || currentUser.user_types?.type_name !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const validTypes = ['info', 'warning', 'error', 'success'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: target_user_id,
        title: title.trim(),
        message: message.trim(),
        type: type,
        related_report_id: related_report_id || null
      })
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create notification' });
    }

    return res.status(201).json({
      success: true,
      notification: notification
    });
  } catch (err) {
    console.error('Create notification error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get notification statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // Get notification counts
    const { count: totalCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    // Get notifications by type
    const { data: typeStats, error: typeError } = await supabase
      .from('notifications')
      .select('type')
      .eq('user_id', userId);

    const typeCounts = {};
    if (!typeError && typeStats) {
      typeStats.forEach(notification => {
        typeCounts[notification.type] = (typeCounts[notification.type] || 0) + 1;
      });
    }

    return res.status(200).json({
      success: true,
      statistics: {
        total: totalCount || 0,
        unread: unreadCount || 0,
        read: (totalCount || 0) - (unreadCount || 0),
        by_type: typeCounts
      }
    });
  } catch (err) {
    console.error('Get notification statistics error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

export default router;
