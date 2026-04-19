import fs from "fs";
import path from "path";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { reportsMeta } from "../../data/reportsMeta";

const REPORTS_DIR = path.join(process.cwd(), "public", "reports");

export async function getStaticPaths() {
  const files = fs
    .readdirSync(REPORTS_DIR)
    .filter((file) => file.endsWith(".pdf"));

  const paths = files.map((filename) => ({
    params: { slug: filename.replace(/\.pdf$/, "") },
  }));

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const slug = params.slug;
  const filePath = path.join(REPORTS_DIR, `${slug}.pdf`);
  if (!fs.existsSync(filePath)) return { notFound: true };

  const meta = reportsMeta.find((m) => m.slug === slug) || null;

  // Related reports: same ticker, different slug, sorted newest-first
  const tickerRaw = meta?.ticker || null;
  const related = tickerRaw
    ? reportsMeta
        .filter((m) => m.ticker === tickerRaw && m.slug !== slug)
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    : [];

  return {
    props: {
      slug,
      pdfSrc: `/reports/${slug}.pdf`,
      meta,
      related,
    },
  };
}

export default function ReportPage({ slug, pdfSrc, meta, related }) {
  const router = useRouter();

  const title = useMemo(
    () => meta?.title || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    [slug, meta]
  );

  const description = useMemo(
    () => meta?.description || `Independent equity research report on ${title} by Atlantic Walk Research.`,
    [title, meta]
  );

  const keywords = useMemo(
    () => meta?.keywords?.join(", ") || "equity research, financial analysis, Atlantic Walk Research",
    [meta]
  );

  const datePublished = meta?.date || null;
  const ticker = meta?.ticker || null;
  const pageUrl = `https://atlanticwalkresearch.com/research/${slug}`;

  const articleSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: description,
      keywords: keywords,
      author: {
        "@type": "Person",
        name: "Glenn Rentrop",
        url: "https://atlanticwalkresearch.com/about",
        sameAs: [
          "https://www.linkedin.com/in/grentrop/",
          "https://x.com/AtlanticWalk",
        ],
      },
      publisher: {
        "@type": "Organization",
        name: "Atlantic Walk Research",
        url: "https://atlanticwalkresearch.com",
        logo: {
          "@type": "ImageObject",
          url: "https://atlanticwalkresearch.com/atlantic_walk_logo_transparent.png",
        },
      },
      url: pageUrl,
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      ...(datePublished && { datePublished }),
      ...(ticker && { about: { "@type": "Thing", name: ticker } }),
    }),
    [title, description, keywords, pageUrl, datePublished, ticker]
  );

  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.15);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    if (!pdfSrc) return;
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function renderPdf() {
      setLoading(true);
      setErr("");
      setNumPages(0);

      try {
        const pdfjsLib = await import("pdfjs-dist/build/pdf");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjsLib.getDocument({
          url: pdfSrc,
          withCredentials: false,
        });
        const pdf = await loadingTask.promise;
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
          wrap.style.display = "flex";
          wrap.style.justifyContent = "center";
          wrap.style.margin = "0 0 24px 0";
          wrap.style.width = "100%";

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { alpha: false });

          const dpr = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          canvas.style.display = "block";
          canvas.style.maxWidth = "100%";
          canvas.style.height = "auto";
          canvas.style.borderRadius = "0";
          canvas.style.boxShadow = "none";
          canvas.style.border = "none";

          context.setTransform(dpr, 0, 0, dpr, 0, 0);

          wrap.appendChild(canvas);
          container.appendChild(wrap);

          await page.render({ canvasContext: context, viewport }).promise;
        }

        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setErr(e?.message || "Could not load the PDF.");
          setLoading(false);
        }
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

        {/* Open Graph */}
        <meta property="og:title" content={`${title} | Atlantic Walk Research`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="Atlantic Walk Research" />
        <meta property="og:image" content="https://atlanticwalkresearch.com/atlantic_walk_logo_transparent.png" />
        {datePublished && <meta property="article:published_time" content={datePublished} />}

        {/* Twitter / X Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@AtlanticWalk" />
        <meta name="twitter:creator" content="@AtlanticWalk" />
        <meta name="twitter:title" content={`${title} | Atlantic Walk Research`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://atlanticwalkresearch.com/atlantic_walk_logo_transparent.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      </Head>

      {/* Toolbar */}
      <div className="sticky top-0 z-50 text-gray-200 bg-black/70 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/research-packs"
              className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
            >
              ← Research Packs
            </Link>
          </div>

          <div className="flex items-center gap-2 text-gray-200">
            <button
              className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              onClick={() => {
                setScale((s) => Math.max(0.7, Math.round((s - 0.1) * 100) / 100));
                setRenderKey((k) => k + 1);
              }}
              title="Zoom out"
            >−</button>

            <div className="px-3 py-2 rounded-lg border border-white/15 text-sm text-gray-200">
              Zoom: {Math.round(scale * 100)}%
            </div>

            <button
              className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              onClick={() => {
                setScale((s) => Math.min(2.2, Math.round((s + 0.1) * 100) / 100));
                setRenderKey((k) => k + 1);
              }}
              title="Zoom in"
            >+</button>

            <a
              className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              href={pdfSrc}
              target="_blank"
              rel="noreferrer"
            >Open PDF ↗</a>

            <a
              className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              href={pdfSrc}
              download
            >Download</a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Report header — fully crawlable text for Google */}
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-bold mb-3 text-white leading-tight">{title}</h1>

          <div className="flex flex-wrap items-center gap-3 mb-5 text-sm text-gray-400">
            {ticker && (
              <span className="border border-gray-700 rounded px-2 py-0.5 text-gray-300 font-medium">
                {ticker}
              </span>
            )}
            {datePublished && (
              <span>
                Published{" "}
                {new Date(datePublished + "T00:00:00").toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            )}
            <span className="text-gray-600">Atlantic Walk Research</span>
          </div>

          {/* Visible description — critical for Google to understand page content */}
          <p className="text-gray-300 text-base leading-relaxed mb-5">{description}</p>

          {/* Keyword tags */}
          {meta?.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {meta.keywords.map((kw) => (
                <span
                  key={kw}
                  className="text-xs text-gray-500 bg-white/5 border border-gray-800 rounded-full px-3 py-1"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* PDF viewer */}
        {loading && (
          <div className="text-white/80 text-sm mb-4">Loading PDF pages…</div>
        )}
        {err && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 mb-6">
            <div className="font-semibold mb-1">PDF load error</div>
            <div className="opacity-90">{err}</div>
          </div>
        )}
        {!err && !loading && (
          <div className="text-white/70 text-sm mb-4">
            {numPages} page{numPages === 1 ? "" : "s"}
          </div>
        )}

        <div ref={containerRef} />

        {/* Related reports — internal links boost SEO and keep readers on site */}
        {related.length > 0 && (
          <div className="mt-16 border-t border-gray-800 pt-8 max-w-3xl">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              More on {ticker}
            </h2>
            <div className="space-y-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/research/${r.slug}`}
                  className="flex items-start justify-between gap-4 group p-4 rounded-xl border border-gray-800 bg-neutral-900/50 hover:bg-white/5 transition"
                >
                  <div>
                    <p className="text-gray-200 text-sm font-medium group-hover:text-white transition leading-snug">
                      {r.title}
                    </p>
                    {r.date && (
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(r.date + "T00:00:00").toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-blue-400 text-sm mt-0.5 group-hover:text-blue-300 transition">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
