import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const filePath = path.join(process.cwd(), 'data', 'subscribers.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const subscribers = JSON.parse(fileContents);

    const updatedSubscribers = subscribers.filter(subscriber => subscriber !== email);
    fs.writeFileSync(filePath, JSON.stringify(updatedSubscribers, null, 2));

    return res.status(200).json({ message: 'Email removed successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
