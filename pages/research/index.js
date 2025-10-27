import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

const REPORTS_DIR = path.join(process.cwd(), "content", "reports");

export async function getStaticProps() {
  // ✅ Point to the public/reports folder
  const reportsDir = path.join(process.cwd(), "public", "reports");
  const files = fs.existsSync(reportsDir) ? fs.readdirSync(reportsDir) : [];

  // ✅ Build report list from PDFs
  const reports = files
    .filter((f) => f.endsWith(".pdf"))
    .map((filename) => {
      const slug = filename.replace(/\.pdf$/, "");
      const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        slug,
        title,
        ticker: "",
        date: null,
      };
    });

  reports.sort((a, b) => a.title.localeCompare(b.title));
  return { props: { reports } };
}

export default function ResearchLibrary({ reports }) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed p-12"
      style={{
        backgroundImage: "url('/atlanticwalk_background.jpg')",
        backgroundPosition: "center 40%",
        backgroundSize: "cover",
      }}
    >
      <div className="bg-white/40 backdrop-blur-md rounded-2xl max-w-4xl mx-auto p-10 shadow-xl text-black">
        <h1 className="text-3xl font-bold mb-8 text-center">Research Library</h1>
        <ul className="space-y-6">
          {reports.map((r) => (
            <li key={r.slug} className="border-b border-gray-300 pb-4">
              <Link
                href={`/research/${r.slug}`}
                className="text-xl font-semibold text-blue-700 hover:underline"
              >
                {r.title}
              </Link>
              <p className="text-sm text-gray-600">
                {new Date(r.date).toLocaleDateString()}
              </p>
              <p className="mt-1 text-gray-800">{r.description}</p>
              <a
                href={`/reports/${r.slug}.md`}
                download
                className="text-blue-600 text-sm hover:underline"
              >
                Download Report
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

