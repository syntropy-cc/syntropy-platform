/**
 * Distributed lock via Redis SET NX EX (COMP-034.4).
 *
 * Ensures only one instance runs a given job when multiple workers are deployed.
 */

const LOCK_PREFIX = "cron:lock:";
const DEFAULT_TTL_SEC = 600; // 10 min

/** Minimal Redis client interface for lock (set with NX/EX, del). */
export interface LockRedis {
  set(key: string, value: string, ...args: string[]): Promise<string | null>;
  del(key: string): Promise<number>;
}

/**
 * Acquire a lock for the given key. Returns true if acquired, false if already held.
 */
export async function acquireLock(
  redis: LockRedis,
  key: string,
  ttlSec: number = DEFAULT_TTL_SEC
): Promise<boolean> {
  const fullKey = `${LOCK_PREFIX}${key}`;
  const result = await redis.set(fullKey, "1", "EX", String(ttlSec), "NX");
  return result === "OK";
}

/**
 * Release the lock by deleting the key. Call after job completes.
 */
export async function releaseLock(redis: LockRedis, key: string): Promise<void> {
  const fullKey = `${LOCK_PREFIX}${key}`;
  await redis.del(fullKey);
}
