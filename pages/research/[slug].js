// pages/research/[slug].js
import fs from "fs";
import path from "path";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

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

  return {
    props: {
      slug,
      pdfSrc: `/reports/${slug}.pdf`,
    },
  };
}

export default function ReportPage({ slug, pdfSrc }) {
  const router = useRouter();

  const title = useMemo(
    () => slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    [slug]
  );

  // If your route isn't /research/[slug], update this path to match.
  const pageUrl = `https://atlanticwalkresearch.com/research/${slug}`;

  const articleSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      author: { "@type": "Person", name: "Glenn Rentrop" },
      publisher: {
        "@type": "Organization",
        name: "Atlantic Walk Research",
        logo: {
          "@type": "ImageObject",
          url: "https://atlanticwalkresearch.com/atlantic_walk_logo_transparent.png",
        },
      },
      url: pageUrl,
      mainEntityOfPage: pageUrl,
    }),
    [title, pageUrl]
  );

  const handleReturnToLibrary = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("atlanticwalk_page", "research");
      window.location.href = "/";
    }
  };

  // ---- PDF.js canvas renderer ----
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
        // ✅ only loaded client-side
        const pdfjsLib = await import("pdfjs-dist/build/pdf");

        // ✅ served from /public/pdf.worker.min.js (copied by your postinstall script)
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

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
          wrap.style.margin = "0 0 20px 0";
          wrap.style.width = "100%";

          const card = document.createElement("div");
          card.style.background = "rgba(255,255,255,0.02)";
          card.style.border = "1px solid rgba(255,255,255,0.10)";
          card.style.borderRadius = "16px";
          card.style.boxShadow = "0 10px 30px rgba(0,0,0,0.40)";
          card.style.padding = "12px";
          card.style.maxWidth = "1100px";
          card.style.width = "100%";

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { alpha: false });

          const dpr = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          canvas.style.borderRadius = "12px";
          canvas.style.display = "block";

          context.setTransform(dpr, 0, 0, dpr, 0, 0);

          card.appendChild(canvas);
          wrap.appendChild(card);
          container.appendChild(wrap);

          await page.render({ canvasContext: context, viewport }).promise;
        }

        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setErr(
            e?.message ||
              "Could not load the PDF. Check the file path and pdf.js worker."
          );
          setLoading(false);
        }
      }
    }

    renderPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfSrc, scale, renderKey]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>{title} | Atlantic Walk Research</title>
        <meta name="description" content={`Full research report on ${title}.`} />
        <meta
          property="og:title"
          content={`${title} | Atlantic Walk Research`}
        />
        <meta
          property="og:description"
          content={`Independent equity research report on ${title}.`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      </Head>

      {/* Sticky toolbar */}
      <div className="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-black/60">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-2 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/5 text-sm"
              onClick={() => router.back()}
            >
              ← Back
            </button>

            <a
              href="/"
              onClick={handleReturnToLibrary}
              className="text-sm text-white/70 hover:text-white hover:underline"
            >
              Back to Research Library
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/5 text-sm"
              onClick={() => {
                setScale((s) => Math.max(0.7, Math.round((s - 0.1) * 100) / 100));
                setRenderKey((k) => k + 1);
              }}
              title="Zoom out"
            >
              −
            </button>

            <div className="px-3 py-2 rounded-lg border border-white/10 text-sm text-white/70">
              Zoom: {Math.round(scale * 100)}%
            </div>

            <button
              className="px-3 py-2 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/5 text-sm"
              onClick={() => {
                setScale((s) => Math.min(2.2, Math.round((s + 0.1) * 100) / 100));
                setRenderKey((k) => k + 1);
              }}
              title="Zoom in"
            >
              +
            </button>

            <a
              className="px-3 py-2 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/5 text-sm"
              href={pdfSrc}
              target="_blank"
              rel="noreferrer"
            >
              Open PDF ↗
            </a>

            <a
              className="px-3 py-2 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/5 text-sm"
              href={pdfSrc}
              download
            >
              Download
            </a>
          </div>
        </div>
      </div>

      {/* Page */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>

        {loading && (
          <div className="text-white/70 text-sm mb-4">Loading PDF pages…</div>
        )}

        {err && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 mb-6">
            <div className="font-semibold mb-1">PDF load error</div>
            <div className="opacity-90">{err}</div>
            <div className="mt-3 text-white/70">
              Quick checks:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>
                  Confirm the PDF exists at{" "}
                  <code>/public/reports/{slug}.pdf</code>
                </li>
                <li>
                  Confirm you added <code>/public/pdf.worker.min.js</code>
                </li>
                <li>
                  Confirm <code>pdfjs-dist</code> is installed
                </li>
              </ul>
            </div>
          </div>
        )}

        {!err && !loading && (
          <div className="text-white/60 text-sm mb-4">
            {numPages} page{numPages === 1 ? "" : "s"}
          </div>
        )}

        <div ref={containerRef} />

        {/* Footer share */}
        <div className="mt-10 border-t border-white/10 pt-6 flex flex-wrap gap-4 items-center justify-between">
          <a
            href="/"
            onClick={handleReturnToLibrary}
            className="text-white/80 hover:text-white hover:underline"
          >
            ← Back to Research Library
          </a>

          <div className="flex gap-4 text-sm">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                title
              )}&url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-white/80 hover:text-white"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                pageUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-white/80 hover:text-white"
            >
              Share on LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
