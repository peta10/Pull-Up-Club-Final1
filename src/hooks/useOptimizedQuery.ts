import { useQuery } from '@tanstack/react-query';
import CacheManager, { CACHE_KEYS, CACHE_EXPIRY } from '../utils/cacheManager';
import { supabase } from '../lib/supabase';
import { LeaderboardFilters, Submission, Profile } from '../types';

// Query config
const queryConfig = {
  leaderboard: {
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  },
  submissions: {
    staleTime: 2 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
  profile: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  },
};

function hashFilters(filters: LeaderboardFilters): string {
  return btoa(JSON.stringify(filters || {}));
}

export function useLeaderboardWithCache(filters: LeaderboardFilters = {}) {
  const cacheKey = `${CACHE_KEYS.leaderboard}_${hashFilters(filters)}`;

  return useQuery<Submission[]>({
    queryKey: ['leaderboard', filters],
    queryFn: async () => {
      try {
        // Try cache first
        const cached = await CacheManager.getCache(cacheKey);
        if (cached) {
          console.log('Leaderboard cache hit', cacheKey);
          return cached;
        }
        // Query Supabase (replace with your materialized view/table)
        const { data, error } = await supabase
          .from('leaderboard_cache')
          .select('*')
          .order('rank', { ascending: true });
        if (error) throw error;
        let filtered = data || [];
        // Apply filters client-side
        if (filters.region) filtered = filtered.filter((x: any) => x.region === filters.region);
        if (filters.gender) filtered = filtered.filter((x: any) => x.gender === filters.gender);
        if (filters.club) filtered = filtered.filter((x: any) => x.clubAffiliation === filters.club);
        if (filters.ageGroup) filtered = filtered.filter((x: any) => x.ageGroup === filters.ageGroup);
        if (filters.badge) filtered = filtered.filter((x: any) => x.badges?.includes(filters.badge));
        await CacheManager.setCache(cacheKey, filtered, CACHE_EXPIRY.leaderboard);
        return filtered;
      } catch (err) {
        console.log('Leaderboard query/cache error', err);
        return [];
      }
    },
    ...queryConfig.leaderboard,
  });
}

export function useUserProfileWithCache(userId: string) {
  const cacheKey = `${CACHE_KEYS.user_profile}${userId}`;

  return useQuery<Profile | null>({
    queryKey: ['user_profile', userId],
    queryFn: async () => {
      try {
        const cached = await CacheManager.getCache(cacheKey);
        if (cached) {
          console.log('User profile cache hit', cacheKey);
          return cached;
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) throw error;
        await CacheManager.setCache(cacheKey, data, CACHE_EXPIRY.user_profile);
        return data;
      } catch (err) {
        console.log('User profile query/cache error', err);
        return null;
      }
    },
    ...queryConfig.profile,
  });
} 