import fs from "fs";
import path from "path";
import Link from "next/link";
import { reportsMeta } from "../../data/reportsMeta";

export async function getStaticProps() {
  // ✅ Look for PDFs in /public/reports
  const reportsDir = path.join(process.cwd(), "public", "reports");
  const files = fs.existsSync(reportsDir) ? fs.readdirSync(reportsDir) : [];

  // ✅ Build report list with metadata
const reports = files
  .filter((f) => f.endsWith(".pdf"))
  .map((filename) => {
    const slug = filename.replace(/\.pdf$/, "");
    const meta = reportsMeta.find((m) => m.slug === slug); // 👈 match here
    return {
      slug,
      title:
        meta?.title ||
        slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      ticker: meta?.ticker || "",
      date: meta?.date || null,
    };
  });


  reports.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
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
      <div className="bg-white/40 backdrop-blur-md rounded-2xl max-w-5xl mx-auto p-10 shadow-xl text-black">
        <h1 className="text-3xl font-bold mb-8 text-center">Research Library</h1>

        <div className="grid grid-cols-[3fr_0.8fr_1fr_1fr] font-semibold border-b border-gray-300 pb-2 mb-4">
          <div>Title</div>
          <div>Ticker</div>
          <div>Date</div>
          <div>Link</div>
        </div>

        <div className="space-y-2 text-sm">
          {reports.length > 0 ? (
            reports.map((r) => (
              <div
                key={r.slug}
                className="grid grid-cols-[3fr_0.8fr_1fr_1fr] items-center border-b border-gray-200 py-2"
              >
                <div className="font-medium">{r.title}</div>
                <div>{r.ticker}</div>
                <div>{r.date ? new Date(r.date).toLocaleDateString() : "—"}</div>
                <div>
                  <Link
                    href={`/research/${r.slug}`}
                    className="text-blue-700 hover:underline"
                  >
                    View Online
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No research reports found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
