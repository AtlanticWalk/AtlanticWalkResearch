import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Read the existing subscribers list
    const filePath = path.join(process.cwd(), 'data', 'subscribers.json');
    const fileContent = fs.readFileSync(filePath);
    const subscribers = JSON.parse(fileContent);

    // Add the new email if it doesn't already exist
    if (subscribers.includes(email)) {
      return res.status(409).json({ error: 'Email already subscribed' });
    }
    subscribers.push(email);

    // Write the updated subscribers list back to the file
    fs.writeFileSync(filePath, JSON.stringify(subscribers, null, 2));

    return res.status(201).json({ message: 'Successfully subscribed' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}