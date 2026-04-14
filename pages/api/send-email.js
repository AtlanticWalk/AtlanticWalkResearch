import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { subject, body, token } = req.body;

    // Validate the token for security
    if (token !== process.env.SEND_EMAIL_SECRET) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }

    try {
        // Read the subscribers list
        const filePath = path.join(process.cwd(), 'data', 'subscribers.json');
        const subscribersData = fs.readFileSync(filePath, 'utf8');
        const subscribers = JSON.parse(subscribersData);

        if (!subscribers || subscribers.length === 0) {
            return res.status(400).json({ message: 'No subscribers found' });
        }

        // Log the email details for each subscriber
        // In production, integrate with SendGrid, Mailgun, or AWS SES
        const sentEmails = [];
        subscribers.forEach(email => {
            console.log(`[Newsletter] Sending to: ${email}`);
            console.log(`[Newsletter] Subject: ${subject}`);
            sentEmails.push(email);
        });

        return res.status(200).json({ message: 'Email sending initiated', recipientCount: subscribers.length, sentEmails: sentEmails });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Error processing request', error: error.message });
    }
}