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
    // ---------------- HIGHLIGHTS ----------------
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
            {[ /* model cards omitted here for brevity; same as your original */ ]}.map((item) => (
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

    // ---------------- RESEARCH ----------------
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
                  className="bg-neutral-900 bg-opacity-50 border border-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition"
                >
                  <h3 className="text-lg font-semibold mb-1">{r.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{r.ticker}</p>
                  <p className="text-gray-500 text-sm mb-4">
                    {r.date
                      ? new Date(r.date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
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

    // ---------------- ABOUT ----------------
    if (page === "about") {
      return (
        <section className="max-w-2xl ml-auto mr-[4rem] text-left pr-8 pb-20 space-y-6">
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
            <p className="text-black">
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
        <section className="max-w-md ml-auto mr-[8rem] text-right">
          {/* contact content omitted for brevity; same as your original */}
        </section>
      );
    }

    // ---------------- PERFORMANCE ----------------
    if (page === "performance") {
      return (
        <section className="max-w-5xl mx-auto text-gray-100">
          <p className="mb-6 text-gray-300">
            Tracking cumulative percentage returns of Atlantic Walk Research
            picks versus the S&amp;P 500.
          </p>

          {trackerData.length > 0 ? (
            <div className="bg-neutral-600 bg-opacity-20 rounded-xl p-3 mt-0">
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={trackerData}>
                  {/* chart config identical to your original */}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>Loading performance data...</p>
          )}
        </section>
      );
    }

    // ---------------- HOME ----------------
    return (
      <section className="flex flex-col items-center justify-center h-screen text-center text-gray-100">
        <img
          src="/atlantic_walk_logo_transparent.png"
          alt="Atlantic Walk Research Logo"
          className="w-72 mb-0 cursor-pointer"
          onClick={() => setPage("models")}
        />
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
        {/* ... full meta & JSON-LD from your original file ... */}
      </Head>

      <main
        className={`min-h-svh bg-cover bg-center transition-all duration-700 bg-scroll md:bg-fixed ${
          page === "home"
            ? "bg-[url('/public/backgrounds/mobile-bg.jpg')] md:bg-[url('/public/backgrounds/home-bg.jpg')]"
            : "bg-[url('/public/backgrounds/mobile-bg.jpg')] md:bg-[url('/public/backgrounds/home-bg.jpg')]"
        }`}
      >
        {page !== "home" && (
          <nav className="fixed top-0 w-full bg-black/60 backdrop-blur-sm border-b border-gray-800 z-50 flex justify-center gap-6 py-4 text-base text-semibold text-gray-300">
            {[
              ["Home", "home"],
              ["Highlights", "highlights"],
              ["Models & Initiation Reports", "models"],
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

        <div className={page !== "home" ? "pt-20 px-6" : ""}>{renderPage()}</div>

        {page !== "home" && (
          <footer className="mt-16 text-sm text-gray-500 border-t border-gray-800 py-6 text-center">
            © 2025 Atlantic Walk Research · Independent Equity Research · Not Financial Advice
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
    });

  reports.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return { props: { reports } };
}
