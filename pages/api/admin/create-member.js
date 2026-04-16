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
  if (existing && existing.isSubscribed) {
    return res.status(409).json({ error: 'This email already has an active account' });
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

  // Send welcome email
  let emailResult = { sent: false, error: null };

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: 'Glenn at Atlantic Walk Research <noreply@atlanticwalkresearch.com>',
        to: email,
        subject: 'You have been invited to Atlantic Walk Research',
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:40px 20px;">
            <div style="background:white;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <h1 style="margin:0 0 20px 0;color:#111827;font-size:22px;font-weight:700;">
                You've been invited
              </h1>

              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px 0;">
                I've set up a complimentary Atlantic Walk Research membership for you.
                Use the details below to access the members portal.
              </p>

              <table style="width:100%;border-collapse:collapse;margin:0 0 24px 0;">
                <tr>
                  <td style="padding:10px 14px;background:#f3f4f6;border-radius:6px 6px 0 0;font-size:13px;color:#6b7280;font-weight:500;">Email</td>
                  <td style="padding:10px 14px;background:#f3f4f6;border-radius:6px 6px 0 0;font-size:14px;color:#111827;">${email}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;background:#eff6ff;border-radius:0 0 6px 6px;font-size:13px;color:#6b7280;font-weight:500;border-top:1px solid #e5e7eb;">Access code</td>
                  <td style="padding:10px 14px;background:#eff6ff;border-radius:0 0 6px 6px;font-size:14px;color:#1d4ed8;font-family:monospace;font-weight:600;border-top:1px solid #e5e7eb;">${tempPassword}</td>
                </tr>
              </table>

              <a href="https://atlanticwalkresearch.com/login"
                 style="display:inline-block;background:#1d4ed8;color:white;font-weight:600;font-size:14px;padding:11px 24px;border-radius:8px;text-decoration:none;margin-bottom:24px;">
                Open members portal →
              </a>

              <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0;">
                You can update your access code after signing in.<br/>
                — Glenn, Atlantic Walk Research
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('[create-member] Resend error:', JSON.stringify(error));
        emailResult = { sent: false, error: error.message };
      } else {
        console.log('[create-member] Email sent:', data?.id);
        emailResult = { sent: true, id: data?.id };
      }
    } catch (err) {
      console.error('[create-member] Email exception:', err.message);
      emailResult = { sent: false, error: err.message };
    }
  }

  return res.status(201).json({
    message: 'Member created',
    email,
    tempPassword,
    emailResult,
  });
}
