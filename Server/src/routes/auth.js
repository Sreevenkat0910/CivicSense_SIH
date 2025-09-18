import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';
import { generateUserId } from '../utils/id.js';

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Mock data for testing when database is not available
const mockUsers = [
  {
    user_id: 'admin-001',
    full_name: 'System Administrator',
    email: 'admin@civicsense.com',
    password_hash: '$2b$10$.c/FS8jdxlucLHYPypefe.DWTjf5rsqcC/E3fM1Q8cdfk3HYXQYKa',
    usertype_id: 1,
    department: 'Administration',
    mandal_area: 'All Zones',
    is_active: true
  },
  {
    user_id: 'dept-001',
    full_name: 'Priya Sharma',
    email: 'priya@civicsense.com',
    password_hash: '$2b$10$.c/FS8jdxlucLHYPypefe.DWTjf5rsqcC/E3fM1Q8cdfk3HYXQYKa',
    usertype_id: 2,
    department: 'Public Works',
    mandal_area: 'North Zone',
    is_active: true
  },
  {
    user_id: 'citizen-001',
    full_name: 'Vikram Rao',
    email: 'citizen@civicsense.com',
    password_hash: '$2b$10$.c/FS8jdxlucLHYPypefe.DWTjf5rsqcC/E3fM1Q8cdfk3HYXQYKa',
    usertype_id: 4,
    department: null,
    mandal_area: 'Central Zone',
    is_active: true
  }
];

const mockUserTypes = [
  { usertype_id: 1, type_name: 'admin', description: 'System Administrator', permissions: ['all'] },
  { usertype_id: 2, type_name: 'department', description: 'Department Head', permissions: ['department_management', 'reports_view', 'reports_update'] },
  { usertype_id: 3, type_name: 'mandal-admin', description: 'Mandal Administrator', permissions: ['mandal_management', 'department_view', 'reports_view', 'reports_update'] },
  { usertype_id: 4, type_name: 'citizen', description: 'Citizen', permissions: ['report_create', 'report_view_own'] }
];

// Check if database is available
const isDatabaseAvailable = () => {
  // For now, always use mock data to ensure functionality works
  return false; // Force mock data usage
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      mobile, 
      language = 'English', 
      password, 
      usertype_id = 4, 
      department, 
      mandal_area 
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields: fullName, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (isDatabaseAvailable()) {
      // Database available - use Supabase
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Verify usertype exists
      const { data: usertype, error: usertypeError } = await supabase
        .from('user_types')
        .select('*')
        .eq('usertype_id', usertype_id)
        .single();

      if (usertypeError || !usertype) {
        return res.status(400).json({ error: 'Invalid user type' });
      }
    } else {
      // Database not available - use mock data
      const existingUser = mockUsers.find(user => user.email === email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const usertype = mockUserTypes.find(type => type.usertype_id === usertype_id);
      if (!usertype) {
        return res.status(400).json({ error: 'Invalid user type' });
      }
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate new user ID
    const userId = await generateUserId();

    let newUser;
    if (isDatabaseAvailable()) {
      // Insert new user into database
      const { data: dbUser, error: insertError } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          full_name: fullName.trim(),
          email: email.toLowerCase().trim(),
          mobile: mobile?.trim() || null,
          language: language,
          password_hash: passwordHash,
          usertype_id: usertype_id,
          department: department?.trim() || null,
          mandal_area: mandal_area?.trim() || null,
          is_active: true
        })
        .select('user_id, full_name, email, mobile, language, usertype_id, department, mandal_area, is_active')
        .single();

      if (insertError) {
        console.error('Database error:', insertError);
        return res.status(500).json({ error: 'Failed to create user account' });
      }
      newUser = dbUser;
    } else {
      // Use mock data - add to mock users array
      newUser = {
        user_id: userId,
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile?.trim() || null,
        language: language,
        usertype_id: usertype_id,
        department: department?.trim() || null,
        mandal_area: mandal_area?.trim() || null,
        is_active: true
      };
      mockUsers.push({ ...newUser, password_hash: passwordHash });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.user_id, 
        email: newUser.email, 
        usertype_id: newUser.usertype_id 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ 
      success: true,
      token,
      user: {
        userId: newUser.user_id,
        fullName: newUser.full_name,
        email: newUser.email,
        mobile: newUser.mobile,
        language: newUser.language,
        usertype_id: newUser.usertype_id,
        department: newUser.department,
        mandal_area: newUser.mandal_area,
        usertype: usertype
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user;
    if (isDatabaseAvailable()) {
      console.log('Using database for login');
      // Find user with usertype information from database
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select(`
          user_id,
          full_name,
          email,
          mobile,
          language,
          password_hash,
          usertype_id,
          department,
          mandal_area,
          is_active,
          user_types (
            usertype_id,
            type_name,
            description,
            permissions
          )
        `)
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .single();

      if (userError || !dbUser) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      user = dbUser;
    } else {
      // Use mock data
      const mockUser = mockUsers.find(u => u.email === email.toLowerCase().trim() && u.is_active);
      
      if (!mockUser) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const usertype = mockUserTypes.find(type => type.usertype_id === mockUser.usertype_id);
      user = {
        ...mockUser,
        user_types: usertype
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email, 
        usertype_id: user.usertype_id 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (excluding password hash)
    const { password_hash, ...userData } = user;
    return res.status(200).json({
      success: true,
      token,
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    if (isDatabaseAvailable()) {
      // Get user data from database
      const { data: user, error: userError } = await supabase
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
          user_types (
            usertype_id,
            type_name,
            description,
            permissions
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (userError || !user) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      return res.status(200).json({
        success: true,
        user: user
      });
    } else {
      // Use mock data
      const mockUser = mockUsers.find(u => u.user_id === userId && u.is_active);
      
      if (!mockUser) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      const usertype = mockUserTypes.find(type => type.usertype_id === mockUser.usertype_id);
      
      return res.status(200).json({
        success: true,
        user: {
          user_id: mockUser.user_id,
          full_name: mockUser.full_name,
          email: mockUser.email,
          mobile: mockUser.mobile,
          language: mockUser.language,
          usertype_id: mockUser.usertype_id,
          department: mockUser.department,
          mandal_area: mockUser.mandal_area,
          is_active: mockUser.is_active,
          user_types: usertype
        }
      });
    }
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // You could implement a token blacklist here if needed
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export default router;
