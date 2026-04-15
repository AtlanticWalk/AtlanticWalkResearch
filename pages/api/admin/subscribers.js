const OWNER = 'AtlanticWalk';
const REPO  = 'AtlanticWalkResearch';
const FILE  = 'data/subscribers.json';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Password check
  const { password } = req.query;
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }

  try {
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
    const getRes = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!getRes.ok) throw new Error(`GitHub GET failed: ${getRes.status}`);

    const { content } = await getRes.json();
    const subscribers = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));

    return res.status(200).json(subscribers);
  } catch (error) {
    console.error('[Admin] Error fetching subscribers:', error);
    return res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
}
