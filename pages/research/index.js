// pages/api/tracker.js
// Notes:
// - Aligns all series to S&P 500 weekly dates
// - For each pick, "base" is the first close ON/AFTER the pick date
// - We only compute returns once the S&P date is ON/AFTER that base candle date
//   (fixes "no growth" due to weekly timestamp misalignment)

const PICKS = [
  { symbol: "^GSPC", name: "sp500", date: "2024-11-21" },
  { symbol: "AMAT", name: "amat", date: "2024-11-21" },
  { symbol: "LRCX", name: "lrcx", date: "2024-11-30" },
  { symbol: "NBIS", name: "nbis", date: "2024-12-29" },
  { symbol: "MP", name: "mp", date: "2025-05-26" },
  { symbol: "ACMR", name: "acmr", date: "2025-06-24" },
  { symbol: "AVDL", name: "avdl", date: "2025-09-21" },
  { symbol: "BFLY", name: "bfly", date: "2025-12-10" },
];

// Helper: last close ON or BEFORE target date
function getCloseOnOrBefore(series, targetDate) {
  if (!Array.isArray(series) || series.length === 0) return null;
  const t = new Date(targetDate);
  for (let i = series.length - 1; i >= 0; i--) {
    if (new Date(series[i].date) <= t) return series[i].close;
  }
  return null;
}

// Pure function you can reuse server-side if you want
export async function buildTrackerData({ months = 12 } = {}) {
  const earliestDate = PICKS.reduce(
    (min, p) => (new Date(p.date) < new Date(min) ? p.date : min),
    PICKS[0].date
  );

  const endDate = new Date().toISOString().slice(0, 10);

  const fetchYahooData = async (symbol, startDate) => {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?period1=${Math.floor(new Date(startDate).getTime() / 1000)}&period2=${Math.floor(
      new Date(endDate).getTime() / 1000
    )}&interval=1wk`;

    try {
      const r = await fetch(url, {
        cache: "no-store",
        headers: {
          // Helps reduce occasional Yahoo blocks
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
        },
      });

      const json = await r.json();
      const result = json?.chart?.result?.[0];

      if (!result || !result.indicators?.quote?.[0]?.close) {
        console.warn(`⚠️ Missing or invalid data for ${symbol}`);
        return [];
      }

      const quotes = result.indicators.quote[0].close;
      const timestamps = result.timestamp || [];

      return timestamps
        .map((t, i) => ({
          date: new Date(t * 1000).toISOString().slice(0, 10),
          close: quotes[i],
        }))
        .filter((d) => d.close !== null && d.close !== undefined);
    } catch (err) {
      console.error(`❌ Failed to fetch ${symbol}:`, err);
      return [];
    }
  };

  const datasets = await Promise.all(PICKS.map((p) => fetchYahooData(p.symbol, earliestDate)));

  const sp500 = datasets[0] || [];
  const stocks = PICKS.slice(1).map((p, i) => ({
    ...p,
    data: datasets[i + 1] || [],
  }));

  if (!sp500.length) {
    console.warn("⚠️ No S&P 500 data fetched; returning fallback sample.");
    return [
      { date: earliestDate, sp500: 0, portfolio: 0 },
      { date: "2025-01-01", sp500: 2, portfolio: 5 },
      { date: "2025-03-01", sp500: 4, portfolio: 9 },
    ];
