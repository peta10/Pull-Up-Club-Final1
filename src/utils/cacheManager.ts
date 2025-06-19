import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'PullUpClub',
  storeName: 'cache',
  description: 'Pull-Up Club performance cache',
});

// Cache keys
export const CACHE_KEYS = {
  leaderboard: 'leaderboard_data',
  user_profile: 'user_profile_', // append userId
  submissions: 'submissions_data',
  badges: 'badges_data',
  app_version: 'app_version',
};

// Cache expiry times (in ms)
export const CACHE_EXPIRY = {
  leaderboard: 30 * 1000, // 30 seconds
  user_profile: 5 * 60 * 1000, // 5 minutes
  submissions: 2 * 60 * 1000, // 2 minutes
  badges: 10 * 60 * 1000, // 10 minutes
  app_version: 24 * 60 * 60 * 1000, // 24 hours
};

class CacheManager {
  async setCache(key: string, data: any, customExpiry?: number): Promise<void> {
    try {
      // Default expiry: leaderboard if not specified
      const expiry = Date.now() + (customExpiry || CACHE_EXPIRY.leaderboard);
      await localforage.setItem(key, { data, expiry });
    } catch (error) {
      console.log('Cache set error:', error);
    }
  }

  async getCache(key: string): Promise<any | null> {
    try {
      const item = await localforage.getItem<{ data: any; expiry: number }>(key);
      if (!item) return null;
      if (typeof item !== 'object' || item === null || !('expiry' in item)) {
        // Not a valid cache object, clear it
        await localforage.removeItem(key);
        return null;
      }
      if (Date.now() > item.expiry) {
        await localforage.removeItem(key);
        return null;
      }
      return item.data;
    } catch (error) {
      console.log('Cache get error:', error);
      return null;
    }
  }

  async clearCache(key: string): Promise<void> {
    try {
      await localforage.removeItem(key);
    } catch (error) {
      console.log('Cache clear error:', error);
    }
  }

  async clearAllCaches(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.log('Cache clearAll error:', error);
    }
  }

  async getCacheInfo(): Promise<{ size: number; keys: string[] }> {
    try {
      const keys = await localforage.keys();
      let size = 0;
      for (const key of keys) {
        const value = await localforage.getItem(key);
        if (value) {
          try {
            size += JSON.stringify(value).length;
          } catch {
            // ignore size error
          }
        }
      }
      return { size, keys };
    } catch (error) {
      console.log('Cache info error:', error);
      return { size: 0, keys: [] };
    }
  }
}

export default new CacheManager(); 