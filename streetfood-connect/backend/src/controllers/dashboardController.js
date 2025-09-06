export async function revenue(req, res) {
  // Placeholder: replace with aggregation over orders and time buckets
  res.json([
    { period: '2025-01', amount: 12000 },
    { period: '2025-02', amount: 15800 },
    { period: '2025-03', amount: 17150 }
  ]);
}
