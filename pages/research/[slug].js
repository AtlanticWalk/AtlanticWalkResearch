// pages/research/[slug].js
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Head from "next/head";
import Layout from "../../components/Layout";

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
      fileMatch = parsed;
      break;
    }
  }

  if (!fileMatch) return { notFound: true };
  const { data: frontmatter, content } = fileMatch;
  return { props: { frontmatter, content, slug: params.slug } };
}

export default function ReportPage({ frontmatter, content, slug }) {
  const { title, date, description, image, ticker } = frontmatter;
  const pageUrl = `https://atlanticwalkresearch.com/research/${slug}`;

  return (
    <Layout>
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

      <div className="flex justify-center items-start py-16 px-4">
        <div className="bg-white/30 text-black max-w-3xl w-full rounded-2xl shadow-xl p-10 backdrop-blur-0">
          {image && (
            <img
              src={image}
              alt={title}
              className="mx-auto mb-6 rounded-xl shadow-md w-[180px] h-[180px] object-cover"
            />
          )}

          <h1 className="text-3xl font-bold mb-2 text-center">{title}</h1>
          <p className="text-sm text-gray-700 text-center mb-6">
            {ticker ? `$${ticker}` : ""} • {new Date(date).toLocaleDateString()}
          </p>

          <article className="prose max-w-none text-black">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </article>

          <div className="mt-10 border-t border-gray-400 pt-6 flex flex-wrap gap-4 items-center justify-between">
            <a href="/research" className="text-black hover:underline">
              ← Back to Library
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
                href={`https://stocktwits.com/?q=${encodeURIComponent(
                  `$${ticker || ""} ${pageUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-black"
              >
                Share on Stocktwits
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
