import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      return setError('Passwords do not match.');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } else {
      setError(data.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password — Atlantic Walk Research</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-200 transition">
              ← Back to login
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-white">Set new password</h1>
            <p className="text-gray-400 text-sm mt-1">Choose a new password for your account.</p>
          </div>

          <div className="bg-neutral-900/80 backdrop-blur border border-gray-800 rounded-xl p-8 shadow-xl">
            {success ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-400 text-xl">✓</span>
                </div>
                <p className="text-white font-medium mb-2">Password updated</p>
                <p className="text-gray-400 text-sm">Redirecting you to login…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="w-full bg-neutral-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
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
                  disabled={loading || !token}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
                >
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
