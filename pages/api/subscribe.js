import { Resend } from 'resend';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OWNER = 'AtlanticWalk';
const REPO  = 'AtlanticWalkResearch';
const FILE  = 'data/subscribers.json';

// Read + update subscribers.json in the GitHub repo
async function persistToGitHub(newEmail) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { alreadyExists: false };

  const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  };

  // Fetch the current file
  const getRes = await fetch(apiUrl, { headers });
  if (!getRes.ok) throw new Error(`GitHub GET failed: ${getRes.status}`);
  const { content, sha } = await getRes.json();

  const current = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));

  // Deduplicate
  if (current.some((s) => s.email === newEmail)) {
    return { alreadyExists: true };
  }

  current.push({ email: newEmail, subscribedAt: new Date().toISOString() });

  // Write it back
  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `newsletter: add subscriber`,
      content: Buffer.from(JSON.stringify(current, null, 2)).toString('base64'),
      sha,
    }),
  });

  if (!putRes.ok) throw new Error(`GitHub PUT failed: ${putRes.status}`);
  return { alreadyExists: false };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // 1. Persist to GitHub
    const { alreadyExists } = await persistToGitHub(email);
    if (alreadyExists) {
      return res.status(409).json({ error: 'Already subscribed' });
    }

    // 2. Send emails via Resend (if configured)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Welcome email to subscriber
      await resend.emails.send({
        from: 'Atlantic Walk Research <noreply@atlanticwalkresearch.com>',
        to: email,
        subject: 'Welcome to Atlantic Walk Research',
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:40px 20px;">
            <div style="background:white;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <div style="text-align:center;margin-bottom:32px;">
                <h1 style="margin:0;color:#1e40af;font-size:28px;font-weight:bold;">Welcome</h1>
              </div>

              <h2 style="color:#111827;font-size:18px;margin:0 0 16px 0;">You're now part of Atlantic Walk Research</h2>

              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
                Thank you for subscribing. You'll receive deep fundamental research and original valuation models delivered to your inbox before they're widely read.
              </p>

              <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;margin:24px 0;border-radius:4px;">
                <p style="color:#1e40af;font-weight:600;margin:0 0 8px 0;">What to expect:</p>
                <ul style="color:#374151;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
                  <li>Original DCF models and scenario frameworks</li>
                  <li>Deep-dives on mispriced small-caps & special situations</li>
                  <li>Early access to new reports and catalyst updates</li>
                </ul>
              </div>

              <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:24px 0 0 0;">
                We don't spam, and you can unsubscribe anytime. Questions? Reply to this email.
              </p>

              <div style="border-top:1px solid #e5e7eb;margin-top:32px;padding-top:20px;text-align:center;">
                <p style="color:#6b7280;font-size:12px;margin:0;">
                  Atlantic Walk Research · Independent Equity Research<br/>
                  <a href="https://atlanticwalkresearch.com" style="color:#2563eb;text-decoration:none;">atlanticwalkresearch.com</a>
                </p>
              </div>
            </div>
          </div>
        `,
      });

      // Notification email to Glenn
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
    }

    return res.status(201).json({ message: 'Successfully subscribed' });
  } catch (error) {
    console.error('[Subscribe] Error:', error);
    return res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
}
