const fs = require('fs');
const nodemailer = require('nodemailer');

// Load subscribers from the JSON file
const subscribers = JSON.parse(fs.readFileSync('data/subscribers.json'));

// Configure the email service
const transporter = nodemailer.createTransport({
    service: 'YourEmailService', // e.g., 'gmail'
    auth: {
        user: 'your-email@example.com',
        pass: 'your-email-password'
    }
});

// Function to send newsletter
const sendNewsletter = async (subject, message) => {
    for (const subscriber of subscribers) {
        const mailOptions = {
            from: 'your-email@example.com',
            to: subscriber.email,
            subject: subject,
            text: message
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${subscriber.email}`);
        } catch (error) {
            console.error(`Failed to send email to ${subscriber.email}:`, error);
        }
    }
};

// Example usage
const subject = 'Your Newsletter Subject';
const message = 'Your newsletter message here.';
sendNewsletter(subject, message);