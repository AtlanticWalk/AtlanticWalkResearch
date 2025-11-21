import fs from "fs";
import path from "path";
import Head from "next/head";

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
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const pageUrl = `https://atlanticwalkresearch.com/research/${slug}`;

  // ✅ JSON-LD article schema (this is the "json data")
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "author": {
      "@type": "Person",
      "name": "Glenn Rentrop",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Atlantic Walk Research",
      "logo": {
        "@type": "ImageObject",
        "url": "https://atlanticwalkresearch.com/atlantic_walk_logo_transparent.png",
      },
    },
    "url": pageUrl,
    "mainEntityOfPage": pageUrl,
  };

  const handleReturnToLibrary = (e) => {
    e.preventDefault();
    localStorage.setItem("atlanticwalk_page", "research");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex justify-center items-start py-16 px-4">
      <div className="bg-grey-600/20 text-black max-w-5xl w-full rounded-2xl shadow-2xl p-10">
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

          {/* ✅ JSON-LD goes here inside <Head> as a script tag */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(articleSchema),
            }}
          />
        </Head>

        <a
          href="/"
          onClick={handleReturnToLibrary}
          className="text-sm text-white hover:underline cursor-pointer"
        >
          ← Back to Research Library
        </a>

        <h1 className="text-3xl font-bold mt-4 mb-6">{title}</h1>

        <div className="w-full h-[90vh] mb-8">
          <iframe
            src={pdfSrc}
            title={title}
            className="w-full h-full rounded-xl shadow-md border"
          />
        </div>

        <div className="mt-10 border-t border-gray-300 pt-6 flex flex-wrap gap-4 items-center justify-between">
          <a
            href="/"
            onClick={handleReturnToLibrary}
            className="text-white hover:underline cursor-pointer"
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
              className="hover:underline text-white"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                pageUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-white"
            >
              Share on LinkedIn
            </a>
            <a href={pdfSrc} download className="hover:underline text-white">
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
