import { useState, useEffect } from "react";

export default function NewsletterModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error | duplicate

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-close after success
  useEffect(() => {
    if (status === "success") {
      const t = setTimeout(() => {
        onClose();
        setStatus("idle");
        setEmail("");
      }, 3000);
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
      if (res.status === 201) {
        setStatus("success");
      } else if (res.status === 409) {
        setStatus("duplicate");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative bg-neutral-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-200 text-2xl leading-none transition"
          aria-label="Close"
        >
          ×
        </button>

        {status === "success" ? (
          <div className="text-center space-y-3 py-4">
            <div className="text-4xl text-green-400">✓</div>
            <h3 className="text-xl font-semibold text-gray-100">You&apos;re in.</h3>
            <p className="text-gray-400 text-sm">
              You&apos;ll hear from us when new research is published.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-gray-100 mb-1">
              Stay Informed
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Get notified when new research reports and valuation models are
              published — no spam, ever.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-neutral-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg text-sm transition disabled:opacity-50"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
            </form>

            {status === "duplicate" && (
              <p className="text-yellow-400 text-xs mt-3 text-center">
                That email is already subscribed.
              </p>
            )}
            {status === "error" && (
              <p className="text-red-400 text-xs mt-3 text-center">
                Something went wrong. Please try again.
              </p>
            )}

            <p className="text-gray-600 text-xs mt-5 text-center">
              Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
