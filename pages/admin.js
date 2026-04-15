import { useState } from "react";
import Head from "next/head";

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function exportCSV(subscribers) {
  const rows = [
    ["Email", "Subscribed"],
    ...subscribers.map((s) => [s.email, s.subscribedAt ?? ""]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "awr-subscribers.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function copyAll(subscribers) {
  const emails = subscribers.map((s) => s.email).join("\n");
  navigator.clipboard.writeText(emails);
}

export default function AdminPage() {
  const [password, setPassword]       = useState("");
  const [authed, setAuthed]           = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [status, setStatus]           = useState("idle"); // idle | loading | error
  const [search, setSearch]           = useState("");
  const [copied, setCopied]           = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`/api/admin/subscribers?password=${encodeURIComponent(password)}`);
      if (res.status === 401) { setStatus("error"); return; }
      if (!res.ok) { setStatus("error"); return; }
      const data = await res.json();
      setSubscribers(data);
      setAuthed(true);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  const handleCopyAll = () => {
    copyAll(subscribers);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = subscribers.filter((s) =>
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Admin · Atlantic Walk Research</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-neutral-950 text-gray-100 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm font-semibold text-gray-300 tracking-wide uppercase">
            Atlantic Walk Research · Admin
          </span>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          {!authed ? (
            /* ── Login ── */
            <div
              className="w-full max-w-sm"
              style={{ animation: "fadeUp 0.3s ease both" }}
            >
              <h1 className="text-2xl font-bold text-white mb-1">Admin Login</h1>
              <p className="text-gray-500 text-sm mb-8">
                Enter your admin password to view subscribers.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  autoFocus
                  className="w-full bg-neutral-900 border border-gray-800 focus:border-blue-500/70 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 text-sm outline-none transition"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                    boxShadow: "0 0 20px rgba(37,99,235,0.3)",
                  }}
                >
                  {status === "loading" ? "Checking…" : "Sign In"}
                </button>
                {status === "error" && (
                  <p className="text-red-400 text-xs text-center">
                    Incorrect password.
                  </p>
                )}
              </form>
            </div>
          ) : (
            /* ── Dashboard ── */
            <div
              className="w-full max-w-3xl"
              style={{ animation: "fadeUp 0.3s ease both" }}
            >
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-4xl font-bold text-white">{subscribers.length}</p>
                  <p className="text-xs text-gray-600 mt-1">subscribers</p>
                </div>
                <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Latest</p>
                  <p className="text-sm font-medium text-gray-200 mt-2 break-all">
                    {subscribers.length > 0
                      ? subscribers[subscribers.length - 1].email
                      : "—"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {subscribers.length > 0
                      ? fmt(subscribers[subscribers.length - 1].subscribedAt)
                      : ""}
                  </p>
                </div>
                <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-5 col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Actions</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleCopyAll}
                      className="w-full text-xs font-medium py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-gray-700 transition text-gray-200"
                    >
                      {copied ? "✓ Copied!" : "Copy all emails"}
                    </button>
                    <button
                      onClick={() => exportCSV(subscribers)}
                      className="w-full text-xs font-medium py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-gray-700 transition text-gray-200"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Search */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subscribers…"
                className="w-full bg-neutral-900 border border-gray-800 focus:border-blue-500/50 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 text-sm outline-none transition mb-4"
              />

              {/* Table */}
              <div className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_140px] text-xs font-semibold text-gray-500 uppercase tracking-widest px-5 py-3 border-b border-gray-800">
                  <span>Email</span>
                  <span className="text-right">Subscribed</span>
                </div>

                {/* Rows */}
                {filtered.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-12">
                    {subscribers.length === 0
                      ? "No subscribers yet."
                      : "No results for that search."}
                  </p>
                ) : (
                  <div className="divide-y divide-gray-800/60 max-h-[480px] overflow-y-auto">
                    {[...filtered].reverse().map((s, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_140px] items-center px-5 py-3.5 hover:bg-white/[0.02] transition"
                      >
                        <span className="text-sm text-gray-200 break-all">{s.email}</span>
                        <span className="text-xs text-gray-500 text-right tabular-nums">
                          {fmt(s.subscribedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {filtered.length > 0 && (
                <p className="text-xs text-gray-600 mt-3 text-right">
                  Showing {filtered.length} of {subscribers.length}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
