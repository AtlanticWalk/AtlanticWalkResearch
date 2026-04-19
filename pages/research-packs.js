import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// ── Stock data ────────────────────────────────────────────────────────────────
// Add new stocks here. Reports sorted newest-first within each stock.
// Stocks are sorted by lastUpdated descending automatically.
const STOCKS = [
  {
    ticker: 'OUST',
    name: 'Ouster, Inc.',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/ouster.com',
    lastUpdated: '2026-03-03',
    reports: [
      { title: 'Ouster, Inc. — FY25 Earnings Update', date: '2026-03-03', url: '/research/OUSTEARNINGSFY25', external: false },
      { title: 'Ouster, Inc. — From LiDAR to Full-Stack Perception', date: '2026-02-23', url: '/research/OUSTERREPORT', external: false },
    ],
    model: { available: false },
    primaryResearch: { available: false },
  },
  {
    ticker: 'BFLY',
    name: 'Butterfly Network',
    exchange: 'NYSE',
    logo: 'https://logo.clearbit.com/butterflynetwork.com',
    lastUpdated: '2026-02-28',
    reports: [
      { title: 'Butterfly Network — FY25 Earnings Update', date: '2026-02-28', url: '/research/BFLYEARNINGSFY25', external: false },
      { title: 'Butterfly Network — Update Following J.P. Morgan Healthcare Presentation', date: '2026-01-15', url: '/research/BFLYJPMHEALTHCARE', external: false },
      { title: 'Butterfly Network — From Device Vendor to Semiconductor Imaging Platform', date: '2025-12-11', url: '/research/BFLYREPORT', external: false },
    ],
    model: { available: false },
    primaryResearch: { available: false },
  },
  {
    ticker: 'RARE',
    name: 'Ultragenyx Pharmaceuticals',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/ultragenyx.com',
    lastUpdated: '2026-01-21',
    reports: [
      { title: 'Ultragenyx Pharmaceuticals — From Peak Burn To Profitability', date: '2026-01-21', url: '/research/RAREREPORT', external: false },
    ],
    model: { available: false },
    primaryResearch: { available: false },
  },
  {
    ticker: 'AVDL',
    name: 'Avadel Pharmaceuticals',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/avadel.com',
    lastUpdated: '2025-11-21',
    reports: [
      { title: 'Avadel Update — Jazz Is Now The Natural Final Buyer', date: '2025-11-21', url: '/research/Avadel-Update', external: false },
      { title: 'Avadel — Why The Alkermes Deal May Collapse And A Bidding War Could Follow', date: '2025-10-25', url: '/research/avadel-addendum', external: false },
      { title: 'Avadel — Mispriced Leader In Once-Nightly Sleep Therapies', date: '2025-09-21', url: 'https://seekingalpha.com/article/4826812-avadel-mispriced-leader-in-once-nightly-sleep-therapies', external: true, source: 'Seeking Alpha' },
    ],
    model: { available: true, url: '/models/AVDLMODEL.xlsx' },
    primaryResearch: { available: false },
  },
  {
    ticker: 'ACMR',
    name: 'ACM Research',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/acmresearch.com',
    lastUpdated: '2025-06-24',
    reports: [
      { title: 'ACM Research — Margin Expansion And Product Ramp Drive Deep Undervaluation', date: '2025-06-24', url: 'https://seekingalpha.com/article/4799807-acm-research-margin-expansion-and-product-ramp-drive-deep-undervaluation', external: true, source: 'Seeking Alpha' },
    ],
    model: { available: true, url: '/models/ACMRMODEL.xlsx' },
    primaryResearch: { available: false },
  },
  {
    ticker: 'MP',
    name: 'MP Materials',
    exchange: 'NYSE',
    logo: 'https://logo.clearbit.com/mpmaterials.com',
    lastUpdated: '2025-05-26',
    reports: [
      { title: 'MP Materials — Onshoring The Rare Earth Supply Chain', date: '2025-05-26', url: 'https://seekingalpha.com/article/4789889-mp-materials-onshoring-rare-earth-supply-chain', external: true, source: 'Seeking Alpha' },
    ],
    model: { available: true, url: '/models/MPMODEL.xlsx' },
    primaryResearch: { available: false },
  },
  {
    ticker: 'NBIS',
    name: 'Nebius Group',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/nebius.com',
    lastUpdated: '2024-12-29',
    reports: [
      { title: 'Nebius Group — AI Infrastructure at a Discount', date: '2024-12-29', url: '/reports/nbis-report.pdf', external: false },
    ],
    model: { available: true, url: '/models/NBISMODEL.xlsx' },
    primaryResearch: { available: false },
  },
  {
    ticker: 'LRCX',
    name: 'Lam Research',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/lamresearch.com',
    lastUpdated: '2024-11-30',
    reports: [
      { title: 'Lam Research — Deep Value in Semiconductor Equipment', date: '2024-11-30', url: '/reports/lrcx-report.pdf', external: false },
    ],
    model: { available: true, url: '/models/LRCXMODEL.xlsx' },
    primaryResearch: { available: false },
  },
  {
    ticker: 'AMAT',
    name: 'Applied Materials',
    exchange: 'NASDAQ',
    logo: 'https://logo.clearbit.com/appliedmaterials.com',
    lastUpdated: '2024-11-21',
    reports: [
      { title: 'Applied Materials — Deep Value in Semiconductor Equipment', date: '2024-11-21', url: '/reports/amat-report.pdf', external: false },
    ],
    model: { available: true, url: '/models/AMAT_MODEL_FULL.xlsx' },
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

function LogoCell({ stock }) {
  const [imgOk, setImgOk] = useState(true);
  const initials = stock.ticker.slice(0, 2);
  const colors = {
    A: '#3b5bdb', B: '#0ca678', C: '#e8590c', D: '#7048e8',
    E: '#1864ab', F: '#5c940d', G: '#862e9c', H: '#c92a2a',
    I: '#0077b6', J: '#e67700', K: '#2f9e44', L: '#1971c2',
    M: '#9c36b5', N: '#087f5b', O: '#d6336c', P: '#e67700',
    Q: '#364fc7', R: '#5c940d', S: '#1864ab', T: '#c92a2a',
    U: '#2b8a3e', V: '#5f3dc4', W: '#1971c2', X: '#e67700',
    Y: '#0077b6', Z: '#862e9c',
  };
  const bg = colors[stock.ticker[0]] || '#374151';

  if (imgOk && stock.logo) {
    return (
      <img
        src={stock.logo}
        alt={stock.name}
        className="w-8 h-8 rounded-lg object-contain bg-white p-0.5"
        onError={() => setImgOk(false)}
      />
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: bg }}
    >
      {initials}
    </div>
  );
}

function StockRow({ stock }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      {/* Row header — click to expand */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition text-left"
      >
        <LogoCell stock={stock} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-sm">{stock.ticker}</span>
            <span className="text-xs text-gray-500 border border-gray-700 rounded px-1.5 py-0.5">
              {stock.exchange}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-0.5 truncate">{stock.name}</p>
        </div>

        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-xs text-gray-500">Last updated</p>
          <p className="text-gray-300 text-xs font-medium">{fmtDate(stock.lastUpdated)}</p>
        </div>

        {/* Chevron */}
        <svg
          className={`shrink-0 w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable content */}
      {open && (
        <div className="border-t border-gray-800 bg-neutral-950/60 px-5 py-5 space-y-5">

          {/* Reports */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📄</span>
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Reports & Updates</h4>
            </div>
            <div className="space-y-2">
              {stock.reports.map((r, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-gray-800/60 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 text-sm leading-snug">{r.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {fmtDate(r.date)}
                      {r.external && r.source && (
                        <span className="ml-2 text-gray-600">· {r.source}</span>
                      )}
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

          {/* Valuation Model */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📊</span>
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Valuation Model</h4>
            </div>
            {stock.model.available ? (
              <a
                href={stock.model.url}
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
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Primary Research</h4>
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResearchPacksPage() {
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
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 pt-28 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Research Packs</h1>
          <p className="text-gray-400 text-sm mt-1">
            Every stock we cover — reports, models, and primary research in one place.
          </p>
        </div>

        {/* Stock list */}
        <div className="space-y-3">
          {STOCKS.map((stock) => (
            <StockRow key={stock.ticker} stock={stock} />
          ))}
        </div>

        <p className="text-center text-gray-700 text-xs mt-14">
          Atlantic Walk Research · Independent Equity Research
        </p>
      </main>
    </>
  );
}
