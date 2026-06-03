import fs from "fs";
import path from "path";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { macroMeta } from "../../data/macroMeta";

const MACRO_DIR = path.join(process.cwd(), "public", "macro");

export async function getStaticPaths() {
  const files = fs.existsSync(MACRO_DIR)
    ? fs.readdirSync(MACRO_DIR).filter((f) => f.endsWith(".pdf"))
    : [];
  return {
    paths: files.map((f) => ({ params: { slug: f.replace(/\.pdf$/, "") } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const slug = params.slug;
  const filePath = path.join(MACRO_DIR, `${slug}.pdf`);
  if (!fs.existsSync(filePath)) return { notFound: true };
  const meta = macroMeta.find((m) => m.slug === slug) || null;
  return { props: { slug, pdfSrc: `/macro/${slug}.pdf`, meta } };
}

export default function MacroReportPage({ slug, pdfSrc, meta }) {
  const title = useMemo(
    () => meta?.title || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    [slug, meta]
  );
  const description = useMemo(
    () => meta?.description || `Macro research report by Atlantic Walk Research.`,
    [meta]
  );
  const keywords = useMemo(
    () => meta?.keywords?.join(", ") || "macro research, Atlantic Walk Research",
    [meta]
  );
  const datePublished = meta?.date || null;
  const pageUrl = `https://atlanticwalkresearch.com/macro/${slug}`;

  const articleSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    keywords,
    author: {
      "@type": "Person",
      name: "Glenn Rentrop",
      url: "https://atlanticwalkresearch.com/about",
      sameAs: ["https://www.linkedin.com/in/grentrop/", "https://x.com/AtlanticWalk"],
    },
    publisher: {
      "@type": "Organization",
      name: "Atlantic Walk Research",
      url: "https://atlanticwalkresearch.com",
      logo: { "@type": "ImageObject", url: "https://atlanticwalkresearch.com/atlantic_walk_logo_transparent.png" },
    },
    url: pageUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    ...(datePublished && { datePublished }),
  }), [title, description, keywords, pageUrl, datePublished]);

  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.15);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    if (!pdfSrc || typeof window === "undefined") return;
    let cancelled = false;

    async function renderPdf() {
      setLoading(true); setErr(""); setNumPages(0);
      try {
        const pdfjsLib = await import("pdfjs-dist/build/pdf");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const pdf = await pdfjsLib.getDocument({ url: pdfSrc, withCredentials: false }).promise;
        if (cancelled) return;
        setNumPages(pdf.numPages);
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;
          const viewport = page.getViewport({ scale });
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:flex;justify-content:center;margin:0 0 24px 0;width:100%;";
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { alpha: false });
          const dpr = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.style.maxWidth = "100%";
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          wrap.appendChild(canvas);
          container.appendChild(wrap);
          await page.render({ canvasContext: ctx, viewport }).promise;
        }
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) { setErr(e?.message || "Could not load the PDF."); setLoading(false); }
      }
    }

    renderPdf();
    return () => { cancelled = true; };
  }, [pdfSrc, scale, renderKey]);

  return (
    <div className="min-h-screen">
      <Head>
        <title>{title} | Atlantic Walk Research</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="Glenn Rentrop" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`${title} | Atlantic Walk Research`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="Atlantic Walk Research" />
        <meta property="og:image" content="https://atlanticwalkresearch.com/atlantic_walk_logo_transparent.png" />
        {datePublished && <meta property="article:published_time" content={datePublished} />}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@AtlanticWalk" />
        <meta name="twitter:title" content={`${title} | Atlantic Walk Research`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://atlanticwalkresearch.com/atlantic_walk_logo_transparent.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      </Head>

      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-black/70 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/macro"
            className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
          >
            ← Macro Research
          </Link>
          <div className="flex items-center gap-2 text-gray-200">
            <button
              className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              onClick={() => { setScale((s) => Math.max(0.7, Math.round((s - 0.1) * 100) / 100)); setRenderKey((k) => k + 1); }}
              title="Zoom out"
            >−</button>
            <div className="px-3 py-2 rounded-lg border border-white/15 text-sm text-gray-200">
              Zoom: {Math.round(scale * 100)}%
            </div>
            <button
              className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              onClick={() => { setScale((s) => Math.min(2.2, Math.round((s + 0.1) * 100) / 100)); setRenderKey((k) => k + 1); }}
              title="Zoom in"
            >+</button>
            <a className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              href={pdfSrc} target="_blank" rel="noreferrer">Open PDF ↗</a>
            <a className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              href={pdfSrc} download>Download</a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-bold mb-3 text-white leading-tight">{title}</h1>
          <div className="flex flex-wrap items-center gap-3 mb-5 text-sm text-gray-400">
            <span className="border border-gray-700 rounded px-2 py-0.5 text-gray-300 font-medium">MACRO</span>
            {meta?.subtitle && (
              <span className="text-gray-400">{meta.subtitle}</span>
            )}
            {datePublished && (
              <span>Published {new Date(datePublished + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            )}
            <span className="text-gray-600">Atlantic Walk Research</span>
          </div>
          <p className="text-gray-300 text-base leading-relaxed mb-5">{description}</p>
          {meta?.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {meta.keywords.map((kw) => (
                <span key={kw} className="text-xs text-gray-500 bg-white/5 border border-gray-800 rounded-full px-3 py-1">{kw}</span>
              ))}
            </div>
          )}
        </div>

        {loading && <div className="text-white/80 text-sm mb-4">Loading PDF pages…</div>}
        {err && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 mb-6">
            <div className="font-semibold mb-1">PDF load error</div>
            <div className="opacity-90">{err}</div>
          </div>
        )}
        {!err && !loading && (
          <div className="text-white/70 text-sm mb-4">{numPages} page{numPages === 1 ? "" : "s"}</div>
        )}
        <div ref={containerRef} />
      </div>
    </div>
  );
}
