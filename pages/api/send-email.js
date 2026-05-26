import { Resend } from 'resend';

const OWNER = 'AtlanticWalk';
const REPO  = 'AtlanticWalkResearch';
const FILE  = 'data/subscribers.json';

async function getSubscribers() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not set');
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const { content } = await res.json();
  return JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
}

function buildEmailHtml({ subject, message, reportTitle, reportUrl, ticker }) {
  const reportBlock = reportTitle && reportUrl ? `
    <div style="background:#18181b;border:1px solid #3f3f46;border-radius:10px;padding:20px 24px;margin:24px 0;">
      ${ticker ? `<p style="color:#a1a1aa;font-size:12px;font-weight:600;letter-spacing:.08em;margin:0 0 6px 0;">${ticker.toUpperCase()}</p>` : ''}
      <p style="color:#f4f4f5;font-size:17px;font-weight:600;margin:0 0 12px 0;">${reportTitle}</p>
      <a href="${reportUrl}"
        style="display:inline-block;background:#3f3f46;color:#f4f4f5;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;">
        Read the report &rarr;
      </a>
    </div>` : '';

  return `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#09090b;padding:40px 20px;">
      <div style="background:#18181b;border:1px solid #27272a;border-radius:14px;padding:40px;">

        <p style="color:#a1a1aa;font-size:12px;font-weight:600;letter-spacing:.1em;margin:0 0 20px 0;text-transform:uppercase;">
          Atlantic Walk Research
        </p>

        <h1 style="color:#f4f4f5;font-size:22px;font-weight:700;margin:0 0 20px 0;line-height:1.3;">
          ${subject}
        </h1>

        ${message ? `<p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 8px 0;">${message.replace(/\n/g, '<br/>')}</p>` : ''}

        ${reportBlock}

        <div style="border-top:1px solid #27272a;margin-top:32px;padding-top:20px;">
          <p style="color:#52525b;font-size:12px;margin:0;">
            Atlantic Walk Research &middot; Independent Equity Research<br/>
            <a href="https://atlanticwalkresearch.com" style="color:#71717a;text-decoration:none;">atlanticwalkresearch.com</a>
            &nbsp;&middot;&nbsp;
            <a href="https://atlanticwalkresearch.com/unsubscribe" style="color:#71717a;text-decoration:none;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </div>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { subject, message, reportTitle, reportUrl, ticker, token } = req.body;

  if (!token || token !== process.env.SEND_EMAIL_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!subject) return res.status(400).json({ error: 'subject is required' });

  try {
    const subscribers = await getSubscribers();
    if (!subscribers.length) return res.status(200).json({ sent: 0, message: 'No subscribers' });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const html   = buildEmailHtml({ subject, message, reportTitle, reportUrl, ticker });
    const emails  = subscribers.map((s) => (typeof s === 'string' ? s : s.email)).filter(Boolean);

    // Send in batches of 50 to stay within Resend rate limits
    const BATCH = 50;
    let sent = 0;
    for (let i = 0; i < emails.length; i += BATCH) {
      const batch = emails.slice(i, i + BATCH);
      await Promise.all(batch.map((to) =>
        resend.emails.send({
          from: 'Atlantic Walk Research <noreply@atlanticwalkresearch.com>',
          to,
          subject,
          html,
        })
      ));
      sent += batch.length;
    }

    return res.status(200).json({ sent, total: emails.length });
  } catch (err) {
    console.error('[send-email]', err);
    return res.status(500).json({ error: err.message });
  }
}
