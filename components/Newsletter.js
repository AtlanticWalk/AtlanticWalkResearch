import { useState, useEffect } from "react";
import Link from "next/link";

export default function NewsletterModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error | duplicate

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (status === "success") {
      if (typeof window !== "undefined") {
        localStorage.setItem("awr_newsletter_subscribed", "true");
      }
      const t = setTimeout(() => { onClose(); setStatus("idle"); setEmail(""); }, 3500);
      return () => clearTimeout(t);
    }
  }, [status, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 201) setStatus("success");
      else if (res.status === 409) setStatus("duplicate");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/30 via-transparent to-purple-500/20 pointer-events-none z-10" />

        <div className="relative bg-gradient-to-br from-neutral-950 via-neutral-900 to-blue-950/40 border border-white/10 rounded-2xl p-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-300 transition text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>

          {status === "success" ? (
            <div className="text-center py-6 space-y-4" style={{ animation: "fadeIn 0.4s ease" }}>
              <div className="flex items-center justify-center mx-auto w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">You&apos;re in.</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Welcome to Atlantic Walk Research. We&apos;ll be in touch.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/25 mb-5">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">
                Stay in the loop
              </h3>
              <p className="text-gray-400 text-sm mb-7 leading-relaxed">
                Subscribe for updates and news from Atlantic Walk Research — new coverage, market commentary, and site announcements.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500/70 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 text-sm outline-none transition duration-200"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4f46e5 100%)",
                    boxShadow: "0 0 20px rgba(37,99,235,0.35)",
                  }}
                >
                  <span className="relative z-10">
                    {status === "loading" ? "Subscribing…" : "Subscribe — it's free"}
                  </span>
                  <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition duration-200" />
                </button>
              </form>

              {status === "duplicate" && (
                <p className="text-yellow-400/80 text-xs mt-3 text-center">Already subscribed — you&apos;re on the list.</p>
              )}
              {status === "error" && (
                <p className="text-red-400/80 text-xs mt-3 text-center">Something went wrong. Please try again.</p>
              )}

              <p className="text-gray-700 text-xs mt-5 text-center">
                No spam.{" "}
                <Link
                  href="/unsubscribe"
                  onClick={onClose}
                  className="underline hover:text-gray-500 transition"
                >
                  Unsubscribe anytime.
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <style>{\`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      \`}</style>
    </div>
  );
}
