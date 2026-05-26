import { Resend } from 'resend';

const OWNER = 'AtlanticWalk';
const REPO  = 'AtlanticWalkResearch';
const FILE  = 'data/subscribers.json';

const BASE_URL = 'https://atlanticwalkresearch.com';
const BANNER_URL = `${BASE_URL}/background.jpg`;
const LOGO_URL   = `${BASE_URL}/atlantic_walk_logo_transparent.png`;

async function getSubscribers() {
  const ghToken = process.env.GITHUB_TOKEN;
  if (!ghToken) throw new Error('GITHUB_TOKEN not set');
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
    { headers: { Authorization: `Bearer ${ghToken}`, Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const { content } = await res.json();
  return JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
}

function buildEmailHtml({ subject, message, reportTitle, reportUrl, ticker }) {
  const reportCard = reportTitle && reportUrl ? `
    <tr>
      <td style="padding: 0 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#18181b;border:1px solid #3f3f46;border-radius:10px;">
          <tr>
            <td style="padding:20px 24px;">
              ${ticker ? `<p style="color:#71717a;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 6px 0;font-family:'Segoe UI',Arial,sans-serif;">${ticker}</p>` : ''}
              <p style="color:#f4f4f5;font-size:16px;font-weight:600;margin:0 0 16px 0;line-height:1.4;font-family:'Segoe UI',Arial,sans-serif;">${reportTitle}</p>
              <a href="${reportUrl}" style="display:inline-block;background:#27272a;color:#e4e4e7;text-decoration:none;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;border:1px solid #3f3f46;font-family:'Segoe UI',Arial,sans-serif;">
                Read the report &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : '';

  const messageRow = message ? `
    <tr>
      <td style="padding: 0 40px ${reportCard ? '8' : '28'}px;">
        <p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0;font-family:'Segoe UI',Arial,sans-serif;">${message.replace(/\n/g, '<br/>')}</p>
      </td>
    </tr>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#09090b;">
<center>
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#09090b">
  <tr>
    <td align="center" style="padding:32px 16px;">

      <!-- Outer card -->
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#09090b;border:1px solid #27272a;border-radius:12px;overflow:hidden;">

        <!-- ── BANNER ── -->
        <tr>
          <td height="200" valign="middle" align="center"
              bgcolor="#1c1008"
              background="${BANNER_URL}"
              style="background-image:url('${BANNER_URL}');background-size:cover;background-position:center 40%;height:200px;">
            <!--[if gte mso 9]>
            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:200px;">
              <v:fill type="frame" src="${BANNER_URL}" color="#1c1008"/>
              <v:textbox inset="0,0,0,0">
              <table width="600" cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle" height="200">
            <![endif]-->
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding:0;">
                  <img src="${LOGO_URL}" width="68" height="68" alt="AWR Logo"
                    style="display:block;width:68px;height:68px;object-fit:contain;"/>
                  <p style="margin:10px 0 0 0;color:#f4f4f5;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;font-family:'Segoe UI',Arial,sans-serif;text-shadow:0 1px 4px rgba(0,0,0,0.8);">
                    Atlantic Walk Research
                  </p>
                </td>
              </tr>
            </table>
            <!--[if gte mso 9]>
              </td></tr></table>
              </v:textbox>
            </v:rect>
            <![endif]-->
          </td>
        </tr>

        <!-- ── BODY ── -->
        <tr>
          <td style="padding:36px 40px 0;">
            <h1 style="color:#f4f4f5;font-size:22px;font-weight:700;margin:0 0 12px 0;line-height:1.3;font-family:'Segoe UI',Arial,sans-serif;">
              ${subject}
            </h1>
          </td>
        </tr>

        ${messageRow}
        ${reportCard}

        <!-- ── DIVIDER ── -->
        <tr>
          <td style="padding: 0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="border-top:1px solid #27272a;height:1px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <p style="color:#52525b;font-size:12px;margin:0;line-height:1.8;font-family:'Segoe UI',Arial,sans-serif;">
              Atlantic Walk Research &middot; Independent Equity Research<br/>
              <a href="${BASE_URL}" style="color:#3f3f46;text-decoration:none;">atlanticwalkresearch.com</a>
              &nbsp;&middot;&nbsp;
              <a href="${BASE_URL}/unsubscribe" style="color:#3f3f46;text-decoration:underline;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</center>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { subject, message, reportTitle, reportUrl, ticker, token } = req.body;

  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!subject) return res.status(400).json({ error: 'subject is required' });

  try {
    const subscribers = await getSubscribers();
    if (!subscribers.length) return res.status(200).json({ sent: 0, total: 0, message: 'No subscribers' });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const html   = buildEmailHtml({ subject, message, reportTitle, reportUrl, ticker });
    const emails = subscribers.map((s) => (typeof s === 'string' ? s : s.email)).filter(Boolean);

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
