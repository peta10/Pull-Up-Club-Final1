import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface AdminStats {
  totalUsers: number;
  paidUsers: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
}

interface UseAdminReturn {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  stats: AdminStats | null;
  refreshStats: () => Promise<void>;
}

export default function useAdmin(): UseAdminReturn {
  const { user, isAdmin: authIsAdmin } = useAuth();
  const [isAdmin, setIsAdmin] = useState(authIsAdmin);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
        throw error;
      }

      setIsAdmin(!!data);
    } catch (err) {
      console.error('Error checking admin status:', err);
      setError('Failed to verify admin status');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchAdminStats = useCallback(async () => {
    if (!isAdmin || !user) return;

    try {
      setIsLoading(true);
      
      // Fetch user stats
      const { data: userStats, error: userError } = await supabase
        .rpc('get_user_stats');
        
      if (userError) throw userError;

      // Fetch submission stats  
      const { data: subStats, error: subError } = await supabase
        .rpc('get_submission_stats');
        
      if (subError) throw subError;
      
      // Combine the stats
      setStats({
        totalUsers: userStats?.total_users || 0,
        paidUsers: userStats?.paid_users || 0,
        pendingSubmissions: subStats?.pending || 0,
        approvedSubmissions: subStats?.approved || 0,
        rejectedSubmissions: subStats?.rejected || 0,
      });
      
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load admin statistics');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, user]);

  const refreshStats = useCallback(async () => {
    await fetchAdminStats();
  }, [fetchAdminStats]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    }
  }, [isAdmin, fetchAdminStats]);

  return {
    isAdmin,
    isLoading,
    error,
    stats,
    refreshStats
  };
}