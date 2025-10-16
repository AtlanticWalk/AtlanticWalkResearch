import { useState, useEffect } from "react";
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
              <div className="font-semibold text-black">NBIS</div>
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
        <section className="max-w-md ml-auto mr-[8rem] text-left">
          <h2 className="text-2xl font-semibold mb-4">About Atlantic Walk Research</h2>
          <p className="text-base text-black leading-relaxed">
            Atlantic Walk Research is an independent equity research platform founded by Glenn Rentrop.
            The focus is simple: rigorous fundamentals, driver-based models, and special-situations work at the intersection of policy and cash flow.
            Coverage emphasizes catalysts such as regulatory changes, capital allocation, corporate actions, and litigation outcomes that can unlock mispriced value.
            Coverage has included Semi-cap, Basic Materials, Biotech, and AI. Atlantic Walk is self-directed and unaffiliated with any financial institution.
            All views are personal and do not constitute investment advice.
          </p>
        </section>
      );
    }

    // --- CONTACT PAGE ---
    if (page === "contact") {
      return (
        <section className="max-w-md ml-auto mr-[8rem] text-right">
          <h2 className="text-2xl font-semibold mb-4"></h2>
          <p className="text-lg text-black font-semibold mb-3">
            {" "}
            <a
              href="mailto:grentrop@atlanticwalkresearch.com"
              className="text-black hover:underline"
            >
              grentrop@atlanticwalkresearch.com
            </a>
          </p>
          <div className="text-lg text-black space-y-2">
            <a
              href="https://seekingalpha.com/author/glenn-rentrop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:underline block"
            >
              Seeking Alpha Profile
            </a>
            <a
              href="https://www.linkedin.com/in/grentrop/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:underline block"
            >
              LinkedIn Profile
            </a>
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
            <div className="bg-gray-700 bg-opacity-50 rounded-xl p-4">
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
                    contentStyle={{
                      backgroundColor: "rgba(45, 45, 45, 0.5)", // dark grey translucent
                      color: "#ffffff",
                      borderRadius: "8px",
                      border: black,
                      boxShadow: "0px 2px 8px rgba(0,0,0,0.3)",
                    }}
                    formatter={(value, name, props, all) => {
                      // `all` contains all payload values for the current hover date
                      if (all && all.payload) {
                        // Collect values and sort by performance descending
                        const sorted = Object.entries(all.payload)
                          .filter(([k, v]) => typeof v === "number")
                          .sort((a, b) => b[1] - a[1]);
                  
                        // Find this line’s position in sorted order
                        const rank = sorted.findIndex(([k]) => k === name) + 1;
                  
                        // Format: e.g., "#1  +23.5%"
                        return [`${value.toFixed(2)}%`, `${rank}. ${name}`];
                      }
                  
                      // Default fallback
                      return [`${value.toFixed(2)}%`, name];
                    }}
                    labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
                  />
                  <Legend wrapperStyle={{ color: "#000000", fontWeight: "bold" }} />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />

                  {/* Lines without dots */}
                  <Line type="monotone" dataKey="sp500" stroke="#10b981" name="S&P 500" strokeWidth={2} dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="portfolio" stroke="#000000" name="Atlantic Walk Portfolio" dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="avdl" stroke="#ff4d4f" name="AVDL" dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="mp" stroke="#82ca9d" name="MP Materials" dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="acmr" stroke="#ff7300" name="ACM Research" dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="nbis" stroke="#13c2c2" name="NBIS" dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="amat" stroke="#2f54eb" name="AMAT" dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="lrcx" stroke="#a0d911" name="LRCX" dot={false} activeDot={false} />
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
            <img src="/atlantic_walk_logo_transparent.png" alt="Atlantic Walk Research Logo" className="h-16 w-auto" />
          </div>

          <div className="p-8 max-w-5xl mx-auto">
            <nav className="mb-12 flex gap-6 text-lg font-medium justify-center">
              <button onClick={() => setPage("home")} className="text-black hover:underline">
                Home
              </button>
              <button onClick={() => setPage("research")} className="text-black hover:underline">
                Research
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
              <p>&copy; 2025 Atlantic Walk Research. Independent research only. Not investment advice.</p>
            </footer>
          </div>
        </>
      )}
    </main>
  );
}
