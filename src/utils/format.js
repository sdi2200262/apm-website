/**
 * Format large numbers for display.
 * 1234 → "1.2k", 1234567 → "1.2M"
 * Numbers < 1000: round down to nearest 50 with "+" suffix.
 */
export function formatNumber(num) {
  if (num == null || isNaN(num)) return '—';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  if (num >= 100) return `${Math.floor(num / 50) * 50}+`;
  return String(num);
}
