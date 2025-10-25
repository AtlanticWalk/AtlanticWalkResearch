import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Head from "next/head";
import Link from "next/link";

const REPORTS_DIR = path.join(process.cwd(), "content", "reports");

export async function getStaticPaths() {
  const files = fs.readdirSync(REPORTS_DIR);
  const paths = files.map((filename) => {
    const raw = fs.readFileSync(path.join(REPORTS_DIR, filename), "utf-8");
    const { data } = matter(raw);
    const slug = data?.slug || filename.replace(/\.md$/, "");
    return { params: { slug } };
  });
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const files = fs.readdirSync(REPORTS_DIR);
  let fileMatch = null;

  for (const filename of files) {
    const raw = fs.readFileSync(path.join(REPORTS_DIR, filename), "utf-8");
    const parsed = matter(raw);
    const fmSlug = parsed.data?.slug || filename.replace(/\.md$/, "");
    if (fmSlug === params.slug) {
      fileMatch = { ...parsed, filename };
      break;
    }
  }

  if (!fileMatch) return { notFound: true };
  const { data: frontmatter, content, filename } = fileMatch;
  return { props: { frontmatter, content, slug: params.slug, filename } };
}

export default function ReportPage({ frontmatter, content, slug, filename }) {
  const { title, date, description, image, ticker } = frontmatter;
  const pageUrl = `https://atlanticwalkresearch.com/research/${slug}`;
  const downloadUrl = `/reports/${filename}`;

  return (
    <div
      className="min-h-screen flex justify-center items-start py-16 px-4 bg-cover bg-fixed"
      style={{
        backgroundImage: "url('/atlanticwalk_background.jpg')",
        backgroundPosition: "left 60% bottom 30%",
        backgroundSize: "cover",
      }}
    >
      <div className="backdrop-blur-md bg-white/40 text-black max-w-3xl w-full rounded-2xl shadow-2xl p-10">
        <Head>
          <title>{title} | Atlantic Walk Research</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={`${title} | Atlantic Walk Research`} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={pageUrl} />
          {image && <meta property="og:image" content={image} />}
          <meta name="twitter:card" content="summary_large_image" />
        </Head>

        <Link href="/research" className="text-sm text-blue-600 hover:underline">
          ← Back to Research Library
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-2">{title}</h1>
        <p className="text-sm text-gray-600">
          {ticker ? `$${ticker}` : ""} • {new Date(date).toLocaleDateString()}
        </p>

        {image && (
          <img
            src={image}
            alt={title}
            className="my-6 rounded-xl max-h-72 shadow-md w-full"
          />
        )}

        <div className="my-4 text-right">
          <a
            href={downloadUrl}
            download
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 text-sm font-medium shadow"
          >
            Download Report (.md)
          </a>
        </div>

        <article className="prose max-w-none text-black">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>

        <div className="mt-10 border-t border-gray-300 pt-6 flex flex-wrap gap-4 items-center justify-between">
          <Link href="/research" className="text-blue-600 hover:underline">
            ← Back to Library
          </Link>
          <div className="flex gap-4 text-sm">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                title
              )}&url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-blue-600"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                pageUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-blue-600"
            >
              Share on LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
