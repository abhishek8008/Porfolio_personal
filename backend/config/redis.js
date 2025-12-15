const Redis = require('ioredis');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryStrategy: (times) => {
    // Stop retrying after 3 attempts if no Redis configured
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST && times > 3) {
      return null; // Stop retrying
    }
    // Otherwise retry with exponential backoff
    return Math.min(times * 100, 3000);
  },
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  enableOfflineQueue: false,
  // TLS for cloud Redis (like Upstash, Redis Labs)
  ...(process.env.REDIS_TLS === 'true' && { tls: {} }),
};

// Create Redis client
let redis = null;
let isConnected = false;
let connectionAttempted = false;

const connectRedis = async () => {
  // Skip if no Redis configuration is provided
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    console.log('ℹ️ No Redis configuration found, running without cache');
    return null;
  }

  try {
    // Check if Redis URL is provided (for cloud services like Upstash)
    if (process.env.REDIS_URL) {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 100, 3000);
        },
      });
    } else {
      redis = new Redis(redisConfig);
    }

    // Set up event handlers before connecting
    redis.on('error', (err) => {
      if (!connectionAttempted) {
        console.warn('⚠️ Redis error:', err.message);
      }
      isConnected = false;
    });

    redis.on('connect', () => {
      isConnected = true;
      console.log('✅ Redis connected');
    });

    redis.on('close', () => {
      isConnected = false;
    });

    await redis.connect();
    connectionAttempted = true;
    isConnected = true;
    console.log('✅ Redis connected successfully');
    
    return redis;
  } catch (error) {
    connectionAttempted = true;
    console.warn('⚠️ Redis connection failed, running without cache:', error.message);
    isConnected = false;
    // Disconnect to stop retry attempts
    if (redis) {
      try {
        redis.disconnect();
      } catch (e) {}
      redis = null;
    }
    return null;
  }
};

// Cache key prefixes for different data types
const CACHE_KEYS = {
  PROFILE: 'portfolio:profile',
  SKILLS: 'portfolio:skills',
  PROJECTS: 'portfolio:projects',
  PROJECT: 'portfolio:project:', // + id
  CERTIFICATES: 'portfolio:certificates',
  EDUCATION: 'portfolio:education',
  EXPERIENCE: 'portfolio:experience',
  VISITOR_COUNT: 'portfolio:visitors:', // + page or 'total'
};

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  PROFILE: 3600,      // 1 hour
  SKILLS: 3600,       // 1 hour
  PROJECTS: 1800,     // 30 minutes
  PROJECT: 1800,      // 30 minutes
  CERTIFICATES: 3600, // 1 hour
  EDUCATION: 3600,    // 1 hour
  EXPERIENCE: 3600,   // 1 hour
  VISITOR_COUNT: 60,  // 1 minute (frequently updated)
};

// Cache utility functions
const cache = {
  // Check if Redis is available
  isAvailable: () => isConnected && redis !== null,

  // Get cached data
  get: async (key) => {
    if (!cache.isAvailable()) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  },

  // Set cached data with TTL
  set: async (key, data, ttl = 3600) => {
    if (!cache.isAvailable()) return false;
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  },

  // Delete cached data
  del: async (key) => {
    if (!cache.isAvailable()) return false;
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  },

  // Delete multiple keys by pattern
  delByPattern: async (pattern) => {
    if (!cache.isAvailable()) return false;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error.message);
      return false;
    }
  },

  // Clear all portfolio cache
  clearAll: async () => {
    if (!cache.isAvailable()) return false;
    try {
      const keys = await redis.keys('portfolio:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      console.log(`🗑️ Cleared ${keys.length} cached items`);
      return true;
    } catch (error) {
      console.error('Cache clear error:', error.message);
      return false;
    }
  },

  // Invalidate specific cache types when admin updates data
  invalidate: {
    profile: () => cache.del(CACHE_KEYS.PROFILE),
    skills: () => cache.del(CACHE_KEYS.SKILLS),
    projects: async () => {
      await cache.del(CACHE_KEYS.PROJECTS);
      await cache.delByPattern(`${CACHE_KEYS.PROJECT}*`);
    },
    project: (id) => cache.del(`${CACHE_KEYS.PROJECT}${id}`),
    certificates: () => cache.del(CACHE_KEYS.CERTIFICATES),
    education: () => cache.del(CACHE_KEYS.EDUCATION),
    experience: () => cache.del(CACHE_KEYS.EXPERIENCE),
    visitors: () => cache.delByPattern(`${CACHE_KEYS.VISITOR_COUNT}*`),
  },

  // Get cache stats
  getStats: async () => {
    if (!cache.isAvailable()) return { available: false };
    try {
      const info = await redis.info('stats');
      const keys = await redis.keys('portfolio:*');
      return {
        available: true,
        totalKeys: keys.length,
        info: info.split('\r\n').slice(0, 10),
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  },
};

module.exports = {
  connectRedis,
  redis,
  cache,
  CACHE_KEYS,
  CACHE_TTL,
};
