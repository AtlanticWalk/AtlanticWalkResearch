import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { subject, body, token } = req.body;

    // Validate the token (this is just a placeholder, implement your own validation)
    if (token !== 'YOUR_SECRET_TOKEN') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    // Setup Nodemailer transport
    const transport = nodemailer.createTransport({
        service: 'YourEmailService',
        auth: {
            user: 'your-email@example.com',
            pass: 'your-email-password',
        },
    });

    // Logic to send email to all subscribers
    const subscribers = []; // Replace with your subscriber list
    const sentEmails = [];

    for (const subscriber of subscribers) {
        const mailOptions = {
            from: 'your-email@example.com',
            to: subscriber,
            subject: subject,
            text: body,
        };
        try {
            await transport.sendMail(mailOptions);
            sentEmails.push(subscriber);
        } catch (error) {
            return res.status(500).json({ message: 'Error sending email', error });
        }
    }

    return res.status(200).json({ message: 'Emails sent successfully', sentEmails });
}