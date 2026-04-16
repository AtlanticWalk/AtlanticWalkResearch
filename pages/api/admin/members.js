import Redis from 'ioredis';

let client;
function getClient() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
      maxRetriesPerRequest: 3,
    });
  }
  return client;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.query;
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const r = getClient();
    const keys = await r.keys('user:*');

    if (keys.length === 0) return res.status(200).json([]);

    const values = await r.mget(...keys);
    const members = values
      .map((v) => {
        if (!v) return null;
        const u = JSON.parse(v);
        // Never expose passwordHash
        const { passwordHash, ...safe } = u;
        return safe;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json(members);
  } catch (err) {
    console.error('[Admin] Error fetching members:', err);
    return res.status(500).json({ error: 'Failed to fetch members' });
  }
}
