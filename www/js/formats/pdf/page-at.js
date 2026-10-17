// Which page is at vertical position y (pure binary search over page tops).
export function pageAt(count, topOf, y) {
  let lo = 0, hi = count - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (topOf(mid) <= y) lo = mid; else hi = mid - 1;
  }
  return lo;
}
