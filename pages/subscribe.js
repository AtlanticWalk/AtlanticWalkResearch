import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const FEATURES = [
  { icon: '📄', label: 'Full-length research reports', sublabel: 'Early access before public release' },
  { icon: '📊', label: 'Complete valuation models', sublabel: 'DCF models, scenario frameworks & assumptions' },
  { icon: '💼', label: 'Portfolio updates', sublabel: 'Position changes and thesis reviews' },
  { icon: '💬', label: 'Weekly discussion', sublabel: 'Market commentary and ideas pipeline' },
  { icon: '🎙️', label: 'Expert & management interviews', sublabel: 'Direct access to primary research' },
];

export default function SubscribePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!session) {
      router.push('/signup');
      return;
    }

    if (session.user.isSubscribed) {
      router.push('/members');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Membership — Atlantic Walk Research</title>
        <meta name="description" content="Join Atlantic Walk Research for early access to deep fundamental research, DCF models, and original valuation work." />
      </Head>

      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-200 transition">
              ← Atlantic Walk Research
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-white">Research Membership</h1>
            <p className="text-gray-400 mt-2">Deep-dive analysis. Original models. No noise.</p>
          </div>

          <div className="bg-neutral-900/80 backdrop-blur border border-gray-700 rounded-xl overflow-hidden shadow-xl">
            {/* Price header */}
            <div className="border-b border-gray-800 px-8 py-6 text-center">
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-bold text-white">$10</span>
                <span className="text-gray-400 text-lg mb-1.5">/month</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">Cancel anytime · Billed monthly</p>
            </div>

            {/* Features */}
            <div className="px-8 py-6 space-y-4">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{f.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{f.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{f.sublabel}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-8 pb-8">
              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-2 mb-4">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition text-base"
              >
                {loading
                  ? 'Redirecting to checkout…'
                  : session
                  ? 'Subscribe now — $10/month'
                  : 'Get started — $10/month'}
              </button>

              {!session && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  Already a member?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 transition">
                    Sign in
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Free tier note */}
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              Free newsletter subscribers continue to receive public research.{' '}
              <Link href="/" className="text-gray-400 hover:text-gray-200 transition">
                Learn more
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
