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

// Helper: last close ON or BEFORE target date (robust for mismatched calendars)
function getCloseOnOrBefore(series, targetDate) {
  const t = new Date(targetDate);
  for (let i = series.length - 1; i >= 0; i--) {
    if (new Date(series[i].date) <= t) return series[i].close;
  }
  return null;
}

// Helper: convert daily series -> weekly series using the LAST trading day in each week
// Week is keyed by Monday (UTC) to stay stable across environments.
function dailyToWeeklyLastClose(dailySeries) {
  if (!Array.isArray(dailySeries) || dailySeries.length === 0) return [];

  // Ensure ascending by date
  const sorted = [...dailySeries].sort((a, b) => new Date(a.date) - new Date(b.date));

  const byWeek = new Map();

  for (const pt of sorted) {
    const d = new Date(pt.date);
    // Compute Monday of that week (UTC)
    const dow = (d.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6
    const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow));
    const key = monday.toISOString().slice(0, 10);

    // Keep the last point seen in that week (sorted ascending => overwrite gives last)
    byWeek.set(key, pt);
  }

  // Return weekly points sorted by date
  return Array.from(byWeek.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Pure function you can reuse anywhere (API route, getStaticProps, etc.)
export async function buildTrackerData({ months = 12 } = {}) {
  // Find earliest valuation date
  const earliestDate = PICKS.reduce(
    (min, p) => (new Date(p.date) < new Date(min) ? p.date : min),
    PICKS[0].date
  );

  const endDate = new Date().toISOString().slice(0, 10);

  // Fetch Yahoo Finance DAILY data (we’ll downsample to weekly ourselves)
  const fetchYahooDaily = async (symbol, startDate) => {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?period1=${Math.floor(new Date(startDate).getTime() / 1000)}&period2=${Math.floor(
      new Date(endDate).getTime() / 1000
    )}&interval=1d`;

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

  // Fetch all DAILY datasets concurrently
  const dailyDatasets = await Promise.all(PICKS.map((p) => fetchYahooDaily(p.symbol, earliestDate)));

  const sp500Daily = dailyDatasets[0] || [];
  const stocksDaily = PICKS.slice(1).map((p, i) => ({
    ...p,
    dataDaily: dailyDatasets[i + 1] || [],
  }));

  if (!sp500Daily.length) {
    console.warn("⚠️ No S&P 500 data fetched; returning fallback sample.");
    return [
      { date: earliestDate, sp500: 0, portfolio: 0 },
      { date: "2025-01-01", sp500: 2, portfolio: 5 },
      { date: "2025-03-01", sp500: 4, portfolio: 9 },
    ];
  }

  // Build WEEKLY anchor dates from S&P DAILY (last trading day each week)
  const sp500Weekly = dailyToWeeklyLastClose(sp500Daily);

  // Base for S&P = first weekly close in our window
  const spBase = sp500Weekly[0]?.close;

  // Align everything to S&P weekly dates, but compute using DAILY closes
  const aligned = sp500Weekly.map((spW) => {
    const entry = { date: spW.date };

    entry.sp500 = spBase ? ((spW.close / spBase) - 1) * 100 : 0;

    let blendSum = 0;
    let count = 0;

    for (const stock of stocksDaily) {
      const { name, date: pickDate, dataDaily: seriesDaily } = stock;

      if (new Date(spW.date) < new Date(pickDate)) {
        entry[name] = null;
        continue;
      }

      // Base = DAILY close ON or BEFORE pickDate (fixes mid-week pick dates)
      const base = getCloseOnOrBefore(seriesDaily, pickDate);

      // Now = DAILY close ON or BEFORE the weekly anchor date (usually that Friday)
      const now = getCloseOnOrBefore(seriesDaily, spW.date);

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

  // Keep only last N months (based on weekly dates)
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  return aligned.filter((d) => new Date(d.date) >= cutoff);
}

export default async function handler(req, res) {
  try {
    const monthsParam = parseInt(req?.query?.months ?? "12", 10);
    const months = Number.isFinite(monthsParam) ? monthsParam : 12;

    const data = await buildTrackerData({ months });

    if (res?.setHeader) res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(data);
  } catch (err) {
    console.error("Tracker API fatal error:", err);
    return res.status(500).json({ error: "Failed to fetch tracker data" });
  }
}
