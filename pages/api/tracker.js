import yahooFinance from "yahoo-finance2";

export default async function handler(req, res) {
  const symbols = ["^GSPC", "MP", "ACMR"]; // add more of your tickers here
  const startDate = "2024-01-01";
  const endDate = new Date().toISOString().slice(0, 10);

  try {
    const [sp500, mp, acmr] = await Promise.all(
      symbols.map((sym) =>
        yahooFinance.chart(sym, { period1: startDate, period2: endDate })
      )
    );

    const dates = sp500.quotes.map((q) => q.date.toISOString().slice(0, 10));
    const data = dates.map((date, i) => ({
      date,
      sp500: (sp500.quotes[i].close / sp500.quotes[0].close) * 100,
      atlanticWalk:
        ((mp.quotes[i]?.close / mp.quotes[0]?.close || 1) +
          (acmr.quotes[i]?.close / acmr.quotes[0]?.close || 1)) /
        2 *
        100,
    }));

    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Failed to fetch tracker data" });
  }
}
