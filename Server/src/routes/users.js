import express from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../lib/supabase.js';
import { generateUserId } from '../utils/id.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Mock data for testing when database is not available
const mockUsers = [
  {
    user_id: 'admin-001',
    full_name: 'System Administrator',
    email: 'admin@civicsense.com',
    mobile: '+91 9876543210',
    language: 'English',
    usertype_id: 1,
    department: 'Administration',
    mandal_area: 'All Zones',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_types: {
      usertype_id: 1,
      type_name: 'admin',
      description: 'System Administrator',
      permissions: ['all']
    }
  },
  {
    user_id: 'dept-001',
    full_name: 'Priya Sharma',
    email: 'priya@civicsense.com',
    mobile: '+91 9876543211',
    language: 'English',
    usertype_id: 2,
    department: 'Public Works',
    mandal_area: 'North Zone',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_types: {
      usertype_id: 2,
      type_name: 'department',
      description: 'Department Head',
      permissions: ['department_management', 'reports_view', 'reports_update']
    }
  },
  {
    user_id: 'citizen-001',
    full_name: 'Vikram Rao',
    email: 'citizen@civicsense.com',
    mobile: '+91 9876543214',
    language: 'English',
    usertype_id: 4,
    department: null,
    mandal_area: 'Central Zone',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_types: {
      usertype_id: 4,
      type_name: 'citizen',
      description: 'Citizen',
      permissions: ['report_create', 'report_view_own']
    }
  }
];

// Check if database is available
const isDatabaseAvailable = () => {
  return false; // Force mock data usage for now
};

// Get all users (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    if (isDatabaseAvailable()) {
      // Database available - use Supabase
      // Check if user is admin
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('usertype_id, user_types(type_name)')
        .eq('user_id', userId)
        .single();

      if (userError || !currentUser || currentUser.user_types?.type_name !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      }

      const { page = 1, limit = 20, department, mandal_area, usertype_id, is_active } = req.query;

      let query = supabase
        .from('users')
        .select(`
          user_id,
          full_name,
          email,
          mobile,
          language,
          usertype_id,
          department,
          mandal_area,
          is_active,
          created_at,
          updated_at,
          user_types (
            usertype_id,
            type_name,
            description,
            permissions
          )
        `);

      // Apply filters
      if (department) query = query.eq('department', department);
      if (mandal_area) query = query.eq('mandal_area', mandal_area);
      if (usertype_id) query = query.eq('usertype_id', usertype_id);
      if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data: users, error } = await query;

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch users' });
      }

      // Get total count
      const { count: totalCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      return res.status(200).json({
        success: true,
        users: users || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        }
      });
    } else {
      // Use mock data
      const { page = 1, limit = 20, department, mandal_area, usertype_id, is_active } = req.query;
      
      // Check if current user is admin (from token)
      const currentUser = mockUsers.find(u => u.user_id === userId);
      if (!currentUser || currentUser.user_types?.type_name !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      }

      let filteredUsers = [...mockUsers];

      // Apply filters
      if (department) filteredUsers = filteredUsers.filter(u => u.department === department);
      if (mandal_area) filteredUsers = filteredUsers.filter(u => u.mandal_area === mandal_area);
      if (usertype_id) filteredUsers = filteredUsers.filter(u => u.usertype_id === parseInt(usertype_id));
      if (is_active !== undefined) filteredUsers = filteredUsers.filter(u => u.is_active === (is_active === 'true'));

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit;
      const paginatedUsers = filteredUsers.slice(from, to);

      return res.status(200).json({
        success: true,
        users: paginatedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / limit)
        }
      });
    }
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get user by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentUserId } = req.user;

    // Users can only view their own profile unless they're admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('usertype_id, user_types(type_name)')
      .eq('user_id', currentUserId)
      .single();

    if (userError || !currentUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check permissions
    if (userId !== currentUserId && currentUser.user_types?.type_name !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        user_id,
        full_name,
        email,
        mobile,
        language,
        usertype_id,
        department,
        mandal_area,
        is_active,
        created_at,
        updated_at,
        user_types (
          usertype_id,
          type_name,
          description,
          permissions
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: user
    });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Update user profile
router.patch('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentUserId } = req.user;
    const { full_name, mobile, language, department, mandal_area } = req.body;

    // Users can only update their own profile unless they're admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('usertype_id, user_types(type_name)')
      .eq('user_id', currentUserId)
      .single();

    if (userError || !currentUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check permissions
    if (userId !== currentUserId && currentUser.user_types?.type_name !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (full_name) updateData.full_name = full_name.trim();
    if (mobile) updateData.mobile = mobile.trim();
    if (language) updateData.language = language;
    if (department) updateData.department = department.trim();
    if (mandal_area) updateData.mandal_area = mandal_area.trim();

    updateData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', userId)
      .select(`
        user_id,
        full_name,
        email,
        mobile,
        language,
        usertype_id,
        department,
        mandal_area,
        is_active,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }

    return res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Change password
router.patch('/:userId/password', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentUserId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Users can only change their own password
    if (userId !== currentUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get current user with password hash
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('user_id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Database error:', updateError);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Deactivate/Activate user (admin only)
router.patch('/:userId/status', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentUserId } = req.user;
    const { is_active } = req.body;

    // Check if current user is admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('usertype_id, user_types(type_name)')
      .eq('user_id', currentUserId)
      .single();

    if (userError || !currentUser || currentUser.user_types?.type_name !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        is_active: is_active,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select('user_id, full_name, email, is_active')
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to update user status' });
    }

    return res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (err) {
    console.error('Update user status error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // Check if user is admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('usertype_id, user_types(type_name)')
      .eq('user_id', userId)
      .single();

    if (userError || !currentUser || currentUser.user_types?.type_name !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Get user counts by type
    const { data: userStats, error: statsError } = await supabase
      .from('users')
      .select('usertype_id, is_active, user_types(type_name)')
      .eq('is_active', true);

    if (statsError) {
      console.error('Database error:', statsError);
      return res.status(500).json({ error: 'Failed to fetch user statistics' });
    }

    // Process statistics
    const stats = {
      total_active_users: userStats.length,
      by_user_type: {},
      by_department: {},
      by_mandal_area: {}
    };

    // Count by user type
    userStats.forEach(user => {
      const typeName = user.user_types?.type_name || 'unknown';
      stats.by_user_type[typeName] = (stats.by_user_type[typeName] || 0) + 1;
    });

    // Get department and mandal area stats
    const { data: departmentStats, error: deptError } = await supabase
      .from('users')
      .select('department, mandal_area')
      .eq('is_active', true)
      .not('department', 'is', null);

    if (!deptError && departmentStats) {
      departmentStats.forEach(user => {
        if (user.department) {
          stats.by_department[user.department] = (stats.by_department[user.department] || 0) + 1;
        }
        if (user.mandal_area) {
          stats.by_mandal_area[user.mandal_area] = (stats.by_mandal_area[user.mandal_area] || 0) + 1;
        }
      });
    }

    return res.status(200).json({
      success: true,
      statistics: stats
    });
  } catch (err) {
    console.error('Get user statistics error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

export default router;