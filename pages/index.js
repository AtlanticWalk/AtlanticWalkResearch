import { useState, useEffect } from "react";
import Head from "next/head";
import fs from "fs";
import path from "path";
import { reportsMeta } from "../data/reportsMeta";
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
    if (page === "models") {
      return (
        <section className="space-y-8 pb-24 text-gray-100">
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3">
            Valuation Models
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Avadel Pharmaceuticals",
                ticker: "(NASDAQ: AVDL)",
                model: "/models/AVDLMODEL.xlsx",
                report:
                  "https://seekingalpha.com/article/4826812-avadel-mispriced-leader-in-once-nightly-sleep-therapies",
                date: "Sep 21, 2025",
              },
              {
                name: "ACM Research",
                ticker: "(NASDAQ: ACMR)",
                model: "/models/ACMRMODEL.xlsx",
                report:
                  "https://seekingalpha.com/article/4799807-acm-research-margin-expansion-and-product-ramp-drive-deep-undervaluation",
                date: "Jun 24, 2025",
              },
              {
                name: "MP Materials",
                ticker: "(NYSE: MP)",
                model: "/models/MPMODEL.xlsx",
                report:
                  "https://seekingalpha.com/article/4789889-mp-materials-onshoring-rare-earth-supply-chain",
                date: "May 26, 2025",
              },
              {
                name: "Nebius",
                ticker: "(NASDAQ: NBIS)",
                model: "/models/NBISMODEL.xlsx",
                report: "/reports/nbis-report.pdf",
                date: "Dec 29, 2024",
              },
              {
                name: "Lam Research",
                ticker: "(NASDAQ: LRCX)",
                model: "/models/LRCXMODEL.xlsx",
                report: "/reports/lrcx-report.pdf",
                date: "Nov 30, 2024",
              },
              {
                name: "Applied Materials",
                ticker: "(NASDAQ: AMAT)",
                model: "/models/AMAT_MODEL_FULL.xlsx",
                report: "/reports/amat-report.pdf",
                date: "Nov 21, 2024",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="bg-neutral-900 border border-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition"
              >
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{item.ticker}</p>
                <div className="flex justify-between text-sm">
                  <a
                    href={item.model}
                    download
                    className="text-blue-400 hover:underline"
                  >
                    Model
                  </a>
                  <a
                    href={item.report}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Report
                  </a>
                  <span className="text-gray-500">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (page === "research") {
      return (
        <section className="max-w-5xl mx-auto text-gray-100 space-y-8">
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3">
            Research Notes
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {reports.length > 0 ? (
              reports.map((r) => (
                <div
                  key={r.slug}
                  className="bg-neutral-900 border border-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition"
                >
                  <h3 className="text-lg font-semibold mb-1">{r.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{r.ticker}</p>
                  <p className="text-gray-500 text-sm mb-4">
                    {r.date
                      ? new Date(r.date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "—"}
                  </p>
                  <a
                    href={`/research/${r.slug}`}
                    className="text-blue-400 hover:underline"
                  >
                    View Report →
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No research reports found.</p>
            )}
          </div>
        </section>
      );
    }

    if (page === "about") {
      return (
        <section className="max-w-3xl mx-auto text-gray-100 space-y-6">
          <p>
            <strong>Mission:</strong> Turn complex policy, capital allocation,
            and structural change into clear, asymmetric investment ideas
            through driver-based models, rigorous research, and long-horizon
            thinking.
          </p>

          <p>
            Atlantic Walk Research is an independent equity research platform
            delivering deep fundamental analysis and conviction-driven ideas.
            Coverage emphasizes catalysts such as regulation, capital structure,
            and litigation that unlock mispriced value.
          </p>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold">
              Glenn Rentrop — Founder & Managing Partner
            </h3>
            <p className="text-gray-300">
              Glenn focuses on driver-based financial modeling, special
              situations, and long-horizon opportunities across semicap,
              materials, biotech, and AI. His work emphasizes clarity, primary
              diligence, and asymmetric payoff profiles.
            </p>
          </div>
        </section>
      );
    }

    if (page === "contact") {
      return (
        <section className="max-w-md ml-auto mr-[8rem] text-right text-gray-100 space-y-4">
          <p>
            <a
              href="mailto:grentrop@atlanticwalkresearch.com"
              className="hover:underline"
            >
              grentrop@atlanticwalkresearch.com
            </a>
          </p>
          <p>
            <a
              href="https://seekingalpha.com/author/glenn-rentrop"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Seeking Alpha
            </a>
          </p>
          <p>
            <a
              href="https://www.linkedin.com/in/grentrop/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              LinkedIn
            </a>
          </p>
          <p>
            <a
              href="https://x.com/AtlanticWalk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              X (Twitter)
            </a>
          </p>
        </section>
      );
    }

    if (page === "performance") {
      return (
        <section className="max-w-5xl mx-auto text-gray-100">
          <p className="mb-6 text-gray-300">
            Tracking cumulative percentage returns of Atlantic Walk Research
            picks versus the S&amp;P 500. Returns normalized to 0% at initiation.
          </p>

          {trackerData.length > 0 ? (
            <div className="bg-neutral-900 p-4 rounded-xl shadow-md">
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={trackerData}>
                  <XAxis
                    dataKey="date"
                    stroke="#aaa"
                    tick={{ fill: "#aaa", fontWeight: 500 }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v.toFixed(0)}%`}
                    stroke="#aaa"
                    tick={{ fill: "#aaa", fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#fff" }} />
                  <ReferenceLine y={0} stroke="#555" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="sp500"
                    stroke="#10b981"
                    name="S&P 500"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="portfolio"
                    stroke="#ffffff"
                    name="Atlantic Walk Portfolio"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>Loading performance data...</p>
          )}
        </section>
      );
    }

    // Default: Home
    return (
      <section className="flex flex-col items-center justify-center h-screen text-center text-gray-100">
        <img
          src="/atlantic_walk_logo_transparent.png"
          alt="Atlantic Walk Research Logo"
          className="w-56 mb-6"
        />
        <h1 className="text-4xl font-serif tracking-tight mb-2">
          Atlantic Walk Research
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Independent Equity Research | Deep Fundamentals | Asymmetric Ideas
        </p>
        <button
          onClick={() => setPage("research")}
          className="px-6 py-2 border border-gray-400 text-gray-100 hover:bg-gray-100 hover:text-black transition-all duration-300 rounded-md"
        >
          Enter Site
        </button>

        {/* Highlight section */}
        {reports.length > 0 && (
          <div className="absolute bottom-12 w-full px-4">
            <div className="max-w-3xl mx-auto bg-neutral-900 border border-gray-800 rounded-xl shadow-md p-6 text-left">
              <h2 className="text-lg font-semibold mb-1 text-gray-300">
                Latest Research
              </h2>
              <a href={`/research/${reports[0].slug}`}>
                <h3 className="text-xl font-serif hover:underline text-white">
                  {reports[0].title}
                </h3>
              </a>
              <p className="text-gray-400 text-sm mt-1">
                {reports[0].ticker} ·{" "}
                {reports[0].date
                  ? new Date(reports[0].date + "T00:00:00").toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : ""}
              </p>
            </div>
          </div>
        )}
      </section>
    );
  };

  return (
    <>
      <Head>
        <title>Atlantic Walk Research | Independent Equity Research</title>
        <meta
          name="description"
          content="Independent research built on rigorous fundamentals, driver-based models, and asymmetric opportunity analysis."
        />
      </Head>

      <main className="min-h-screen bg-black font-sans transition-all duration-700">
        {/* Navbar */}
        {page !== "home" && (
          <nav className="fixed top-0 w-full bg-black/60 backdrop-blur-sm border-b border-gray-800 z-50 flex justify-center gap-6 py-4 text-sm text-gray-300">
            {[
              ["Home", "home"],
              ["Models", "models"],
              ["Research", "research"],
              ["Performance", "performance"],
              ["About", "about"],
              ["Contact", "contact"],
            ].map(([label, key]) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                className="hover:text-white transition"
              >
                {label}
              </button>
            ))}
          </nav>
        )}

        <div className="pt-20 px-6">{renderPage()}</div>

        {page !== "home" && (
          <footer className="mt-16 text-sm text-gray-600 border-t border-gray-800 py-6 text-center">
            © 2025 Atlantic Walk Research · Independent Equity Research
          </footer>
        )}
      </main>
    </>
  );
}

export async function getStaticProps() {
  const reportsDir = path.join(process.cwd(), "public", "reports");
  const files = fs.existsSync(reportsDir) ? fs.readdirSync(reportsDir) : [];

  const reports = files
    .filter((f) => f.endsWith(".pdf"))
    .map((filename) => {
      const slug = filename.replace(/\.pdf$/, "");
      const meta = reportsMeta.find((m) => m.slug === slug);
      return {
        slug,
        title:
          meta?.title ||
          slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        ticker: meta?.ticker || "",
        date: meta?.date || null,
      };
    })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return { props: { reports } };
}
