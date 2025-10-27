import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Head from "next/head";
import Link from "next/link";

const REPORTS_DIR = path.join(process.cwd(), "content", "reports");

// ✅ Only include markdown files — prevents ab.jpg.md errors
export async function getStaticPaths() {
  const files = fs
    .readdirSync(REPORTS_DIR)
    .filter((file) => file.endsWith(".md"));

  const paths = files.map((filename) => {
    const raw = fs.readFileSync(path.join(REPORTS_DIR, filename), "utf-8");
    const { data } = matter(raw);
    const slug = data?.slug || filename.replace(/\.md$/, "");
    return { params: { slug } };
  });

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const filePath = path.join(REPORTS_DIR, `${params.slug}.md`);

  // ✅ Guard clause: if markdown file doesn't exist, skip
  if (!fs.existsSync(filePath)) {
    return { notFound: true };
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matter(raw);

  return { props: { frontmatter, content } };
}

export default function ReportPage({ frontmatter, content }) {
  const { title, date, description, image, ticker } = frontmatter;
  const pageUrl = `https://atlanticwalkresearch.com/research/${frontmatter.slug}`;

  // ✅ Custom handler: returns to integrated Research Library view
  const handleReturnToLibrary = (e) => {
    e.preventDefault();
    localStorage.setItem("atlanticwalk_page", "research");
    window.location.href = "/"; // reloads main SPA with navbar
  };

  return (
    <div className="min-h-screen flex justify-center items-start py-16 px-4">
      <div className="bg-gray-600/40 text-white max-w-3xl w-full rounded-2xl shadow-2xl p-10">
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

        {/* ✅ Back button now reloads main SPA */}
        <a
          href="/"
          onClick={handleReturnToLibrary}
          className="text-sm text-white hover:underline cursor-pointer"
        >
          ← Back to Research Library
        </a>

        <h1 className="text-3xl font-bold mt-4 mb-2">{title}</h1>
        <p className="text-sm text-white">
          {ticker ? `$${ticker}` : ""} • {new Date(date).toLocaleDateString()}
        </p>

        {image && (
          <div className="flex justify-center my-6">
            <img
              src={image}
              alt={title}
              className="rounded-lg shadow-md w-48 h-48 object-cover"
            />
          </div>
        )}

        <article className="prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>

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
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-white"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-white"
            >
              Share on LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
