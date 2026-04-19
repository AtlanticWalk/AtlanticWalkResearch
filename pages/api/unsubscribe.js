const OWNER = 'AtlanticWalk';
const REPO  = 'AtlanticWalkResearch';
const FILE  = 'data/subscribers.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    // Silently succeed if token is missing
    return res.status(200).json({ message: 'Unsubscribed' });
  }

  try {
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    };

    const getRes = await fetch(apiUrl, { headers });
    if (!getRes.ok) return res.status(200).json({ message: 'Unsubscribed' });

    const fileData = await getRes.json();
    const subscribers = JSON.parse(
      Buffer.from(fileData.content, 'base64').toString('utf8')
    );

    const normalised = email.toLowerCase().trim();
    const updated = subscribers.filter(
      (e) => e.toLowerCase().trim() !== normalised
    );

    // Always return 200 — no enumeration
    if (updated.length < subscribers.length) {
      const updatedContent = Buffer.from(
        JSON.stringify(updated, null, 2)
      ).toString('base64');

      await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `Remove subscriber: ${normalised}`,
          content: updatedContent,
          sha: fileData.sha,
        }),
      });
    }

    return res.status(200).json({ message: 'Unsubscribed' });
  } catch {
    return res.status(200).json({ message: 'Unsubscribed' });
  }
}
