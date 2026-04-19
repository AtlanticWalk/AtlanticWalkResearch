import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setDone(true);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('awr_newsletter_subscribed');
      }
    } else {
      const data = await res.json();
      setError(data.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Unsubscribe — Atlantic Walk Research</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-200 transition">
              ← Atlantic Walk Research
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-white">Unsubscribe</h1>
            <p className="text-gray-400 text-sm mt-1">
              We&apos;re sorry to see you go.
            </p>
          </div>

          <div className="bg-neutral-900/80 backdrop-blur border border-gray-800 rounded-xl p-8 shadow-xl">
            {done ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-400 text-xl">✓</span>
                </div>
                <p className="text-white font-medium mb-2">You&apos;ve been unsubscribed</p>
                <p className="text-gray-400 text-sm">
                  {email} has been removed from the Atlantic Walk Research mailing list.
                </p>
                <Link
                  href="/"
                  className="inline-block mt-6 text-blue-400 hover:text-blue-300 text-sm transition"
                >
                  Return to home
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
                  className="w-full bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
                >
                  {loading ? 'Removing…' : 'Unsubscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
