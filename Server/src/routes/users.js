import express from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../lib/supabase.js';
import { generateUserId } from '../utils/id.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, mobile, language = 'English', password, usertype_id = 'CITIZEN', department, mandal_area } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const { data: existing, error: existErr } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    if (existErr) return res.status(500).json({ error: existErr.message });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    // Verify usertype exists
    const { data: usertype, error: usertypeError } = await supabase
      .from('usertype')
      .select('usertype_id')
      .eq('usertype_id', usertype_id)
      .eq('is_active', true)
      .single();
    
    if (usertypeError) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await generateUserId();
    const { data, error } = await supabase
      .from('users')
      .insert({ 
        user_id: userId, 
        full_name: fullName, 
        email, 
        mobile, 
        language, 
        password_hash: passwordHash,
        usertype_id: usertype_id,
        department: department || null,
        mandal_area: mandal_area || null
      })
      .select('id, user_id, usertype_id, department, mandal_area')
      .single();
    if (error) return res.status(500).json({ error: error.message, details: error.details || null });
    return res.status(201).json({ 
      userId: data.user_id, 
      id: data.id, 
      fullName, 
      email, 
      mobile, 
      language,
      usertype_id: data.usertype_id,
      department: data.department,
      mandal_area: data.mandal_area
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

    // Find user by email with user type information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id, user_id, full_name, email, mobile, language, password_hash,
        usertype_id, department, mandal_area, is_active,
        usertype:usertype_id(
          usertype_id,
          type_name,
          description,
          permissions
        )
      `)
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();

    if (userError) return res.status(500).json({ error: userError.message });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
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


