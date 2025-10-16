<ResponsiveContainer width="100%" height={420}>
  <LineChart data={trackerData}>
    <XAxis
      dataKey="date"
      stroke="#000000"
      tick={{ fill: "#000000", fontWeight: 500 }}
    />
    <YAxis
      tickFormatter={(v) => `${v.toFixed(0)}%`}
      domain={["auto", "auto"]}
      stroke="#000000"
      tick={{ fill: "#000000", fontWeight: 500 }}
    />
    <Tooltip formatter={(v) => `${v.toFixed(2)}%`} />
    <Legend
      wrapperStyle={{
        color: "#000000",
        fontWeight: "bold",
      }}
    />
    <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />

    <Line
      type="monotone"
      dataKey="sp500"
      stroke="#10b981"
      name="S&P 500"
      strokeWidth={2}
      dot={false}
    />
    <Line
      type="monotone"
      dataKey="portfolio"
      stroke="#000000"
      name="Atlantic Walk Portfolio"
      dot={false}
    />
    <Line type="monotone" dataKey="avdl" stroke="#ff4d4f" name="AVDL" dot={false} />
    <Line type="monotone" dataKey="mp" stroke="#82ca9d" name="MP Materials" dot={false} />
    <Line type="monotone" dataKey="acmr" stroke="#ff7300" name="ACM Research" dot={false} />
    <Line type="monotone" dataKey="nbis" stroke="#13c2c2" name="NBIS" dot={false} />
    <Line type="monotone" dataKey="amat" stroke="#2f54eb" name="AMAT" dot={false} />
    <Line type="monotone" dataKey="lrcx" stroke="#a0d911" name="LRCX" dot={false} />
  </LineChart>
</ResponsiveContainer>
