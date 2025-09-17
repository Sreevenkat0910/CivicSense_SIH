import express from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../lib/supabase.js';
import { generateUserId } from '../utils/id.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, mobile, language = 'English', password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const { data: existing, error: existErr } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    if (existErr) return res.status(500).json({ error: existErr.message });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await generateUserId();
    const { data, error } = await supabase
      .from('users')
      .insert({ user_id: userId, full_name: fullName, email, mobile, language, password_hash: passwordHash })
      .select('id, user_id')
      .single();
    if (error) return res.status(500).json({ error: error.message, details: error.details || null });
    return res.status(201).json({ userId: data.user_id, id: data.id, fullName, email, mobile, language });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
});

export default router;


