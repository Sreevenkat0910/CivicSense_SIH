import express from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../lib/supabase.js';
import { generateUserId } from '../utils/id.js';
import { mockUsers, mockUserTypes, hashPassword, comparePassword } from '../data/mockData.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, mobile, language = 'English', password, usertype_id = 4, department, mandal_area } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    // Check if email already exists in mock data
    const existing = mockUsers.find(u => u.email === email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    // Verify usertype exists in mock data
    const usertype = mockUserTypes.find(ut => ut.usertype_id === usertype_id);
    if (!usertype) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Generate new user ID
    const userId = await generateUserId();
    const newUser = {
      id: `user-${Date.now()}`,
      user_id: userId,
      full_name: fullName,
      email,
      mobile,
      language,
      password_hash: hashPassword(password),
      usertype_id: usertype_id,
      department: department || null,
      mandal_area: mandal_area || null,
      is_active: true,
      usertype: usertype
    };

    // Add to mock data (in real app, this would be saved to database)
    mockUsers.push(newUser);

    return res.status(201).json({ 
      userId: newUser.user_id, 
      id: newUser.id, 
      fullName, 
      email, 
      mobile, 
      language,
      usertype_id: newUser.usertype_id,
      department: newUser.department,
      mandal_area: newUser.mandal_area
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    // Find user in mock data
    const user = mockUsers.find(u => u.email === email && u.is_active);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // Verify password using mock comparison
    const isValidPassword = comparePassword(password, user.password_hash);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid email or password' });

    // Return user data (excluding password hash)
    const { password_hash, ...userData } = user;
    return res.status(200).json({
      success: true,
      user: userData
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

export default router;


