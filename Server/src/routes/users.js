import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateUserId } from '../utils/id.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, mobile, language = 'English', password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await generateUserId();
    const user = await User.create({ userId, fullName, email, mobile, language, passwordHash });
    return res.status(201).json({ userId: user.userId, _id: user._id, fullName, email, mobile, language });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


