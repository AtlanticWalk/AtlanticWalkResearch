// pages/sitemap.xml.js
import fs from "fs";
import path from "path";
import { reportsMeta } from "../data/reportsMeta";
import { macroMeta } from "../data/macroMeta";

const SITE_URL = "https://atlanticwalkresearch.com";

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default function Sitemap() {
  return null;
}

export async function getServerSideProps({ res }) {
  const today = new Date().toISOString().slice(0, 10);

  // Core public pages
  const staticUrls = [
    { loc: `${SITE_URL}/`,               lastmod: today,       changefreq: "weekly",  priority: "1.0" },
    { loc: `${SITE_URL}/highlights`,     lastmod: today,       changefreq: "weekly",  priority: "0.8" },
    { loc: `${SITE_URL}/research-packs`, lastmod: today,       changefreq: "weekly",  priority: "0.9" },
    { loc: `${SITE_URL}/macro`,          lastmod: today,       changefreq: "weekly",  priority: "0.9" },
    { loc: `${SITE_URL}/performance`,    lastmod: today,       changefreq: "weekly",  priority: "0.8" },
    { loc: `${SITE_URL}/about`,          lastmod: today,       changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_URL}/contact`,        lastmod: today,       changefreq: "monthly", priority: "0.5" },
  ];

  // Individual equity research report pages
  const reportsDir = path.join(process.cwd(), "public", "reports");
  const pdfFiles = new Set(
    fs.existsSync(reportsDir)
      ? fs.readdirSync(reportsDir).filter((f) => f.endsWith(".pdf")).map((f) => f.replace(".pdf", ""))
      : []
  );

  const reportUrls = reportsMeta
    .filter((r) => pdfFiles.has(r.slug))
    .map((r) => ({
      loc: `${SITE_URL}/research/${encodeURIComponent(r.slug)}`,
      lastmod: r.date || today,
      changefreq: "yearly",
      priority: "0.8",
    }));

  // Individual macro report pages
  const macroDir = path.join(process.cwd(), "public", "macro");
  const macroPdfFiles = new Set(
    fs.existsSync(macroDir)
      ? fs.readdirSync(macroDir).filter((f) => f.endsWith(".pdf")).map((f) => f.replace(".pdf", ""))
      : []
  );

  const macroUrls = macroMeta
    .filter((r) => macroPdfFiles.has(r.slug))
    .map((r) => ({
      loc: `${SITE_URL}/macro/${encodeURIComponent(r.slug)}`,
      lastmod: r.date || today,
      changefreq: "yearly",
      priority: "0.8",
    }));

  const all = [...staticUrls, ...reportUrls, ...macroUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(xml);
  res.end();

  return { props: {} };
}
