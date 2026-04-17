import bcrypt from 'bcryptjs';
import { getResetToken, deleteResetToken, updateUser } from '../../../lib/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, password } = req.body;

  if (!token) return res.status(400).json({ error: 'Missing reset token' });
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const email = await getResetToken(token);
  if (!email) {
    return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await updateUser(email, { passwordHash });
  await deleteResetToken(token);

  return res.status(200).json({ message: 'Password updated successfully.' });
}
