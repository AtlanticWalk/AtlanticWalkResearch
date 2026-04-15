import { Resend } from 'resend';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (!process.env.RESEND_API_KEY) {
    // Local dev fallback — log and acknowledge
    console.log(`[Subscribe] No RESEND_API_KEY configured. Would subscribe: ${email}`);
    return res.status(201).json({ message: 'Successfully subscribed' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Notify Glenn of new subscriber
    await resend.emails.send({
      from: 'Atlantic Walk Research <noreply@atlanticwalkresearch.com>',
      to: 'grentrop@atlanticwalkresearch.com',
      subject: `New subscriber: ${email}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#1e40af;">New Newsletter Subscriber</h2>
          <p style="font-size:16px;">Someone just subscribed to Atlantic Walk Research:</p>
          <p style="font-size:20px;font-weight:bold;color:#111;">${email}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="font-size:12px;color:#6b7280;">Atlantic Walk Research · Independent Equity Research</p>
        </div>
      `,
    });

    return res.status(201).json({ message: 'Successfully subscribed' });
  } catch (error) {
    console.error('[Subscribe] Resend error:', error);
    return res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
}
