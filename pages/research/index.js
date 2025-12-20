// pages/api/tracker.js

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

// Helper: last close ON or BEFORE target date (fixes weekly timestamp mismatches)
function getCloseOnOrBefore(series, targetDate) {
  const t = new Date(targetDate);
  for (let i = series.length - 1; i >= 0; i--) {
    if (new Date(series[i].date) <= t) return series[i].close;
  }
  return null;
}

// Pure function you can reuse anywhere (API route, getStaticProps, etc.)
export async function buildTrackerData({ months = 12 } = {}) {
  // Find earliest valuation date
  const earliestDate = PICKS.reduce(
    (min, p) => (new Date(p.date) < new Date(min) ? p.date : min),
    PICKS[0].date
  );

  const endDate = new Date().toISOString().slice(0, 10);

  // Fetch Yahoo Finance weekly data
  const fetchYahooData = async (symbol, startDate) => {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?period1=${Math.floor(new Date(startDate).getTime() / 1000)}&period2=${Math.floor(
      new Date(endDate).getTime() / 1000
    )}&interval=1wk`;

    try {
      const resData = await fetch(url, {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
        },
      });

      const json = await resData.json();
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
  }

  // Align everything to S&P weekly dates
  const aligned = sp500.map((sp) => {
    const entry = { date: sp.date };
    entry.sp500 = ((sp.close / sp500[0].close) - 1) * 100;

    let blendSum = 0;
    let count = 0;

    for (const stock of stocks) {
      const { name, date: pickDate, data: series } = stock;

      if (new Date(sp.date) < new Date(pickDate)) {
        entry[name] = null;
        continue;
      }

      // Base close = first close ON/AFTER pick date
      const base = series.find((d) => new Date(d.date) >= new Date(pickDate))?.close;

      // Now close = last close ON/BEFORE the S&P date (handles week alignment)
      const now = getCloseOnOrBefore(series, sp.date);

      if (base != null && now != null) {
        entry[name] = ((now / base) - 1) * 100;
        blendSum += entry[name];
        count++;
      } else {
        entry[name] = null;
      }
    }

    entry.portfolio = count > 0 ? blendSum / count : null;
    return entry;
  });

  // Keep only last N months
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  return aligned.filter((d) => new Date(d.date) >= cutoff);
}

export default async function handler(req, res) {
  try {
    const monthsParam = parseInt(req?.query?.months ?? "12", 10);
    const months = Number.isFinite(monthsParam) ? monthsParam : 12;

    const data = await buildTrackerData({ months });

    // Guarded (so it won’t crash if imported somewhere incorrectly)
    if (res?.setHeader) res.setHeader("Cache-Control", "no-store");
    if (res?.status && res?.json) return res.status(200).json(data);

    // Fallback if someone called this without a Next API res object
    return data;
  } catch (err) {
    console.error("Tracker API fatal error:", err);

    if (res?.status && res?.json) {
      return res.status(500).json({ error: "Failed to fetch tracker data" });
    }

    throw err;
  }
}
