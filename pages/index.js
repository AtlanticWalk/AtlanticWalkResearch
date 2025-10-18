import { useState, useEffect } from "react";
import Head from "next/head";
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

export default function AtlanticWalkResearch() {
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
    // --- RESEARCH PAGE ---
    if (page === "research") {
      return (
        <section className="space-y-6 pb-24 ml-4">
          <h2 className="text-2xl font-semibold mb-5">Research Library</h2>

          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] font-medium pb-2 border-b border-gray-300">
            <div>Name</div>
            <div>Ticker</div>
            <div>Model</div>
            <div>Report</div>
            <div>Valuation Date</div>
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
                <a href="/models/lrcx-model.xlsx" download className="text-black hover:underline">
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

    // --- ABOUT PAGE ---
    if (page === "about") {
      return (
        <section className="max-w-2xl ml-auto mr-[1rem] text-left pr-8 pb-20 space-y-6">
          <h2 className="text-2xl font-semibold mb-2">About Atlantic Walk Research</h2>

          <p className="text-base text-black leading-relaxed">
            <strong>Mission:</strong>{" "}
            Turn complex policy, capital-allocation, and structural change into clear,
            asymmetric investment ideas through driver-based models, rigorous primary research,
            and long-horizon thinking.
          </p>

          <p className="text-base text-black leading-relaxed">
            Atlantic Walk Research is an independent equity research platform founded to deliver
            deep fundamental analysis and actionable, conviction-driven ideas. Coverage emphasizes
            catalysts such as regulatory changes, capital allocation, corporate actions, and
            litigation outcomes that can unlock mispriced value.
          </p>

          <div className="pt-2 border-t border-gray-200">
            <h3 className="text-lg font-semibold mt-4">Glenn Rentrop — Managing Partner & Founder</h3>
            <p className="text-base text-black mt-2 leading-relaxed">
              Glenn founded Atlantic Walk Research to pursue deep fundamental coverage of companies
              exposed to structural and policy-driven inflection points. He focuses on driver-based
              financial models, corporate actions, and special-situations work across semi-cap,
              basic materials, biotech, and AI. Glenn brings hands-on valuation modeling,
              primary-source diligence, and a long-horizon investor perspective to identify
              asymmetric risk/reward opportunities.
            </p>
          </div>
        </section>
      );
    }

// --- CONTACT PAGE ---
if (page === "contact") {
  return (
    <section className="max-w-md ml-auto mr-[8rem] text-right">
      {/* Email */}
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

      {/* Links */}
      <div className="text-lg text-black space-y-3">
        {/* Seeking Alpha */}
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

        {/* LinkedIn */}
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

        {/* X */}
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
 
    // --- PERFORMANCE PAGE ---
    if (page === "performance") {
      return (
        <section className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Performance Tracker</h2>
          <p className="text-black mb-4">
            Tracking cumulative percentage returns of Atlantic Walk Research picks versus
            the S&amp;P 500. Returns are normalized to 0% at time of valuation.
          </p>

          {trackerData.length > 0 ? (
            <div className="bg-gray-700 bg-opacity-20 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={trackerData}>
                  <XAxis dataKey="date" stroke="#000000" tick={{ fill: "#000000", fontWeight: 500 }} />
                  <YAxis
                    tickFormatter={(v) => `${v.toFixed(0)}%`}
                    domain={["auto", "auto"]}
                    stroke="#000000"
                    tick={{ fill: "#000000", fontWeight: 500 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload) return null;
                      const sorted = [...payload].sort((a, b) => b.value - a.value);
                      return (
                        <div
                          style={{
                            backgroundColor: "rgba(45, 45, 45, 0.1)",
                            color: "#ffffff",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            boxShadow: "0px 2px 8px rgba(0,0,0,0.3)",
                            minWidth: "180px",
                          }}
                        >
                          <p style={{ margin: 0, fontWeight: "bold", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "4px" }}>
                            {label}
                          </p>
                          {sorted.map((entry, i) => (
                            <p key={entry.name} style={{ margin: "4px 0", display: "flex", justifyContent: "space-between", gap: "8px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                              <span>{`${entry.value.toFixed(2)}%`}</span>
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#000000", fontWeight: "bold" }} />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="sp500" stroke="#10b981" name="S&P 500" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="portfolio" stroke="#000000" name="Atlantic Walk Portfolio" dot={false} />
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

    // --- HOME PAGE ---
    return (
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-2">Atlantic Walk Research</h2>
        <p className="text-lg text-gray-600 mb-6">Independent equity research</p>
      </section>
    );
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
        <meta name="robots" content="index, follow" />
        <meta
          property="og:title"
          content="Atlantic Walk Research | Independent Equity Research"
        />
        <meta
          property="og:description"
          content="Independent, long-horizon research built on rigorous fundamentals and driver-based valuation models."
        />
        <meta property="og:url" content="https://atlanticwalkresearch.com" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://atlanticwalkresearch.com/atlantic_walk_logo_transparent.png"
        />
        <link rel="canonical" href="https://atlanticwalkresearch.com" />
      </Head>

      <main className="min-h-screen">
        {page === "home" ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <img
              src="/atlantic_walk_logo_transparent.png"
              alt="Atlantic Walk Research Logo"
              className="w-1/2 max-w-xs md:max-w-md lg:max-w-lg cursor-pointer"
              onClick={() => setPage("research")}
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
                <button onClick={() => setPage("research")} className="text-black hover:underline">
                  Research
                </button>
                <button
                  onClick={() => setPage("performance")}
                  className="text-black hover:underline"
                >
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
