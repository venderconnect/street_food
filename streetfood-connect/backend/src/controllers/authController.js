import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body || {};
    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!['vendor', 'supplier'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });
    return res.status(201).json({ id: user._id });
  } catch (err) {
    // Duplicate key (email) handling
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ sub: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, role: user.role, userId: user._id });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
