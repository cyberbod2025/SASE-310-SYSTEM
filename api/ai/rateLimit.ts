import { Redis } from "@upstash/redis";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const kvUrl =
  process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL;
const kvToken =
  process.env.KV_REST_API_TOKEN || process.env.VERCEL_KV_REST_API_TOKEN;

const redis = upstashUrl && upstashToken
  ? Redis.fromEnv()
  : kvUrl && kvToken
    ? new Redis({ url: kvUrl, token: kvToken })
    : null;

const rateLimitState = new Map<string, { count: number; resetAt: number }>();

const isRateLimitedLocal = (
  key: string,
  limit = 60,
  windowMs = 60_000,
): boolean => {
  const now = Date.now();
  const entry = rateLimitState.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimitState.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
};

export const getRateLimitKey = (req: any): string => {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim() || "unknown";
  }
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  const remoteAddress = req.socket?.remoteAddress;
  if (typeof remoteAddress === "string" && remoteAddress.trim()) {
    return remoteAddress.trim();
  }
  return "unknown";
};

export const isRateLimited = async (
  key: string,
  limit = 60,
  windowMs = 60_000,
): Promise<boolean> => {
  if (!key) return false;
  if (!redis) return isRateLimitedLocal(key, limit, windowMs);

  try {
    const bucket = `rate:${key}`;
    const count = await redis.incr(bucket);
    if (count === 1) {
      await redis.pexpire(bucket, windowMs);
    }
    return count > limit;
  } catch (error) {
    return isRateLimitedLocal(key, limit, windowMs);
  }
};
