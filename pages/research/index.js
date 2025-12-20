// pages/research/index.js
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function ResearchPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Load recharts ONLY in the browser
  const [Recharts, setRecharts] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadChartLib() {
      try {
        const mod = await import("recharts");
        if (!cancelled) setRecharts(mod);
      } catch (e) {
        if (!cancelled) setErr("Could not load chart library (recharts).");
      }
    }

    loadChartLib();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const r = await fetch("/api/tracker?months=12", { cache: "no-store" });
        if (!r.ok) throw new Error(`Tracker API error (${r.status})`);
        const json = await r.json();
        if (!cancelled) setData(Array.isArray(json) ? json : []);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load tracker data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const seriesKeys = useMemo(() => {
    if (!data?.length) return [];
    const keys = Object.keys(data[0] || {}).filter((k) => k !== "date");
    // prefer showing these first if present
    const preferred = ["sp500", "portfolio"];
    const rest = keys.filter((k) => !preferred.includes(k));
    return [...preferred.filter((k) => keys.includes(k)), ...rest];
  }, [data]);

  const Chart = useMemo(() => {
    if (!Recharts) return null;

    const {
      ResponsiveContainer,
      LineChart,
      Line,
      CartesianGrid,
      XAxis,
      YAxis,
      Tooltip,
      Legend,
    } = Recharts;

    function fmtPct(v) {
      if (v === null || v === undefined) return "";
      const n = Number(v);
      if (!Number.isFinite(n)) return "";
      return `${n.toFixed(1)}%`;
    }

    return (
      <div className="w-full h-[420px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data || []} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#9ca3af" }} />
            <YAxis tick={{ fill: "#9ca3af" }} tickFormatter={fmtPct} />
            <Tooltip
              formatter={(val) => fmtPct(val)}
              labelFormatter={(label) => `Week of ${label}`}
            />
            <Legend />

            {/* Always show S&P + Portfolio first if available */}
            {seriesKeys.includes("sp500") && (
              <Line type="monotone" dataKey="sp500" dot={false} strokeWidth={2} />
            )}
            {seriesKeys.includes("portfolio") && (
              <Line type="monotone" dataKey="portfolio" dot={false} strokeWidth={2} />
            )}

            {/* Then show the individual names */}
            {seriesKeys
              .filter((k) => k !== "sp500" && k !== "portfolio")
              .map((k) => (
                <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }, [Recharts, data, seriesKeys]);

  return (
    <div className="min-h-screen">
      <Head>
        <title>Research | Atlantic Walk Research</title>
        <meta name="description" content="Atlantic Walk Research — Research library and performance tracker." />
      </Head>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-200">Research</h1>

          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-200 hover:underline"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem("atlanticwalk_page", "research");
              }
            }}
          >
            ← Back
          </Link>
        </div>

        <p className="text-gray-400 mb-8">
          Tracker shows cumulative % returns from each “pick date” vs S&amp;P 500, using weekly closes.
        </p>

        {loading && <div className="text-gray-400 text-sm">Loading tracker…</div>}

        {!loading && err && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            <div className="font-semibold mb-1">Tracker error</div>
            <div>{err}</div>
          </div>
        )}

        {!loading && !err && (!data || data.length === 0) && (
          <div className="text-gray-400 text-sm">No data returned.</div>
        )}

        {!loading && !err && data?.length > 0 && (
          <>
            {Chart || (
              <div className="text-gray-400 text-sm">
                Loading chart components…
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 overflow-auto">
              <div className="text-gray-300 font-semibold mb-3">Latest (most recent week)</div>

              <table className="min-w-[520px] w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="text-left py-2 pr-4">Series</th>
                    <th className="text-right py-2">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const last = data[data.length - 1] || {};
                    return seriesKeys.map((k) => {
                      const v = last[k];
                      const n = Number(v);
                      const txt = Number.isFinite(n) ? `${n.toFixed(1)}%` : "—";
                      return (
                        <tr key={k} className="border-b border-white/5">
                          <td className="py-2 pr-4 text-gray-200">{k}</td>
                          <td className="py-2 text-right text-gray-200">{txt}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
