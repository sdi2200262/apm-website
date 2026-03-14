/**
 * localStorage cache with TTL support.
 * SSR-safe: checks for window, wraps in try-catch.
 */

const DEFAULT_TTL = 3600000; // 1 hour

export function isCacheValid(cachedData, ttl = DEFAULT_TTL) {
  if (!cachedData || !cachedData.timestamp) return false;
  return Date.now() - cachedData.timestamp < ttl;
}

export function getCachedData(key, ttl = DEFAULT_TTL) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isCacheValid(parsed, ttl)) return parsed.data;
    return null;
  } catch {
    return null;
  }
}

export function setCachedData(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Storage full or unavailable — silently fail
  }
}
