/**
 * Simple in-memory cache with TTL for server-side data
 */
interface CacheEntry {
  value: any;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.value as T;
}

export function setCache<T>(key: string, value: T, ttlSeconds: number = 3600): T {
  cache.set(key, {
    value,
    expiresAt: Date.now() + (ttlSeconds * 1000),
  });
  return value;
}

export function deleteCache(key: string): void {
  cache.delete(key);
}

export function clearCache(): void {
  cache.clear();
}
