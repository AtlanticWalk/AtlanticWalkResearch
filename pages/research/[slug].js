import fs from "fs";
import path from "path";
import Head from "next/head";

// Directory where PDFs live
const REPORTS_DIR = path.join(process.cwd(), "public", "reports");

// ✅ Build paths for all PDF files in /public/reports
export async function getStaticPaths() {
  const files = fs
    .readdirSync(REPORTS_DIR)
    .filter((file) => file.endsWith(".pdf"));

  const paths = files.map((filename) => ({
    params: { slug: filename.replace(/\.pdf$/, "") },
  }));

return { paths, fallback: "blocking" };
}

// ✅ Provide static props for each PDF
export async function getStaticProps({ params }) {
  const slug = params.slug;
  const filePath = path.join(REPORTS_DIR, `${slug}.pdf`);

  // If no matching PDF, 404
  if (!fs.existsSync(filePath)) {
    return { notFound: true };
  }

  return {
    props: {
      slug,
      pdfSrc: `/reports/${slug}.pdf`,
    },
  };
}

export default function ReportPage({ slug, pdfSrc }) {
  // Auto-format title from slug (e.g., avadel-addendum → Avadel Addendum)
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const pageUrl = `https://atlanticwalkresearch.com/research/${slug}`;

  // ✅ Custom handler: returns to integrated Research Library view
  const handleReturnToLibrary = (e) => {
    e.preventDefault();
    localStorage.setItem("atlanticwalk_page", "research");
    window.location.href = "/"; // reloads main SPA with navbar
  };

  return (
    <div className="min-h-screen flex justify-center items-start py-16 px-4">
      <div className="bg-white/70 text-black max-w-5xl w-full rounded-2xl shadow-2xl p-10">
        <Head>
          <title>{title} | Atlantic Walk Research</title>
          <meta
            name="description"
            content={`Independent equity research report: ${title} by Atlantic Walk Research.`}
          />
          <meta
            property="og:title"
            content={`${title} | Atlantic Walk Research`}
          />
          <meta
            property="og:description"
            content={`Full research report on ${title}.`}
          />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={pageUrl} />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>

        {/* ✅ Back button now reloads main SPA */}
        <a
          href="/"
          onClick={handleReturnToLibrary}
          className="text-sm text-black hover:underline cursor-pointer"
        >
          ← Back to Research Library
        </a>

        <h1 className="text-3xl font-bold mt-4 mb-6">{title}</h1>

        {/* ✅ Inline PDF viewer */}
        <div className="w-full h-[90vh] mb-8">
          <iframe
            src={pdfSrc}
            title={title}
            className="w-full h-full rounded-xl shadow-md border"
          />
        </div>

        {/* ✅ Footer buttons */}
        <div className="mt-10 border-t border-gray-300 pt-6 flex flex-wrap gap-4 items-center justify-between">
          <a
            href="/"
            onClick={handleReturnToLibrary}
            className="text-black hover:underline cursor-pointer"
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
              className="hover:underline text-black"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                pageUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-black"
            >
              Share on LinkedIn
            </a>
            <a
              href={pdfSrc}
              download
              className="hover:underline text-black"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
