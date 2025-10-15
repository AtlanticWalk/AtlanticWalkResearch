export default async function handler(req, res) {
  try {
    const symbols = ["^GSPC", "MP", "ACMR"];
    const startDate = "2024-01-01";
    const endDate = new Date().toISOString().slice(0, 10);

    const fetchYahooData = async (symbol) => {
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

    const [sp500Data, mpData, acmrData] = await Promise.all(
      symbols.map(fetchYahooData)
    );

    // fallback if any data missing
    if (!sp500Data.length || !mpData.length || !acmrData.length) {
      return res.status(200).json([
        { date: "2024-01-01", sp500: 100, atlanticWalk: 100 },
        { date: "2024-02-01", sp500: 101, atlanticWalk: 103 },
        { date: "2024-03-01", sp500: 103, atlanticWalk: 108 },
      ]);
    }

    const data = sp500Data.map((_, i) => ({
      date: sp500Data[i].date,
      sp500: (sp500Data[i].close / sp500Data[0].close) * 100,
      atlanticWalk:
        (((mpData[i]?.close || mpData[0].close) / mpData[0].close) +
          ((acmrData[i]?.close || acmrData[0].close) / acmrData[0].close)) /
          2 *
        100,
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error("Tracker API fatal error:", error);
    res.status(500).json({ error: "Failed to fetch tracker data" });
  }
}