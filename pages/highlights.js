import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { reportsMeta } from '../data/reportsMeta';
import NewsletterModal from '../components/Newsletter';
import SiteNav from '../components/SiteNav';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function HighlightsPage({ reports }) {
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [newsletterShown, setNewsletterShown] = useState(false);

  useEffect(() => {
    if (newsletterShown) return;
    const alreadySubscribed =
      typeof window !== 'undefined' &&
      localStorage.getItem('awr_newsletter_subscribed') === 'true';
    if (alreadySubscribed) return;
    const t = setTimeout(() => { setShowNewsletter(true); setNewsletterShown(true); }, 5000);
    return () => clearTimeout(t);
  }, [newsletterShown]);

  return (
    <>
      <Head>
        <title>Highlights | Atlantic Walk Research</title>
        <meta
          name="description"
          content="Latest research highlights from Atlantic Walk Research — new reports, model updates, and special situations."
        />
      </Head>

      <SiteNav onSubscribeClick={() => setShowNewsletter(true)} />

      <main className="max-w-3xl mx-auto px-4 pt-20 md:pt-28 pb-24">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Highlights</h1>
          <p className="text-gray-300 text-base mt-1">
            Every report and update, newest first.
          </p>
        </div>

        <div className="bg-neutral-900 bg-opacity-50 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
          {reports.length === 0 && (
            <p className="text-gray-500 px-5 py-8 text-sm">No reports yet.</p>
          )}
          {reports.map((r, i) => (
            <div
              key={r.slug}
              className="border-b border-gray-800 last:border-b-0 px-5 py-4 flex items-start justify-between gap-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {r.ticker && (
                    <span className="text-xs text-gray-300 border border-gray-600 rounded px-1.5 py-0.5 leading-none shrink-0">
                      {r.ticker.split(':').pop().trim()}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{fmtDate(r.date)}</span>
                  {i === 0 && (
                    <span className="text-xs font-semibold text-emerald-400 border border-emerald-800/50 rounded px-1.5 py-0.5 leading-none">
                      Latest
                    </span>
                  )}
                </div>
                <Link
                  href={`/research/${r.slug}`}
                  className="text-gray-100 text-base font-medium leading-snug hover:text-white transition"
                >
                  {r.title}
                </Link>
                {r.description && (
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{r.description}</p>
                )}
              </div>

              <Link
                href={`/research/${r.slug}`}
                className="shrink-0 text-sm text-blue-400 hover:text-blue-300 transition font-medium mt-1"
              >
                View →
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-gray-800 rounded-xl px-6 py-5 bg-neutral-900/50">
          <div>
            <p className="text-gray-100 font-semibold text-base">Get notified when new research drops</p>
            <p className="text-gray-400 text-sm mt-0.5">New reports and updates — no spam, unsubscribe anytime.</p>
          </div>
          <button
            onClick={() => setShowNewsletter(true)}
            className="shrink-0 text-gray-100 text-sm font-semibold px-6 py-3 rounded-lg transition border border-gray-700 hover:bg-white/5 hover:border-gray-600"
          >
            Subscribe
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          Atlantic Walk Research · Independent Equity Research
        </p>
      </main>

      <NewsletterModal
        isOpen={showNewsletter}
        onClose={() => setShowNewsletter(false)}
      />
    </>
  );
}

export async function getStaticProps() {
  const reports = [...reportsMeta].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );
  return { props: { reports } };
}
