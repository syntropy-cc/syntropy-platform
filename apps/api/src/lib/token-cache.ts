/**
 * In-memory token verification cache (COMP-033.2).
 * TTL 5 minutes. For production, replace with Redis-backed implementation.
 */

import type { RequestUser } from "../types/fastify.js";

const TTL_MS = 5 * 60 * 1000; // 5 min

interface CacheEntry {
  user: RequestUser;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function prune(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}

export interface TokenCache {
  get(token: string): RequestUser | null;
  set(token: string, user: RequestUser): void;
}

export const inMemoryTokenCache: TokenCache = {
  get(token: string): RequestUser | null {
    const entry = cache.get(token);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      cache.delete(token);
      return null;
    }
    return entry.user;
  },

  set(token: string, user: RequestUser): void {
    if (cache.size > 10_000) prune();
    cache.set(token, {
      user,
      expiresAt: Date.now() + TTL_MS,
    });
  },
};
