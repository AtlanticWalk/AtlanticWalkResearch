// pages/api/tracker.js
export default async function handler(req, res) {
  try {
    const picks = [
      { symbol: "^GSPC", name: "sp500", date: "2024-11-21" },
      { symbol: "AMAT", name: "amat", date: "2024-11-21" },
      { symbol: "LRCX", name: "lrcx", date: "2024-11-30" },
      { symbol: "NBIS", name: "nbis", date: "2024-12-29" },
      { symbol: "MP", name: "mp", date: "2025-05-26" },
      { symbol: "ACMR", name: "acmr", date: "2025-06-24" },
      { symbol: "AVDL", name: "avdl", date: "2025-09-21" },
    ];

    const earliestDate = picks.reduce(
      (min, p) => (new Date(p.date) < new Date(min) ? p.date : min),
      picks[0].date
    );

    const endDate = new Date().toISOString().slice(0, 10);

    const fetchYahooData = async (symbol, startDate) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        symbol
      )}?period1=${Math.floor(new Date(startDate).getTime() / 1000)}&period2=${Math.floor(
        new Date(endDate).getTime() / 1000
      )}&interval=1wk`;

      try {
        const resData = await fetch(url);
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

    // Fetch data safely
    const datasets = await Promise.all(
      picks.map((p) => fetchYahooData(p.symbol, earliestDate))
    );

    const sp500 = datasets[0] || [];
    const stocks = picks.slice(1).map((p, i) => ({
      ...p,
      data: datasets[i + 1] || [],
    }));

    if (!sp500.length) {
      console.warn("⚠️ No S&P 500 data fetched; using fallback sample data.");
      return res.status(200).json([
        { date: earliestDate, sp500: 0, portfolio: 0 },
        { date: "2025-01-01", sp500: 2, portfolio: 6 },
        { date: "2025-02-01", sp500: 4, portfolio: 12 },
      ]);
    }

    const data = sp500.map((sp) => {
      const entry = { date: sp.date };
      entry.sp500 = ((sp.close / sp500[0].close) - 1) * 100;

      let blendSum = 0;
      let count = 0;

      for (const { name, date, data } of stocks) {
        if (new Date(sp.date) < new Date(date)) {
          entry[name] = null;
          continue;
        }

        const base = data.find((d) => new Date(d.date) >= new Date(date))?.close;
        const now = data.find((d) => d.date === sp.date)?.close;

        if (base && now) {
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

    // Keep only the past 12 months of weekly data
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 12);
    const filteredData = data.filter((d) => new Date(d.date) >= cutoff);

    res.status(200).json(filteredData);
  } catch (err) {
    console.error("Tracker API fatal error:", err);
    res.status(500).json({ error: "Failed to fetch tracker data" });
  }
}
