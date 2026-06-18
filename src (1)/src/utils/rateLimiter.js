// src/utils/rateLimiter.js
//
// IMPORTANT HONESTY NOTE — read this before relying on it:
//
// Netlify Functions are stateless. Each invocation may run in a fresh
// container with no shared memory, especially after cold starts or when
// Netlify scales out multiple concurrent instances. That means an
// in-memory Map like the one below is NOT a reliable global rate limiter —
// it only limits requests that happen to land on the same warm container
// in quick succession. Under real concurrent load, several users could
// each get their own warm container and effectively bypass the limit.
//
// This still has real value (it catches a single user hammering the same
// warm function rapidly, and costs nothing extra), but it is NOT a
// substitute for true rate limiting. For a real production limit that
// holds under load, you need an external store — Upstash Redis has a free
// tier that works well with Netlify and is the standard pairing. I'm
// flagging this clearly rather than pretending this in-memory version is
// equivalent to what express-rate-limit gave you on a persistent server.

const { RateLimitedError } = require('./errors');

const requestLog = new Map(); // key -> array of timestamps (ms)

function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const timestamps = (requestLog.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    throw new RateLimitedError(
      `Rate limit: max ${maxRequests} requests per ${Math.round(windowMs / 1000)}s on this endpoint.`
    );
  }

  timestamps.push(now);
  requestLog.set(key, timestamps);

  // Basic cleanup so the Map doesn't grow unbounded across a long-lived
  // warm container.
  if (requestLog.size > 500) {
    for (const [k, v] of requestLog) {
      if (v.every((t) => now - t > windowMs)) requestLog.delete(k);
    }
  }
}

function getClientKey(event) {
  // Netlify forwards the real client IP in this header.
  return (
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['client-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    'unknown'
  );
}

module.exports = { checkRateLimit, getClientKey };
