import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { password, to } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).end();

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: 'Atlantic Walk Research <noreply@atlanticwalkresearch.com>',
    to,
    subject: 'Test email from AWR',
    html: '<p>This is a test.</p>',
  });

  return res.status(200).json({ data, error, keyPrefix: process.env.RESEND_API_KEY?.slice(0, 12) });
}
