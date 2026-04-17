import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

// Content sections — add real content here over time
const SECTIONS = [
  {
    id: 'reports',
    icon: '📄',
    title: 'Research Reports',
    description: 'Full-length deep-dives with complete investment theses.',
    badge: 'Early Access',
    badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    items: [],
    emptyLabel: 'New reports publish here first — before they go public.',
  },
  {
    id: 'models',
    icon: '📊',
    title: 'Valuation Models',
    description: 'Downloadable DCF models and scenario frameworks.',
    badge: 'Members Only',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    items: [],
    emptyLabel: 'Excel models with full assumptions and scenario analysis.',
  },
  {
    id: 'portfolio',
    icon: '💼',
    title: 'Portfolio Updates',
    description: 'Position changes, sizing decisions, and thesis reviews.',
    badge: 'Members Only',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    items: [],
    emptyLabel: 'Transparent updates on the model portfolio.',
  },
  {
    id: 'discussion',
    icon: '💬',
    title: 'Weekly Discussion',
    description: 'Market commentary, ideas pipeline, and sector notes.',
    badge: 'Coming Soon',
    badgeColor: 'bg-gray-500/10 text-gray-400 border border-gray-600/20',
    items: [],
    emptyLabel: "Weekly notes on what's in focus and why.",
  },
  {
    id: 'interviews',
    icon: '🎙️',
    title: 'Expert & Management Interviews',
    description: 'Primary research conversations with executives and analysts.',
    badge: 'Coming Soon',
    badgeColor: 'bg-gray-500/10 text-gray-400 border border-gray-600/20',
    items: [],
    emptyLabel: "Direct primary research — the edge most investors don't have.",
  },
];

function SectionCard({ section }) {
  return (
    <div className="bg-neutral-900/80 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-800 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{section.icon}</span>
          <div>
            <h2 className="text-white font-semibold">{section.title}</h2>
            <p className="text-gray-500 text-xs mt-0.5">{section.description}</p>
          </div>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${section.badgeColor}`}>
          {section.badge}
        </span>
      </div>

      <div className="px-6 py-8 text-center">
        {section.items.length === 0 ? (
          <p className="text-gray-500 text-sm italic">{section.emptyLabel}</p>
        ) : (
          <ul className="space-y-3">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                <span className="text-gray-300 text-sm">{item.title}</span>
                {item.href && (
                  <a href={item.href} className="text-blue-400 hover:text-blue-300 text-xs transition">
                    View →
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ChangePasswordForm({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirm) return setError('Passwords do not match.');
    if (newPassword.length < 8) return setError('New password must be at least 8 characters.');

    setLoading(true);
    const res = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(onClose, 2000);
    } else {
      setError(data.error || 'Something went wrong.');
    }
  };

  return (
    <div className="bg-neutral-900/80 border border-gray-800 rounded-xl p-6 mt-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold">Change password</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition text-sm">✕</button>
      </div>

      {success ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <span>✓</span> Password updated successfully.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-neutral-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="At least 8 characters"
              className="w-full bg-neutral-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-neutral-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function MembersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [billingLoading, setBillingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const isWelcome = router.query.welcome === 'true';

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  if (!session) {
    if (typeof window !== 'undefined') router.replace('/login');
    return null;
  }

  if (!session.user.isSubscribed) {
    if (typeof window !== 'undefined') router.replace('/subscribe');
    return null;
  }

  const handleManageBilling = async () => {
    setBillingLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();
    setBillingLoading(false);
    if (data.url) window.location.href = data.url;
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();
    setCancelLoading(false);
    if (data.url) window.location.href = data.url;
  };

  const isComplimentary = session.user.isComplimentary;

  return (
    <>
      <Head>
        <title>Members — Atlantic Walk Research</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Welcome banner */}
        {isWelcome && (
          <div className="mb-6 bg-emerald-900/30 border border-emerald-700/40 rounded-xl px-5 py-4 flex items-center gap-3">
            <span className="text-emerald-400 text-lg">✓</span>
            <div>
              <p className="text-emerald-300 font-medium text-sm">Welcome to Atlantic Walk Research</p>
              <p className="text-emerald-500 text-xs mt-0.5">Your membership is active. All content below is unlocked.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition">
              ← Home
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-white">Members</h1>
            <p className="text-gray-400 text-sm mt-1">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-white/5 transition"
            >
              Change password
            </button>
            {!isComplimentary && (
              <button
                onClick={handleManageBilling}
                disabled={billingLoading}
                className="text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-white/5 transition disabled:opacity-50"
              >
                {billingLoading ? 'Loading…' : 'Manage billing'}
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-400 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-white/5 transition"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Change password form (inline toggle) */}
        {showChangePassword && (
          <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
        )}

        {/* Membership status */}
        <div className="mb-8 flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span className="text-gray-400 text-sm">
              {isComplimentary ? 'Complimentary membership' : 'Active membership · $10.99/month'}
            </span>
          </div>
          {!isComplimentary && (
            <button
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
              className="text-red-500/70 hover:text-red-400 text-xs transition disabled:opacity-50"
            >
              {cancelLoading ? 'Loading…' : 'Cancel subscription'}
            </button>
          )}
        </div>

        {/* Content sections */}
        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-10">
          Atlantic Walk Research · Independent Equity Research
        </p>
      </div>
    </>
  );
}
