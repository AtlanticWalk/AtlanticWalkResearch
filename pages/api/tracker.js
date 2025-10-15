// pages/api/tracker.js
export default async function handler(req, res) {
  try {
    // Portfolio tickers and start dates
    const picks = [
      { symbol: "^GSPC", name: "sp500", date: "2024-11-21" }, // baseline start
      { symbol: "AVDL", name: "avdl", date: "2025-09-12" },
      { symbol: "MP", name: "mp", date: "2025-04-29" },
      { symbol: "ACMR", name: "acmr", date: "2025-06-03" },
      { symbol: "NBIS", name: "nbis", date: "2024-12-12" },
      { symbol: "AMAT", name: "amat", date: "2024-11-21" },
      { symbol: "LRCX", name: "lrcx", date: "2024-11-30" },
    ];

    // Determine earliest start date
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
      )}&interval=1mo`;

      const response = await fetch(url);
      const data = await response.json();

      const quotes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
      const timestamps = data?.chart?.result?.[0]?.timestamp || [];

      return timestamps.map((t, i) => ({
        date: new Date(t * 1000).toISOString().slice(0, 10),
        close: quotes[i],
      }));
    };

    // Fetch all tickers from the earliest date
    const datasets = await Promise.all(
      picks.map((p) => fetchYahooData(p.symbol, earliestDate))
    );

    const baseline = datasets[0]; // S&P 500
    const stocks = picks.slice(1).map((p, i) => ({
      ...p,
      data: datasets[i + 1],
    }));

    // Build normalized dataset
    const data = baseline.map((b) => {
      const entry = { date: b.date };
      const sp500Norm = (b.close / baseline[0].close) * 100;
      entry.sp500 = sp500Norm;

      let blendSum = 0;
      let validCount = 0;

      // Each stock branches from S&P value at its start date
      stocks.forEach(({ name, date, data }) => {
        if (new Date(b.date) < new Date(date)) {
          entry[name] = null;
          return;
        }

        const spStart = baseline.find(
          (bp) => new Date(bp.date) >= new Date(date)
        );
        const spStartNorm = spStart
          ? (spStart.close / baseline[0].close) * 100
          : sp500Norm;

        const baseClose = data.find((d) => new Date(d.date) >= new Date(date))
          ?.close;
        const stockClose = data.find((d) => d.date === b.date)?.close;

        if (baseClose && stockClose) {
          const stockNorm = (stockClose / baseClose) * 100;
          entry[name] = (stockNorm / 100) * spStartNorm;
          blendSum += entry[name];
          validCount++;
        } else {
          entry[name] = null;
        }
      });

      entry.portfolio = validCount > 0 ? blendSum / validCount : null;
      return entry;
    });

    // Fallback
    if (!data.length) {
      return res.status(200).json([
        { date: earliestDate, sp500: 100, portfolio: 100 },
        { date: "2025-01-01", sp500: 102, portfolio: 108 },
        { date: "2025-02-01", sp500: 104, portfolio: 115 },
      ]);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Tracker API fatal error:", error);
    res.status(500).json({ error: "Failed to fetch tracker data" });
  }
}
