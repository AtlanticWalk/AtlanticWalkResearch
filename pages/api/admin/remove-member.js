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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const { password, email } = req.body;

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const r = getClient();
  const deleted = await r.del(`user:${email.toLowerCase()}`);

  if (deleted === 0) {
    return res.status(404).json({ error: 'Member not found' });
  }

  console.log(`[admin] Removed member: ${email}`);
  return res.status(200).json({ message: 'Member removed' });
}
