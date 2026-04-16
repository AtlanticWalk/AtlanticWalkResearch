import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in
  if (session) {
    if (typeof window !== 'undefined') {
      router.replace(session.user.isSubscribed ? '/members' : '/subscribe');
    }
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password.');
    } else {
      router.push(router.query.callbackUrl || '/members');
    }
  };

  return (
    <>
      <Head>
        <title>Login — Atlantic Walk Research</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Logo / Back link */}
          <div className="text-center mb-8">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-200 transition">
              ← Atlantic Walk Research
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-white">Member Login</h1>
            <p className="text-gray-400 text-sm mt-1">Access your research portal</p>
          </div>

          <div className="bg-neutral-900/80 backdrop-blur border border-gray-800 rounded-xl p-8 shadow-xl">
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
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
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 border-t border-gray-800 pt-5 text-center space-y-2">
              <p className="text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition">
                  Create one
                </Link>
              </p>
              <p className="text-sm text-gray-400">
                Not a member?{' '}
                <Link href="/subscribe" className="text-blue-400 hover:text-blue-300 transition">
                  See membership options
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
