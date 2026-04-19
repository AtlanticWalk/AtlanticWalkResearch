import { useState, useEffect } from 'react';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import { reportsMeta } from '../data/reportsMeta';
import NewsletterModal from '../components/Newsletter';

// ── Static stock metadata ─────────────────────────────────────────────────────
// Only put things here that can't be inferred from files:
//   - company name + exchange
//   - external reports (Seeking Alpha etc.) that aren't in reportsMeta
//   - primary research links when available
//
// To add a new stock: add an entry here, add reports to reportsMeta.js,
// and drop the model file in public/models/ named {TICKER}MODEL.xlsx.

const STOCK_META = [
  {
    ticker: 'OUST',
    name: 'Ouster, Inc.',
    exchange: 'NASDAQ',
    externalReports: [],
    primaryResearch: { available: false },
  },
  {
    ticker: 'BFLY',
    name: 'Butterfly Network',
    exchange: 'NYSE',
    externalReports: [],
    primaryResearch: { available: false },
  },
  {
    ticker: 'RARE',
    name: 'Ultragenyx Pharmaceuticals',
    exchange: 'NASDAQ',
    externalReports: [],
    primaryResearch: { available: false },
  },
  {
    ticker: 'AVDL',
    name: 'Avadel Pharmaceuticals',
    exchange: 'NASDAQ',
    externalReports: [
      {
        title: 'Avadel — Mispriced Leader In Once-Nightly Sleep Therapies',
        date: '2025-09-21',
        url: 'https://seekingalpha.com/article/4826812-avadel-mispriced-leader-in-once-nightly-sleep-therapies',
        source: 'Seeking Alpha',
      },
    ],
    primaryResearch: { available: false },
  },
  {
    ticker: 'ACMR',
    name: 'ACM Research',
    exchange: 'NASDAQ',
    externalReports: [
      {
        title: 'ACM Research — Margin Expansion And Product Ramp Drive Deep Undervaluation',
        date: '2025-06-24',
        url: 'https://seekingalpha.com/article/4799807-acm-research-margin-expansion-and-product-ramp-drive-deep-undervaluation',
        source: 'Seeking Alpha',
      },
    ],
    primaryResearch: { available: false },
  },
  {
    ticker: 'MP',
    name: 'MP Materials',
    exchange: 'NYSE',
    externalReports: [
      {
        title: 'MP Materials — Onshoring The Rare Earth Supply Chain',
        date: '2025-05-26',
        url: 'https://seekingalpha.com/article/4789889-mp-materials-onshoring-rare-earth-supply-chain',
        source: 'Seeking Alpha',
      },
    ],
    primaryResearch: { available: false },
  },
  {
    ticker: 'NBIS',
    name: 'Nebius Group',
    exchange: 'NASDAQ',
    externalReports: [],
    primaryResearch: { available: false },
  },
  {
    ticker: 'LRCX',
    name: 'Lam Research',
    exchange: 'NASDAQ',
    externalReports: [],
    primaryResearch: { available: false },
  },
  {
    ticker: 'AMAT',
    name: 'Applied Materials',
    exchange: 'NASDAQ',
    externalReports: [],
    primaryResearch: { available: false },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

const LOGO_COLORS = {
  A: '#3b5bdb', B: '#0ca678', C: '#e8590c', D: '#7048e8',
  E: '#1864ab', F: '#5c940d', G: '#862e9c', H: '#c92a2a',
  I: '#0077b6', J: '#e67700', K: '#2f9e44', L: '#1971c2',
  M: '#9c36b5', N: '#087f5b', O: '#d6336c', P: '#e67700',
  Q: '#364fc7', R: '#5c940d', S: '#1864ab', T: '#c92a2a',
  U: '#2b8a3e', V: '#5f3dc4', W: '#1971c2', X: '#e67700',
  Y: '#0077b6', Z: '#862e9c',
};

function LogoCell({ ticker }) {
  const [imgOk, setImgOk] = useState(true);
  const bg = LOGO_COLORS[ticker[0]] || '#374151';

  if (imgOk) {
    return (
      <div className="w-9 h-9 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0 p-0.5">
        <img
          src={`/logos/${ticker}.png`}
          alt={ticker}
          className="w-full h-full object-contain"
          onError={() => setImgOk(false)}
        />
      </div>
    );
  }
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: bg }}
    >
      {ticker.slice(0, 2)}
    </div>
  );
}

// ── Stock row ─────────────────────────────────────────────────────────────────

function StockRow({ stock }) {
  const [open, setOpen] = useState(false);
  const hasModel = !!stock.modelUrl;

  return (
    <div className="bg-neutral-900 bg-opacity-50 border border-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.04] transition-colors text-left"
      >
        <LogoCell ticker={stock.ticker} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-sm tracking-wide">{stock.ticker}</span>
            <span className="text-xs text-gray-500 border border-gray-700 rounded px-1.5 py-0.5 leading-none">
              {stock.exchange}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-0.5 truncate">{stock.name}</p>
        </div>

        <div className="text-right shrink-0 hidden sm:block mr-1">
          <p className="text-xs text-gray-600">Last updated</p>
          <p className="text-gray-400 text-xs font-medium mt-0.5">{fmtDate(stock.lastUpdated)}</p>
        </div>

        <svg
          className={`shrink-0 w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-800 bg-black/30 px-5 py-5 space-y-5">

          {/* Reports */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📄</span>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reports & Updates</h4>
            </div>
            <div className="space-y-0.5">
              {stock.reports.map((r, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-800/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 text-sm leading-snug">{r.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {fmtDate(r.date)}
                      {r.source && <span className="ml-2 text-gray-600">· {r.source}</span>}
                    </p>
                  </div>
                  <a
                    href={r.url}
                    {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="shrink-0 text-xs text-blue-400 hover:text-blue-300 transition font-medium mt-0.5"
                  >
                    {r.external ? 'View ↗' : 'View →'}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Model */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📊</span>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Valuation Model</h4>
            </div>
            {hasModel ? (
              <a
                href={stock.modelUrl}
                download
                className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition font-medium border border-emerald-800/50 rounded-lg px-3 py-1.5 hover:bg-emerald-900/20"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Excel model
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 border border-gray-800 rounded-lg px-3 py-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Not yet available
              </span>
            )}
          </div>

          {/* Primary Research */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">🎙️</span>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Primary Research</h4>
            </div>
            {stock.primaryResearch.available ? (
              <a
                href={stock.primaryResearch.url}
                className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition font-medium border border-blue-800/50 rounded-lg px-3 py-1.5"
              >
                View interview →
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 border border-gray-800 rounded-lg px-3 py-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Not yet available
              </span>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResearchPacksPage({ stocks }) {
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [newsletterShown, setNewsletterShown] = useState(false);

  // Auto-trigger newsletter popup after 5s (same behaviour as research/highlights pages)
  useEffect(() => {
    if (newsletterShown) return;
    const alreadySubscribed =
      typeof window !== 'undefined' &&
      localStorage.getItem('awr_newsletter_subscribed') === 'true';
    if (alreadySubscribed) return;

    const timer = setTimeout(() => {
      setShowNewsletter(true);
      setNewsletterShown(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [newsletterShown]);

  return (
    <>
      <Head>
        <title>Research Packs | Atlantic Walk Research</title>
        <meta
          name="description"
          content="Browse all stocks covered by Atlantic Walk Research. Each pack includes full research reports, valuation models, and primary research."
        />
      </Head>

      {/* Nav */}
      <nav className="fixed top-0 w-full bg-black/60 backdrop-blur-sm border-b border-gray-800 z-50 py-4 text-sm font-semibold text-gray-300 flex items-center px-6">
        <div className="flex-1 flex justify-center gap-6 items-center">
          {[
            ['Home', '/'],
            ['Highlights', '/highlights'],
            ['Research Packs', '/research-packs'],
            ['Performance', '/performance'],
            ['About', '/about'],
            ['Contact', '/contact'],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className={`hover:text-white transition ${href === '/research-packs' ? 'text-white' : ''}`}
            >
              {label}
            </a>
          ))}
          <button
            onClick={() => setShowNewsletter(true)}
            className="ml-2 text-gray-100 text-sm font-semibold px-4 py-1.5 rounded-lg transition border border-gray-700 hover:bg-white/5 hover:border-gray-600"
          >
            Subscribe
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 pt-28 pb-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Research Packs</h1>
          <p className="text-gray-400 text-sm mt-1">
            Every stock we cover — reports, models, and primary research in one place.
          </p>
        </div>

        {/* Stock list */}
        <div className="space-y-3">
          {stocks.map((stock) => (
            <StockRow key={stock.ticker} stock={stock} />
          ))}
        </div>

        {/* Inline subscribe CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-gray-800 rounded-xl px-6 py-5 bg-neutral-900/50">
          <div>
            <p className="text-gray-100 font-medium text-sm">Want to be first to see new research?</p>
            <p className="text-gray-500 text-xs mt-0.5">Subscribe for research alerts — no spam, unsubscribe anytime.</p>
          </div>
          <button
            onClick={() => setShowNewsletter(true)}
            className="shrink-0 text-gray-100 text-sm font-semibold px-6 py-3 rounded-lg transition border border-gray-700 hover:bg-white/5 hover:border-gray-600"
          >
            Subscribe
          </button>
        </div>

        <p className="text-center text-gray-700 text-xs mt-10">
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

// ── Build-time data ───────────────────────────────────────────────────────────

export async function getStaticProps() {
  const internalByTicker = {};
  for (const r of reportsMeta) {
    const ticker = r.ticker?.split(':').pop()?.trim();
    if (!ticker) continue;
    if (!internalByTicker[ticker]) internalByTicker[ticker] = [];
    internalByTicker[ticker].push({
      title: r.title,
      date: r.date,
      url: `/research/${r.slug}`,
      external: false,
      source: null,
    });
  }

  const modelsDir = path.join(process.cwd(), 'public', 'models');
  const modelsByTicker = {};
  if (fs.existsSync(modelsDir)) {
    const files = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.xlsx'));
    for (const file of files) {
      const ticker = file.replace('.xlsx', '').replace(/_?MODEL.*/i, '').toUpperCase();
      if (ticker) modelsByTicker[ticker] = `/models/${file}`;
    }
  }

  const stocks = STOCK_META.map((meta) => {
    const internal = internalByTicker[meta.ticker] || [];
    const external = (meta.externalReports || []).map((r) => ({ ...r, external: true }));
    const reports = [...internal, ...external].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    );
    const lastUpdated = reports.length > 0 ? reports[0].date : null;
    const modelUrl = modelsByTicker[meta.ticker] || null;

    return {
      ticker: meta.ticker,
      name: meta.name,
      exchange: meta.exchange,
      lastUpdated,
      reports,
      modelUrl,
      primaryResearch: meta.primaryResearch,
    };
  });

  stocks.sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0));

  return { props: { stocks } };
}
