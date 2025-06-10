import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface AdminStats {
  totalUsers: number;
  paidUsers: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
}

const useAdmin = () => {
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const getSubmissions = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-submissions', {
        body: { action: 'list' }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
      return null;
    }
  }, []);

  const approveSubmission = useCallback(async (submissionId: string, actualCount: number) => {
    try {
      const { error } = await supabase.functions.invoke('admin-submissions', {
        body: { action: 'approve', submissionId, actualCount }
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve submission');
    }
  }, []);

  const rejectSubmission = useCallback(async (submissionId: string, reason: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-submissions', {
        body: { action: 'reject', submissionId, reason }
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject submission');
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-api', {
        body: { action: 'getStats' }
      });

      if (error) throw error;
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAdmin,
    isLoading,
    error,
    stats,
    getSubmissions,
    approveSubmission,
    rejectSubmission,
    refreshStats
  };
};

export default useAdmin; 