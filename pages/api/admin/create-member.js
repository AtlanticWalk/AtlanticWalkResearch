import bcrypt from 'bcryptjs';
import { getUser, setUser } from '../../../lib/kv';
import { Resend } from 'resend';

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, email, note } = req.body;

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const existing = await getUser(email);
  if (existing) {
    // If already exists but not subscribed, upgrade them
    if (existing.isSubscribed) {
      return res.status(409).json({ error: 'This email already has an active account' });
    }
  }

  const tempPassword = generatePassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await setUser(email, {
    email: email.toLowerCase(),
    passwordHash,
    isSubscribed: true,
    isComplimentary: true,
    stripeCustomerId: null,
    subscriptionId: null,
    note: note || '',
    createdAt: new Date().toISOString(),
  });

  // Send welcome email with login credentials
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Atlantic Walk Research <noreply@atlanticwalkresearch.com>',
      to: email,
      subject: 'Your Atlantic Walk Research membership',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:40px 20px;">
          <div style="background:white;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="margin:0 0 24px 0;color:#1e40af;font-size:24px;font-weight:bold;">Welcome to Atlantic Walk Research</h1>

            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
              You've been given complimentary access to the Atlantic Walk Research members portal.
              Here are your login details:
            </p>

            <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px 20px;margin:0 0 24px 0;border-radius:4px;">
              <p style="margin:0 0 8px 0;color:#374151;font-size:14px;"><strong>Email:</strong> ${email}</p>
              <p style="margin:0;color:#374151;font-size:14px;"><strong>Temporary password:</strong> <span style="font-family:monospace;background:#e0f2fe;padding:2px 6px;border-radius:3px;">${tempPassword}</span></p>
            </div>

            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px 0;">
              Please log in and change your password at your earliest convenience.
            </p>

            <a href="https://atlanticwalkresearch.com/login"
               style="display:inline-block;background:#2563eb;color:white;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Log in to Members Portal
            </a>

            <div style="border-top:1px solid #e5e7eb;margin-top:32px;padding-top:20px;">
              <p style="color:#6b7280;font-size:12px;margin:0;">
                Atlantic Walk Research · Independent Equity Research<br/>
                <a href="https://atlanticwalkresearch.com" style="color:#2563eb;text-decoration:none;">atlanticwalkresearch.com</a>
              </p>
            </div>
          </div>
        </div>
      `,
    });
  }

  return res.status(201).json({ message: 'Member created and invited', email, tempPassword });
}
