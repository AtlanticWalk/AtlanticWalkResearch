// pages/sitemap.xml.js
import fs from "fs";
import path from "path";

const SITE_URL = "https://atlanticwalkresearch.com";

// Helper: escape XML special chars
function xmlEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default function Sitemap() {
  // Next.js requires a default export, but we never render a React page here.
  return null;
}

export async function getServerSideProps({ res }) {
  const now = new Date().toISOString().slice(0, 10);

  // Core site URLs you want indexed
  const staticUrls = [
    { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${SITE_URL}/research`, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE_URL}/performance`, changefreq: "weekly", priority: "0.8" },
    { loc: `${SITE_URL}/about`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_URL}/contact`, changefreq: "monthly", priority: "0.5" },
  ];

  // Read PDFs from /public/reports and map to /research/<slug>
  const reportsDir = path.join(process.cwd(), "public", "reports");
  let reportUrls = [];

  try {
    const files = fs.existsSync(reportsDir) ? fs.readdirSync(reportsDir) : [];
    const pdfs = files.filter((f) => f.toLowerCase().endsWith(".pdf"));

    reportUrls = pdfs.map((filename) => {
      const slug = filename.replace(/\.pdf$/i, "");
      return {
        loc: `${SITE_URL}/research/${encodeURIComponent(slug)}`,
        changefreq: "yearly",
        priority: "0.8",
      };
    });
  } catch (e) {
    // If folder read fails, just fall back to static URLs
    reportUrls = [];
  }

  const all = [...staticUrls, ...reportUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "text/xml");
  // Prevent stale sitemaps (especially behind Cloudflare)
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(xml);
  res.end();

  return { props: {} };
}
