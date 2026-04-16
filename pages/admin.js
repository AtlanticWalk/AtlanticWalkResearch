import { useState } from "react";
import Head from "next/head";

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
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
  const [password, setPassword]         = useState("");
  const [authed, setAuthed]             = useState(false);
  const [activeTab, setActiveTab]       = useState("subscribers"); // subscribers | members
  const [subscribers, setSubscribers]   = useState([]);
  const [members, setMembers]           = useState([]);
  const [status, setStatus]             = useState("idle");
  const [search, setSearch]             = useState("");
  const [copied, setCopied]             = useState(false);

  // Create member form
  const [newEmail, setNewEmail]         = useState("");
  const [newNote, setNewNote]           = useState("");
  const [createStatus, setCreateStatus] = useState("idle"); // idle | loading | success | error
  const [createMsg, setCreateMsg]       = useState("");
  const [removingEmail, setRemovingEmail] = useState(null); // email currently being confirmed
  const [removeStatus, setRemoveStatus]   = useState({});   // { [email]: 'loading'|'done'|'error' }

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const [subRes, memRes] = await Promise.all([
        fetch(`/api/admin/subscribers?password=${encodeURIComponent(password)}`),
        fetch(`/api/admin/members?password=${encodeURIComponent(password)}`),
      ]);
      if (subRes.status === 401) { setStatus("error"); return; }
      const subData = await subRes.json();
      const memData = memRes.ok ? await memRes.json() : [];
      setSubscribers(subData);
      setMembers(memData);
      setAuthed(true);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setCreateStatus("loading");
    setCreateMsg("");
    try {
      const res = await fetch("/api/admin/create-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, email: newEmail, note: newNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateStatus("error");
        setCreateMsg(data.error || "Something went wrong.");
      } else {
        setCreateStatus("success");
        setCreateMsg(`✓ Account created and invite sent to ${newEmail}`);
        setNewEmail("");
        setNewNote("");
        // Refresh members list
        const memRes = await fetch(`/api/admin/members?password=${encodeURIComponent(password)}`);
        if (memRes.ok) setMembers(await memRes.json());
      }
    } catch {
      setCreateStatus("error");
      setCreateMsg("Something went wrong. Please try again.");
    }
  };

  const handleRemoveMember = async (email) => {
    setRemoveStatus((s) => ({ ...s, [email]: 'loading' }));
    try {
      const res = await fetch('/api/admin/remove-member', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, email }),
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.email !== email));
        setRemoveStatus((s) => ({ ...s, [email]: 'done' }));
      } else {
        setRemoveStatus((s) => ({ ...s, [email]: 'error' }));
      }
    } catch {
      setRemoveStatus((s) => ({ ...s, [email]: 'error' }));
    }
    setRemovingEmail(null);
  };

  const handleCopyAll = () => {
    copyAll(subscribers);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSubs = subscribers.filter((s) =>
    s.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredMembers = members.filter((m) =>
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const paidCount = members.filter((m) => m.isSubscribed && !m.isComplimentary).length;
  const freeCount = members.filter((m) => m.isComplimentary).length;

  return (
    <>
      <Head>
        <title>Admin · Atlantic Walk Research</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-neutral-950 text-gray-100 flex flex-col">
        <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm font-semibold text-gray-300 tracking-wide uppercase">
            Atlantic Walk Research · Admin
          </span>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          {!authed ? (
            <div className="w-full max-w-sm" style={{ animation: "fadeUp 0.3s ease both" }}>
              <h1 className="text-2xl font-bold text-white mb-1">Admin Login</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your admin password to continue.</p>
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
                  style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)", boxShadow: "0 0 20px rgba(37,99,235,0.3)" }}
                >
                  {status === "loading" ? "Checking…" : "Sign In"}
                </button>
                {status === "error" && (
                  <p className="text-red-400 text-xs text-center">Incorrect password.</p>
                )}
              </form>
            </div>
          ) : (
            <div className="w-full max-w-3xl" style={{ animation: "fadeUp 0.3s ease both" }}>

              {/* Tabs */}
              <div className="flex gap-1 mb-8 border-b border-gray-800">
                {[
                  { id: "subscribers", label: "Newsletter Subscribers" },
                  { id: "members", label: "Members" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSearch(""); }}
                    className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? "text-white border-blue-500"
                        : "text-gray-500 border-transparent hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── SUBSCRIBERS TAB ── */}
              {activeTab === "subscribers" && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-4xl font-bold text-white">{subscribers.length}</p>
                      <p className="text-xs text-gray-600 mt-1">subscribers</p>
                    </div>
                    <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Latest</p>
                      <p className="text-sm font-medium text-gray-200 mt-2 break-all">
                        {subscribers.length > 0 ? subscribers[subscribers.length - 1].email : "—"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {subscribers.length > 0 ? fmt(subscribers[subscribers.length - 1].subscribedAt) : ""}
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

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search subscribers…"
                    className="w-full bg-neutral-900 border border-gray-800 focus:border-blue-500/50 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 text-sm outline-none transition mb-4"
                  />

                  <div className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-[1fr_140px] text-xs font-semibold text-gray-500 uppercase tracking-widest px-5 py-3 border-b border-gray-800">
                      <span>Email</span>
                      <span className="text-right">Subscribed</span>
                    </div>
                    {filteredSubs.length === 0 ? (
                      <p className="text-gray-600 text-sm text-center py-12">
                        {subscribers.length === 0 ? "No subscribers yet." : "No results."}
                      </p>
                    ) : (
                      <div className="divide-y divide-gray-800/60 max-h-[480px] overflow-y-auto">
                        {[...filteredSubs].reverse().map((s, i) => (
                          <div key={i} className="grid grid-cols-[1fr_140px] items-center px-5 py-3.5 hover:bg-white/[0.02] transition">
                            <span className="text-sm text-gray-200 break-all">{s.email}</span>
                            <span className="text-xs text-gray-500 text-right tabular-nums">{fmt(s.subscribedAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {filteredSubs.length > 0 && (
                    <p className="text-xs text-gray-600 mt-3 text-right">
                      Showing {filteredSubs.length} of {subscribers.length}
                    </p>
                  )}
                </div>
              )}

              {/* ── MEMBERS TAB ── */}
              {activeTab === "members" && (
                <div>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-4xl font-bold text-white">{members.length}</p>
                      <p className="text-xs text-gray-600 mt-1">accounts</p>
                    </div>
                    <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Paid</p>
                      <p className="text-4xl font-bold text-emerald-400">{paidCount}</p>
                      <p className="text-xs text-gray-600 mt-1">active subscriptions</p>
                    </div>
                    <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Complimentary</p>
                      <p className="text-4xl font-bold text-blue-400">{freeCount}</p>
                      <p className="text-xs text-gray-600 mt-1">free accounts</p>
                    </div>
                  </div>

                  {/* Create free member form */}
                  <div className="bg-neutral-900 border border-gray-700 rounded-2xl p-6 mb-6">
                    <h2 className="text-sm font-semibold text-white mb-1">Create Free Member</h2>
                    <p className="text-xs text-gray-500 mb-4">
                      Creates a complimentary account and emails login credentials automatically.
                    </p>
                    <form onSubmit={handleCreateMember} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Email address"
                        required
                        className="flex-1 bg-neutral-800 border border-gray-700 focus:border-blue-500/70 rounded-xl px-4 py-2.5 text-gray-100 placeholder-gray-500 text-sm outline-none transition"
                      />
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Note (optional)"
                        className="w-full sm:w-44 bg-neutral-800 border border-gray-700 focus:border-blue-500/70 rounded-xl px-4 py-2.5 text-gray-100 placeholder-gray-500 text-sm outline-none transition"
                      />
                      <button
                        type="submit"
                        disabled={createStatus === "loading"}
                        className="shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                      >
                        {createStatus === "loading" ? "Creating…" : "Create & Invite"}
                      </button>
                    </form>
                    {createMsg && (
                      <p className={`text-xs mt-3 ${createStatus === "success" ? "text-emerald-400" : "text-red-400"}`}>
                        {createMsg}
                      </p>
                    )}
                  </div>

                  {/* Members list */}
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search members…"
                    className="w-full bg-neutral-900 border border-gray-800 focus:border-blue-500/50 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 text-sm outline-none transition mb-4"
                  />

                  <div className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-[1fr_110px_120px_60px] text-xs font-semibold text-gray-500 uppercase tracking-widest px-5 py-3 border-b border-gray-800">
                      <span>Email</span>
                      <span className="text-center">Type</span>
                      <span className="text-right">Joined</span>
                    </div>
                    {filteredMembers.length === 0 ? (
                      <p className="text-gray-600 text-sm text-center py-12">
                        {members.length === 0 ? "No members yet." : "No results."}
                      </p>
                    ) : (
                      <div className="divide-y divide-gray-800/60 max-h-[480px] overflow-y-auto">
                        {filteredMembers.map((m, i) => (
                          <div key={i} className="grid grid-cols-[1fr_110px_120px_60px] items-center px-5 py-3.5 hover:bg-white/[0.02] transition">
                            <div>
                              <span className="text-sm text-gray-200 break-all">{m.email}</span>
                              {m.note && <p className="text-xs text-gray-600 mt-0.5">{m.note}</p>}
                            </div>
                            <div className="flex justify-center">
                              {m.isComplimentary ? (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  Free
                                </span>
                              ) : m.isSubscribed ? (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Paid
                                </span>
                              ) : (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-600/20">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 text-right tabular-nums">{fmt(m.createdAt)}</span>
                            <div className="flex justify-end">
                              {removingEmail === m.email ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleRemoveMember(m.email)}
                                    disabled={removeStatus[m.email] === 'loading'}
                                    className="text-xs text-red-400 hover:text-red-300 font-medium transition disabled:opacity-50"
                                  >
                                    {removeStatus[m.email] === 'loading' ? '…' : 'Yes'}
                                  </button>
                                  <span className="text-gray-700">·</span>
                                  <button
                                    onClick={() => setRemovingEmail(null)}
                                    className="text-xs text-gray-500 hover:text-gray-300 transition"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setRemovingEmail(m.email)}
                                  className="text-xs text-gray-600 hover:text-red-400 transition"
                                  title="Remove member"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {filteredMembers.length > 0 && (
                    <p className="text-xs text-gray-600 mt-3 text-right">
                      Showing {filteredMembers.length} of {members.length}
                    </p>
                  )}
                </div>
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
