const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OWNER = 'AtlanticWalk';
const REPO  = 'AtlanticWalkResearch';
const FILE  = 'data/subscribers.json';

async function removeFromGitHub(email) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GitHub token not configured');

  const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  };

  const getRes = await fetch(apiUrl, { headers });
  if (!getRes.ok) throw new Error(`GitHub GET failed: ${getRes.status}`);
  const { content, sha } = await getRes.json();

  const current = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
  const normalised = email.toLowerCase().trim();
  const filtered = current.filter((s) => s.email.toLowerCase() !== normalised);

  // If nothing changed the email wasn't on the list — still return success
  // (avoids leaking whether an email is subscribed)
  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `newsletter: remove subscriber`,
      content: Buffer.from(JSON.stringify(filtered, null, 2)).toString('base64'),
      sha,
    }),
  });

  if (!putRes.ok) throw new Error(`GitHub PUT failed: ${putRes.status}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    await removeFromGitHub(email);
    return res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    console.error('[Unsubscribe]', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
