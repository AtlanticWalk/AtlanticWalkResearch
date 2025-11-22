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

/* --- Mobile header + drawer (mobile only) --- */
function MobileHeader({ setPage }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const items = [
    ["Home", "home"],
    ["Highlights", "highlights"],
    ["Models", "models"],
    ["Research", "research"],
    ["Performance", "performance"],
    ["About", "about"],
    ["Contact", "contact"],
  ];

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50">
      <div className="bg-black/60 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 h-14 flex items-center justify-between">
          <button onClick={() => setPage("home")} className="flex items-center gap-2">
            <img
              src="/atlantic_walk_logo_transparent.png"
              alt="Atlantic Walk Research"
              className="h-8 w-auto"
            />
          </button>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((s) => !s)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-700 p-2 text-gray-200"
          >
            <span className="block h-0.5 w-5 bg-current mb-1" />
            <span className="block h-0.5 w-5 bg-current mb-1" />
            <span className="block h-0.5 w-5 bg-current" />
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="bg-black/80 backdrop-blur-sm border-b border-gray-800">
          <nav className="px-4 py-3 flex flex-col gap-3 text-gray-200">
            {items.map(([label, key]) => (
              <button
                key={key}
                onClick={() => {
                  setOpen(false);
                  setPage(key);
                }}
                className="py-2 px-2 text-left rounded-lg hover:bg-white/5"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

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
    // ---------------- HIGHLIGHTS (new) ----------------
    if (page === "highlights") {
      return (
        <section className="max-w-4xl mx-auto text-gray-100 space-y-8">
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3">
            Highlights
          </h2>

          {reports.length > 0 ? (
            <div className="bg-neutral-900 bg-opacity-50 border border-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-1 text-gray-300">
                Latest Research
              </h3>
              <a href={`/research/${reports[0].slug}`} className="block group">
                <h4 className="text-2xl font-serif group-hover:underline text-white">
                  {reports[0].title}
                </h4>
              </a>
              <p className="text-gray-400 text-sm mt-1">
                {reports[0].ticker} ·{" "}
                {reports[0].date
                  ? new Date(reports[0].date + "T00:00:00").toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )
                  : ""}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No research available.</p>
          )}
        </section>
      );
    }

    // ---------------- MODELS ----------------
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
                className="bg-neutral-900 bg-opacity-50 border border-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition"
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

    // ---------------- RESEARCH (UPDATED TO LIST + SA LINKS) ----------------
    if (page === "research") {
      // External Seeking Alpha reports
      const externalReports = [
        {
          id: "avdl-sa",
          title: "Avadel: Mispriced Leader In Once-Nightly Sleep Therapies",
          ticker: "NASDAQ: AVDL",
          date: "2025-09-21",
          url: "https://seekingalpha.com/article/4826812-avadel-mispriced-leader-in-once-nightly-sleep-therapies",
          external: true,
          source: "Seeking Alpha",
        },
        {
          id: "acmr-sa",
          title:
            "ACM Research: Margin Expansion And Product Ramp Drive Deep Undervaluation",
          ticker: "NASDAQ: ACMR",
          date: "2025-06-24",
          url: "https://seekingalpha.com/article/4799807-acm-research-margin-expansion-and-product-ramp-drive-deep-undervaluation",
          external: true,
          source: "Seeking Alpha",
        },
        {
          id: "mp-sa",
          title: "MP Materials: Onshoring The Rare Earth Supply Chain",
          ticker: "NYSE: MP",
          date: "2025-05-26",
          url: "https://seekingalpha.com/article/4789889-mp-materials-onshoring-rare-earth-supply-chain",
          external: true,
          source: "Seeking Alpha",
        },
      ];

      // Internal PDF-based reports
      const internalReports = (reports || []).map((r) => ({
        id: r.slug,
        title: r.title,
        ticker: r.ticker,
        date: r.date,
        url: `/research/${r.slug}`,
        external: false,
        source: "Atlantic Walk Research",
      }));

      const allReports = [...internalReports, ...externalReports].sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
      );

      return (
        <section className="max-w-5xl mx-auto text-gray-100 space-y-6">
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3">
            Research Library
          </h2>

          {/* Header row */}
          <div className="grid grid-cols-[3fr_1fr_1fr_1.4fr] text-sm font-semibold border-b border-gray-700 pb-2">
            <div>Title</div>
            <div>Ticker</div>
            <div>Date</div>
            <div>Source / Link</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-800 text-sm">
            {allReports.length > 0 ? (
              allReports.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[3fr_1fr_1fr_1.4fr] items-center py-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    {item.external && (
                      <span className="text-xs text-gray-500">
                        published on Seeking Alpha
                      </span>
                    )}
                  </div>
                  <div className="text-gray-300">{item.ticker}</div>
                  <div className="text-gray-400">
                    {item.date
                      ? new Date(item.date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "—"}
                  </div>
                  <div>
                    <a
                      href={item.url}
                      {...(item.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-blue-400 hover:underline"
                    >
                      {item.external ? "View on Seeking Alpha" : "View Online"}
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 py-4">No research reports found.</p>
            )}
          </div>
        </section>
      );
    }

    // ---------------- ABOUT ----------------
    if (page === "about") {
      return (
        <section className="max-w-2xl ml-auto mr-[4rem] text-black text-semibold text-left pr-8 pb-20 space-y-6">
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
            <p className="text-black text-semibold">
              Glenn focuses on driver-based financial modeling, special
              situations, and long-horizon opportunities across semicap,
              materials, biotech, and AI. His work emphasizes clarity, primary
              diligence, and asymmetric payoff profiles.
            </p>
          </div>
        </section>
      );
    }

    // ---------------- CONTACT ----------------
    if (page === "contact") {
      return (
        <section className="max-w-md w-full mx-auto md:ml-auto md:mr-[8rem] md:text-right text-center md:pr-8 px-4">
          <p className="text-lg text-black font-semibold mb-4 flex items-center justify-end gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 12H8m0 0l4 4m-4-4l4-4M4 6h16v12H4V6z"
              />
            </svg>
            <a
              href="mailto:grentrop@atlanticwalkresearch.com"
              className="text-black hover:underline"
            >
              grentrop@atlanticwalkresearch.com
            </a>
          </p>

          <div className="text-lg text-black space-y-3">
            <p className="flex items-center justify-end gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <a
                href="https://seekingalpha.com/author/glenn-rentrop"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:underline"
              >
                Seeking Alpha
              </a>
            </p>

            <p className="flex items-center justify-end gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.1c.5-.9 1.7-2.2 3.6-2.2 3.9 0 4.6 2.5 4.6 5.8V24h-4v-7.7c0-1.8 0-4.2-2.6-4.2-2.6 0-3 2-3 4V24h-4V8z" />
              </svg>
              <a
                href="https://www.linkedin.com/in/grentrop/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:underline"
              >
                LinkedIn
              </a>
            </p>

            <p className="flex items-center justify-end gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22.162 0H1.838A1.84 1.84 0 0 0 0 1.838v20.324A1.84 1.84 0 0 0 1.838 24h20.324A1.84 1.84 0 0 0 24 22.162V1.838A1.84 1.84 0 0 0 22.162 0zM17.65 7.365l-4.248 5.112 4.504 5.985h-3.035l-2.818-3.749-3.223 3.749H5.6l4.544-5.284-4.327-5.814h3.082l2.643 3.576 3.056-3.576h3.052z" />
              </svg>
              <a
                href="https://x.com/AtlanticWalk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:underline"
              >
                X
              </a>
            </p>
          </div>
        </section>
      );
    }

    // ---------------- PERFORMANCE ----------------
    if (page === "performance") {
      return (
        <section className="max-w-5xl mx-auto text-gray-100">
          <p className="mb-6 text-gray-300">
            Tracking cumulative percentage returns of Atlantic Walk Research
            picks versus the S&amp;P 500. Returns are normalized to 0% at time of valuation.
          </p>

          {trackerData.length > 0 ? (
            <div className="bg-neutral-600 bg-opacity-20 rounded-xl p-3 mt-0">
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={trackerData}>
                  <XAxis
                    dataKey="date"
                    stroke="#aaaaaa"
                    tick={{ fill: "#aaaaaa", fontWeight: 500 }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v.toFixed(0)}%`}
                    domain={["auto", "auto"]}
                    stroke="#aaaaaa"
                    tick={{ fill: "#aaaaaa", fontWeight: 500 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload) return null;
                      const sorted = [...payload].sort((a, b) => b.value - a.value);
                      return (
                        <div
                          style={{
                            backgroundColor: "rgba(20, 20, 20, 0.2)",
                            color: "#ffffff",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            boxShadow: "0px 2px 8px rgba(0,0,0,0.3)",
                            minWidth: "180px",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontWeight: "bold",
                              borderBottom: "1px solid rgba(255,255,255,0.2)",
                              paddingBottom: "4px",
                            }}
                          >
                            {label}
                          </p>
                          {sorted.map((entry, i) => (
                            <p
                              key={entry.name}
                              style={{
                                margin: "4px 0",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "8px",
                              }}
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <span
                                  style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: entry.color || "#ccc",
                                  }}
                                />
                                {`${i + 1}. ${entry.name}`}
                              </span>
                              <span>{`${entry.value?.toFixed?.(2) ?? entry.value}%`}</span>
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#ffffff", fontWeight: "bold" }} />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />

                  {/* Lines — restored full set */}
                  <Line type="monotone" dataKey="sp500" stroke="#10b981" name="S&P 500" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="portfolio" stroke="#ffffff" name="Atlantic Walk Portfolio" dot={false} />
                  <Line type="monotone" dataKey="avdl" stroke="#ff4d4f" name="AVDL" dot={false} />
                  <Line type="monotone" dataKey="mp" stroke="#82ca9d" name="MP Materials" dot={false} />
                  <Line type="monotone" dataKey="acmr" stroke="#ff7300" name="ACM Research" dot={false} />
                  <Line type="monotone" dataKey="nbis" stroke="#13c2c2" name="NBIS" dot={false} />
                  <Line type="monotone" dataKey="amat" stroke="#2f54eb" name="AMAT" dot={false} />
                  <Line type="monotone" dataKey="lrcx" stroke="#a0d911" name="LRCX" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>Loading performance data...</p>
          )}
        </section>
      );
    }

    // ---------------- HOME (cover) ----------------
    return (
      <section className="flex flex-col items-center justify-center h-screen text-center text-gray-100">
        <img
          src="/atlantic_walk_logo_transparent.png"
          alt="Atlantic Walk Research Logo"
          className="w-80 mb-0 cursor-pointer"
          onClick={() => setPage("models")}
        />
      </section>
    );
  };

  return (
    <>
      <Head>
        <title>Atlantic Walk Research | Independent Equity Research</title>

        {/* Viewport ensures Tailwind breakpoints work on phones */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta
          name="description"
          content="Atlantic Walk Research is an independent equity research platform focused on deep fundamental analysis, driver-based modeling, and special-situations investing."
        />
        <meta name="author" content="Glenn Rentrop" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph / Social */}
        <meta property="og:title" content="Atlantic Walk Research | Independent Equity Research" />
        <meta
          property="og:description"
          content="Independent, long-horizon research built on rigorous fundamentals and driver-based valuation models."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://atlanticwalkresearch.com" />
        <meta
          property="og:image"
          content="https://atlanticwalkresearch.com/atlantic_walk_logo_transparent.png"
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://atlanticwalkresearch.com/" />

        {/* ✅ Structured data for Google (Schema.org JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Atlantic Walk Research",
              "url": "https://atlanticwalkresearch.com",
              "logo": "https://atlanticwalkresearch.com/atlantic_walk_logo_transparent.png",
              "description":
                "Independent equity research platform providing deep fundamental analysis, driver-based models, and special-situations coverage.",
              "founder": {
                "@type": "Person",
                "name": "Glenn Rentrop",
              },
              "sameAs": [
                "https://www.linkedin.com/in/grentrop/",
                "https://x.com/AtlanticWalk",
                "https://seekingalpha.com/author/glenn-rentrop"
              ],
            }),
          }}
        />
      </Head>

      {/* Background images (desktop via inline; mobile via extra layer) */}
      <main
        className="relative min-h-screen bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage:
            page === "home"
              ? "url('/backgrounds/home-bg.jpg')"
              : "url('/backgrounds/other-bg.jpg')",
        }}
      >
        {/* Mobile-only background layer (shows your /backgrounds/home-bg-mobile.JPG) */}
        <div
          className="md:hidden pointer-events-none fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/backgrounds/home-bg-mobile.JPG')" }}
        />

        {/* Mobile header (hamburger) only when nav is visible */}
        {page !== "home" && <MobileHeader setPage={setPage} />}

        {/* Navbar hidden on home; visible elsewhere (desktop only here) */}
        {page !== "home" && (
          <nav className="hidden md:flex fixed top-0 w-full bg-black/60 backdrop-blur-sm border-b border-gray-800 z-50 justify-center gap-6 py-4 text-base font-semibold text-gray-300">
            {[
              ["Home", "home"],
              ["Highlights", "highlights"],
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

        {/* Page container (adds top padding only when nav is visible) */}
        <div className={page !== "home" ? "pt-20 px-6" : ""}>
          {renderPage()}
        </div>
      </main>
    </>
  );
}

// --- Static Props for Research Library ---
export async function getStaticProps() {
  const reportsDir = path.join(process.cwd(), "public", "reports");
  const files = fs.existsSync(reportsDir) ? fs.readdirSync(reportsDir) : [];

  const reports = files
    .filter((f) => f.endsWith(".pdf")) // only PDFs
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
    });

  // sort newest first, tolerate nulls
  reports.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return { props: { reports } };
}
