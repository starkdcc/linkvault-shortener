import { LRUCache } from 'lru-cache';

export default function rateLimit(options = {}) {
  const {
    interval = 60 * 1000, // 60 seconds
    uniqueTokenPerInterval = 500,
  } = options;

  const tokenCache = new LRUCache({
    max: parseInt(uniqueTokenPerInterval) || 500,
    ttl: parseInt(interval) || 60000,
  });

  return {
    check: (res, limit, token) =>
      new Promise((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) || [0])[0];
        
        if (tokenCount === 0) {
          tokenCache.set(token, [tokenCount + 1]);
        }
        
        const currentUsage = tokenCount;
        const isBlocked = currentUsage >= parseInt(limit);
        
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', isBlocked ? 0 : limit - currentUsage);
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + interval));
        
        return isBlocked ? reject() : resolve();
      }),
  };
}

// Alternative simple rate limiter without dependencies
export function simpleRateLimit(windowMs = 60000, max = 10) {
  const clients = new Map();

  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up expired entries
    for (const [key, timestamps] of clients.entries()) {
      const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
      if (validTimestamps.length === 0) {
        clients.delete(key);
      } else {
        clients.set(key, validTimestamps);
      }
    }

    // Get client's request timestamps
    const clientTimestamps = clients.get(clientId) || [];
    const recentRequests = clientTimestamps.filter(timestamp => timestamp > windowStart);

    if (recentRequests.length >= max) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((windowStart + windowMs - now) / 1000)
      });
    }

    // Add current request timestamp
    recentRequests.push(now);
    clients.set(clientId, recentRequests);

    if (next) next();
    return true;
  };
}