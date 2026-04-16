import bcrypt from 'bcryptjs';
import { getUser, setUser } from '../../../lib/kv';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const existing = await getUser(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await setUser(email, {
    email: email.toLowerCase(),
    passwordHash,
    isSubscribed: false,
    stripeCustomerId: null,
    subscriptionId: null,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({ message: 'Account created successfully' });
}
