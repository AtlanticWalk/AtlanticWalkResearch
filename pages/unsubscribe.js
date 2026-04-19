import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Unsubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('awr_newsletter_subscribed');
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Unsubscribe | Atlantic Walk Research</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
            {status === 'success' ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mx-auto w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Unsubscribed</h1>
                <p className="text-gray-400 text-sm">
                  You&apos;ve been removed from the Atlantic Walk Research mailing list.
                </p>
                <Link href="/" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 underline transition">
                  Back to home
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white mb-2">Unsubscribe</h1>
                <p className="text-gray-400 text-sm mb-6">
                  Enter your email address to be removed from our mailing list.
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
                    disabled={status === 'loading'}
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white bg-neutral-700 hover:bg-neutral-600 transition disabled:opacity-60"
                  >
                    {status === 'loading' ? 'Processing…' : 'Unsubscribe'}
                  </button>
                </form>

                {status === 'error' && (
                  <p className="text-red-400/80 text-xs mt-3 text-center">Something went wrong. Please try again.</p>
                )}

                <p className="text-gray-700 text-xs mt-5 text-center">
                  <Link href="/" className="underline hover:text-gray-500 transition">
                    Back to home
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
