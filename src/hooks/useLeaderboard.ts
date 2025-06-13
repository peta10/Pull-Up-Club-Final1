import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Submission } from '../types';

export const useLeaderboard = (maxEntries?: number) => {
  const [leaderboardData, setLeaderboardData] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('user_best_submissions')
        .select('*')
        .order('actual_pull_up_count', { ascending: false })
        .limit(maxEntries || 1000);
      if (error) throw error;
      const formatted: Submission[] = (data || []).map((submission: any) => ({
        id: submission.id,
        userId: submission.user_id,
        fullName: submission.full_name || 'Unknown User',
        email: submission.email || 'unknown@example.com',
        phone: submission.phone || '',
        age: submission.age || 0,
        gender: (submission.gender as 'Male' | 'Female' | 'Other') || 'Other',
        region: submission.region || 'Unknown Region',
        clubAffiliation: submission.organization || 'None',
        pullUpCount: submission.actual_pull_up_count || submission.pull_up_count,
        actualPullUpCount: submission.actual_pull_up_count,
        videoUrl: submission.video_url,
        status: 'Approved',
        submittedAt: submission.created_at,
        approvedAt: submission.approved_at || undefined,
        notes: submission.notes || undefined,
        featured: true,
        socialHandle: submission.social_media || undefined
      }));
      setLeaderboardData(formatted);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxEntries]);

  return { leaderboardData, isLoading, error, refetch: fetchLeaderboardData };
}; 