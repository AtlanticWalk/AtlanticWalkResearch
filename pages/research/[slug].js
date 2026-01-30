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

  // ✅ Always return to the real Research Library route
  const handleReturnToLibrary = (e) => {
    e.preventDefault();
    router.push("/research");
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

        // clear old renders
        container.innerHTML = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNum);
          if (cancelled) return;

          const viewport = page.getViewport({ scale });

          // Wrapper: center page but NO background/border/shadow
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

          // IMPORTANT: remove any rounding/border/shadow (true “float”)
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
    return () => {
      cancelled = true;
    };
  }, [pdfSrc, scale, renderKey]);

  return (
    // ✅ No bg-black / no forced text color. Let your global site background shine through.
    <div className="min-h-screen">
      <Head>
        <title>{title} | Atlantic Walk Research</title>
        <meta name="description" content={`Full research report on ${title}.`} />
        <meta property="og:title" content={`${title} | Atlantic Walk Research`} />
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

      {/* Toolbar */}
      <div className="sticky top-0 z-50 text-gray-200 bg-black/70 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              onClick={handleReturnToLibrary}
            >
              ← Back
            </button>
          </div>

          <div className="flex items-center gap-2 text-gray-200">
            <button
              className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              onClick={() => {
                setScale((s) => Math.max(0.7, Math.round((s - 0.1) * 100) / 100));
                setRenderKey((k) => k + 1);
              }}
              title="Zoom out"
            >
              −
            </button>

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
            >
              +
            </button>

            <a
              className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              href={pdfSrc}
              target="_blank"
              rel="noreferrer"
            >
              Open PDF ↗
            </a>

            <a
              className="px-3 py-2 rounded-lg border border-white/20 hover:border-white/35 hover:bg-white/5 text-sm text-gray-200"
              href={pdfSrc}
              download
            >
              Download
            </a>
          </div>
        </div>
      </div>

      {/* ✅ Content area: transparent */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-2 text-white">{title}</h1>

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
      </div>
    </div>
  );
}
