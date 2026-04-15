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

    // 2. Notify Glenn via Resend (if configured)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
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
