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
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-500/10 via-transparent to-gray-600/5 pointer-events-none z-10" />

        {/* Card background */}
        <div className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-gray-700/60 rounded-2xl p-8">

          {/* Top glow line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-300 transition text-xl leading-none"
            aria-label="Close"
          >
            &#x2715;
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
              {/* Icon */}
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-700/50 border border-gray-600/40 mb-5">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>

              {/* Headline */}
              <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">
                Stay in the Loop
              </h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Get notified when new research packages and company updates are published. No noise &mdash; just the updates that matter.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-gray-400/60 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 text-sm outline-none transition duration-200"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #3f3f46 0%, #27272a 60%, #18181b 100%)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
                  }}
                >
                  <span className="relative z-10">
                    {status === "loading" ? "Subscribing…" : "Subscribe — it’s free"}
                  </span>
                  <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition duration-200" />
                </button>
              </form>

              {status === "duplicate" && (
                <p className="text-yellow-400/80 text-xs mt-3 text-center">Already subscribed &mdash; you&apos;re on the list.</p>
              )}
              {status === "error" && (
                <p className="text-red-400/80 text-xs mt-3 text-center">Something went wrong. Please try again.</p>
              )}

              <p className="text-gray-700 text-xs mt-5 text-center">
                No spam.{" "}
                <Link href="/unsubscribe" onClick={onClose} className="underline hover:text-gray-500 transition">
                  Unsubscribe anytime.
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
