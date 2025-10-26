import { useState, useEffect } from "react";
import Head from "next/head";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link"; // ✅ Added for consistent navigation
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function AtlanticWalkResearch({ reports = [] }) {
  const [page, setPage] = useState("home");
  const [trackerData, setTrackerData] = useState([]);

  useEffect(() => {
    const savedPage = localStorage.getItem("atlanticwalk_page");
    if (savedPage) setPage(savedPage);
  }, []);

  useEffect(() => {
    localStorage.setItem("atlanticwalk_page", page);
  }, [page]);

  useEffect(() => {
    if (page === "performance") {
      const fetchData = async () => {
        try {
          const res = await fetch("/api/tracker");
          const json = await res.json();
          setTrackerData(json);
        } catch (err) {
          console.error("Error fetching tracker data:", err);
        }
      };
      fetchData();
    }
  }, [page]);

  const renderPage = () => {
    // --- MODELS PAGE ---
    if (page === "models") {
      return (
        <section className="space-y-6 pb-24 ml-4">
          <h2 className="text-2xl font-semibold mb-5">Valuation Models</h2>

          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] font-medium pb-2 border-b border-gray-300">
            <div>Name</div>
            <div>Ticker</div>
            <div>Model</div>
            <div>Report</div>
            <div>Initiation Date</div>
          </div>

          <div className="space-y-2 text-sm">
            {/* AVDL */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center py-2">
              <div className="font-semibold text-black">Avadel Pharmaceuticals</div>
              <div className="font-semibold text-black">(NASDAQ: AVDL)</div>
              <div>
                <a href="/models/AVDLMODEL.xlsx" download className="text-black hover:underline">
                  Download
                </a>
              </div>
              <div>
                <a
                  href="https://seekingalpha.com/article/4826812-avadel-mispriced-leader-in-once-nightly-sleep-therapies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View
                </a>
              </div>
              <div className="text-black">Sep 21, 2025</div>
            </div>

            {/* ACMR */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center py-2">
              <div className="font-semibold text-black">ACM Research</div>
              <div className="font-semibold text-black">(NASDAQ: ACMR)</div>
              <div>
                <a href="/models/ACMRMODEL.xlsx" download className="text-black hover:underline">
                  Download
                </a>
              </div>
              <div>
                <a
                  href="https://seekingalpha.com/article/4799807-acm-research-margin-expansion-and-product-ramp-drive-deep-undervaluation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View
                </a>
              </div>
              <div className="text-black">Jun 24, 2025</div>
            </div>

            {/* MP */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center py-2">
              <div className="font-semibold text-black">MP Materials</div>
              <div className="font-semibold text-black">(NYSE: MP)</div>
              <div>
                <a href="/models/MPMODEL.xlsx" download className="text-black hover:underline">
                  Download
                </a>
              </div>
              <div>
                <a
                  href="https://seekingalpha.com/article/4789889-mp-materials-onshoring-rare-earth-supply-chain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View
                </a>
              </div>
              <div className="text-black">May 26, 2025</div>
            </div>

            {/* NBIS */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center py-2">
              <div className="font-semibold text-black">Nebius</div>
              <div className="font-semibold text-black">(NASDAQ: NBIS)</div>
              <div>
                <a href="/models/NBISMODEL.xlsx" download className="text-black hover:underline">
                  Download
                </a>
              </div>
              <div>
                <a href="/reports/nbis-report.pdf" download className="text-black hover:underline">
                  Download
                </a>
              </div>
              <div className="text-black">Dec 29, 2024</div>
            </div>

            {/* LRCX */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center py-2">
              <div className="font-semibold text-black">Lam Research</div>
              <div className="font-semibold text-black">(NASDAQ: LRCX)</div>
              <div>
                <a href="/models/LRCXMODEL.xlsx" download className="text-black hover:underline">
                  Download
                </a>
              </div>
              <div>
                <a href="/reports/lrcx-report.pdf" download className="text-black hover:underline">
                  Download
                </a>
              </div>
              <div className="text-black">Nov 30, 2024</div>
            </div>

            {/* AMAT */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center py-2">
              <div className="font-semibold text-black">Applied Materials</div>
              <div className="font-semibold text-black">(NASDAQ: AMAT)</div>
              <div>
                <a
                  href="/models/AMAT_MODEL_FULL.xlsx"
                  download
                  className="text-black hover:underline"
                >
                  Download
                </a>
              </div>
              <div>
                <a href="/reports/amat-report.pdf" download className="text-black hover:underline">
                  Download
                </a>
              </div>
              <div className="text-black">Nov 21, 2024</div>
            </div>
          </div>
        </section>
      );
    }

    // --- RESEARCH LIBRARY PAGE (SPA integrated) ---
    if (page === "research") {
      return (
        <section className="max-w-5xl mx-auto px-6 py-10 text-black">
          <h1 className="text-3xl font-bold mb-8">Research Library</h1>

          <div className="grid grid-cols-4 font-semibold border-b border-gray-300 pb-2 mb-4">
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
                  className="grid grid-cols-4 items-center border-b border-gray-200 py-2"
                >
                  <div className="font-medium">{r.title}</div>
                  <div>{r.ticker}</div>
                  <div>{new Date(r.date).toLocaleDateString()}</div>
                  <div>
                    {/* ✅ Link now handled by Next.js client-side routing */}
                    <Link href={`/research/${r.slug}`} className="text-black hover:underline">
                      View Online
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p>No research reports found.</p>
            )}
          </div>
        </section>
      );
    }

    // everything else unchanged ...
    // [the rest of your ABOUT, CONTACT, PERFORMANCE, and HOME sections remain identical]
  };

  return (
    <>
      <Head>
        <title>Atlantic Walk Research | Independent Equity Research</title>
        <meta
          name="description"
          content="Atlantic Walk Research is an independent equity research platform focused on deep fundamental analysis, driver-based modeling, and special-situations investing."
        />
        <meta name="author" content="Glenn Rentrop" />
      </Head>

      <main className="min-h-screen">
        {page === "home" ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <img
              src="/atlantic_walk_logo_transparent.png"
              alt="Atlantic Walk Research Logo"
              className="w-1/2 max-w-xs md:max-w-md lg:max-w-lg cursor-pointer"
              onClick={() => setPage("models")}
            />
          </div>
        ) : (
          <>
            <div className="flex justify-center mt-6">
              <img
                src="/atlantic_walk_logo_transparent.png"
                alt="Atlantic Walk Research Logo"
                className="h-16 w-auto"
              />
            </div>

            <div className="p-8 max-w-5xl mx-auto">
              <nav className="mb-12 flex gap-6 text-lg font-medium justify-center">
                <button onClick={() => setPage("home")} className="text-black hover:underline">
                  Home
                </button>
                <button onClick={() => setPage("models")} className="text-black hover:underline">
                  Models
                </button>
                <button onClick={() => setPage("research")} className="text-black hover:underline">
                  Research Library
                </button>
                <button onClick={() => setPage("performance")} className="text-black hover:underline">
                  Performance
                </button>
                <button onClick={() => setPage("about")} className="text-black hover:underline">
                  About
                </button>
                <button onClick={() => setPage("contact")} className="text-black hover:underline">
                  Contact
                </button>
              </nav>

              {renderPage()}

              <footer className="mt-16 text-sm text-gray-200 border-t pt-4 text-center">
                <p>
                  &copy; 2025 Atlantic Walk Research. Independent research only. Not investment
                  advice.
                </p>
              </footer>
            </div>
          </>
        )}
      </main>
    </>
  );
}

// --- Static Props for Research Library ---
export async function getStaticProps() {
  const reportsDir = path.join(process.cwd(), "content", "reports");
  const files = fs.existsSync(reportsDir) ? fs.readdirSync(reportsDir) : [];

  const reports = files.map((filename) => {
    const markdown = fs.readFileSync(path.join(reportsDir, filename), "utf-8");
    const { data } = matter(markdown);
    return {
      slug: data.slug || filename.replace(/\.md$/, ""),
      title: data.title || "Untitled",
      date: data.date || null,
      ticker: data.ticker || "",
    };
  });

  reports.sort((a, b) => new Date(b.date) - new Date(a.date));
  return { props: { reports } };
}
