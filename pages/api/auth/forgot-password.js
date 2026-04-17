import { getUser, createResetToken } from '../../../lib/kv';
import { Resend } from 'resend';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Always return success to avoid user enumeration
  const user = await getUser(email);
  if (!user) {
    return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
  }

  const token = await createResetToken(email);
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Glenn at Atlantic Walk Research <noreply@atlanticwalkresearch.com>',
        to: email,
        subject: 'Reset your Atlantic Walk Research password',
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:40px 20px;">
            <div style="background:white;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <h1 style="margin:0 0 20px 0;color:#111827;font-size:22px;font-weight:700;">
                Reset your password
              </h1>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px 0;">
                We received a request to reset the password for your Atlantic Walk Research account.
                Click the button below to choose a new password. This link expires in 1 hour.
              </p>
              <a href="${resetUrl}"
                 style="display:inline-block;background:#1d4ed8;color:white;font-weight:600;font-size:14px;padding:11px 24px;border-radius:8px;text-decoration:none;margin-bottom:24px;">
                Reset password →
              </a>
              <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0;">
                If you didn't request this, you can safely ignore this email — your password won't change.<br/>
                — Atlantic Walk Research
              </p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error('[forgot-password] Email error:', err.message);
    }
  }

  return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
}
