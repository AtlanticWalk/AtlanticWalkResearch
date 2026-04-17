import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password — Atlantic Walk Research</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-200 transition">
              ← Back to login
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-white">Forgot password?</h1>
            <p className="text-gray-400 text-sm mt-1">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <div className="bg-neutral-900/80 backdrop-blur border border-gray-800 rounded-xl p-8 shadow-xl">
            {submitted ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-400 text-xl">✓</span>
                </div>
                <p className="text-white font-medium mb-2">Check your inbox</p>
                <p className="text-gray-400 text-sm">
                  If <span className="text-gray-300">{email}</span> is registered, you'll receive a password reset link within a minute.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-6 text-blue-400 hover:text-blue-300 text-sm transition"
                >
                  Return to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full bg-neutral-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
