export function updateAverage(currentAvg, currentCount, newRating) {
  const total = currentAvg * currentCount + newRating;
  const nextCount = currentCount + 1;
  return { avg: total / nextCount, count: nextCount };
}
