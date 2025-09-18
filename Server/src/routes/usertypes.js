import express from 'express';
import { supabase } from '../lib/supabase.js';
import { mockUserTypes } from '../data/mockData.js';

const router = express.Router();

// Get all user types
router.get('/', async (req, res) => {
  try {
    // Return mock user types
    return res.status(200).json({ 
      success: true,
      userTypes: mockUserTypes,
      count: mockUserTypes.length
    });
  } catch (err) {
    console.error('Get user types error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Get a specific user type by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('usertype')
      .select('*')
      .eq('usertype_id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'User type not found' });
    }

    return res.status(200).json({ 
      success: true,
      userType: data
    });
  } catch (err) {
    console.error('Get user type error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Create a new user type
router.post('/', async (req, res) => {
  try {
    const {
      usertype_id,
      type_name,
      description,
      permissions = {}
    } = req.body;

    if (!usertype_id || !type_name) {
      return res.status(400).json({ error: 'usertype_id and type_name are required' });
    }

    // Check if usertype_id already exists
    const { data: existingType, error: checkError } = await supabase
      .from('usertype')
      .select('usertype_id')
      .eq('usertype_id', usertype_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Database error:', checkError);
      return res.status(500).json({ error: checkError.message });
    }

    if (existingType) {
      return res.status(400).json({ error: 'User type ID already exists' });
    }

    const { data, error } = await supabase
      .from('usertype')
      .insert({
        usertype_id: usertype_id.trim().toUpperCase(),
        type_name: type_name.trim(),
        description: description?.trim() || null,
        permissions: permissions
      })
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ 
      success: true,
      userType: data
    });
  } catch (err) {
    console.error('Create user type error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Update a user type
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type_name,
      description,
      permissions,
      is_active
    } = req.body;

    const updateData = {};
    if (type_name !== undefined) updateData.type_name = type_name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('usertype')
      .update(updateData)
      .eq('usertype_id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'User type not found' });
    }

    return res.status(200).json({ 
      success: true,
      userType: data
    });
  } catch (err) {
    console.error('Update user type error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Delete a user type (soft delete by setting is_active to false)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if any users are using this user type
    const { data: users, error: checkError } = await supabase
      .from('users')
      .select('user_id')
      .eq('usertype_id', id)
      .limit(1);

    if (checkError) {
      console.error('Database error:', checkError);
      return res.status(500).json({ error: checkError.message });
    }

    if (users && users.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user type. Users are still assigned to this type.' 
      });
    }

    const { data, error } = await supabase
      .from('usertype')
      .update({ is_active: false })
      .eq('usertype_id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'User type not found' });
    }

    return res.status(200).json({ 
      success: true,
      message: 'User type deactivated successfully',
      userType: data
    });
  } catch (err) {
    console.error('Delete user type error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

export default router;
