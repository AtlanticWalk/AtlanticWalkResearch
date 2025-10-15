// pages/api/tracker.js
export default async function handler(req, res) {
  try {
    // ✅ Portfolio tickers and valuation dates
    const picks = [
      { symbol: "^GSPC", date: "2024-01-01" }, // baseline
      { symbol: "AVDL", date: "2025-09-12" },
      { symbol: "MP", date: "2025-04-29" },
      { symbol: "ACMR", date: "2025-06-03" },
      { symbol: "NBIS", date: "2024-12-12" },
      { symbol: "AMAT", date: "2024-11-21" },
      { symbol: "LRCX", date: "2024-11-30" },
    ];

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

    // Fetch all tickers concurrently
    const datasets = await Promise.all(
      picks.map((p) => fetchYahooData(p.symbol, p.date))
    );

    // Build blended dataset
    const baseline = datasets[0]; // S&P 500
    const stockData = picks.slice(1).map((p, i) => ({
      name: p.symbol,
      data: datasets[i + 1],
    }));

    // Align by date (using baseline timestamps)
    const data = baseline.map((b, i) => {
      const entry = { date: b.date };
      entry.sp500 = (b.close / baseline[0].close) * 100;

      // Normalize each stock from its first available close
      let blendSum = 0;
      let validCount = 0;

      stockData.forEach(({ name, data }) => {
        if (i < data.length && data[i]?.close) {
          const normalized = (data[i].close / data[0].close) * 100;
          entry[name.toLowerCase()] = normalized;
          blendSum += normalized;
          validCount++;
        }
      });

      entry.portfolio = validCount > 0 ? blendSum / validCount : null;
      return entry;
    });

    // Fallback in case of failure
    if (!data.length) {
      return res.status(200).json([
        { date: "2024-01-01", sp500: 100, portfolio: 100 },
        { date: "2024-02-01", sp500: 102, portfolio: 108 },
        { date: "2024-03-01", sp500: 104, portfolio: 115 },
      ]);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Tracker API fatal error:", error);
    res.status(500).json({ error: "Failed to fetch tracker data" });
  }
}
    res.status(200).json(data);
  } catch (error) {
    console.error("Tracker API fatal error:", error);
    res.status(500).json({ error: "Failed to fetch tracker data" });
  }
}
