import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Submission } from '../types';

interface UseSubmissionsProps {
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  limit?: number;
  isAdmin?: boolean;
}

export default function useSubmissions({ 
  userId, 
  status = 'all', 
  limit = 10,
  isAdmin = false
}: UseSubmissionsProps = {}) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase.from('submissions').select('*, profiles:user_id (full_name, email, gender, region, organisation)', { count: 'exact' });
      
      // Add filters
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      
      // Limit results (unless we want all for an admin)
      if (limit > 0) {
        query = query.limit(limit);
      }
      
      // Order by newest first
      query = query.order('created_at', { ascending: false });
      
      const { data, error: fetchError, count } = await query;
      
      if (fetchError) throw fetchError;
      
      // Format the submissions for our frontend
      const formattedSubmissions: Submission[] = data.map(item => {
        const profile = item.profiles || {};
        
        return {
          id: item.id,
          userId: item.user_id,
          fullName: profile.full_name || 'Unknown User',
          email: profile.email || 'unknown@example.com',
          gender: profile.gender || 'Other',
          region: profile.region || 'Unknown',
          clubAffiliation: profile.organisation || 'None',
          pullUpCount: item.pull_up_count,
          actualPullUpCount: item.actual_pull_up_count,
          videoLink: item.video_url,
          submissionDate: item.created_at,
          status: item.status.charAt(0).toUpperCase() + item.status.slice(1) as "Approved" | "Pending" | "Rejected",
          featured: item.status === 'approved',
          notes: item.notes,
          platform: item.platform || 'other',
        };
      });
      
      setSubmissions(formattedSubmissions);
      if (count !== null) setTotalCount(count);
      
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  }, [userId, status, limit, isAdmin]);

  const approveSubmission = async (submissionId: string, actualPullUpCount: number) => {
    if (!isAdmin) {
      setError('Only admins can approve submissions');
      return false;
    }
    
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('submissions')
        .update({ 
          status: 'approved',
          actual_pull_up_count: actualPullUpCount,
          approved_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select();
        
      if (error) throw error;
      
      // Refresh submissions list
      fetchSubmissions();
      
      return true;
    } catch (err) {
      console.error('Error approving submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve submission');
      return false;
    }
  };

  const rejectSubmission = async (submissionId: string, notes?: string) => {
    if (!isAdmin) {
      setError('Only admins can reject submissions');
      return false;
    }
    
    try {
      setError(null);
      
      const updateData: { status: string; notes?: string } = { status: 'rejected' };
      if (notes) updateData.notes = notes;
      
      const { data, error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', submissionId)
        .select();
        
      if (error) throw error;
      
      // Refresh submissions list
      fetchSubmissions();
      
      return true;
    } catch (err) {
      console.error('Error rejecting submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject submission');
      return false;
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { 
    submissions, 
    isLoading, 
    error, 
    totalCount,
    refetch: fetchSubmissions,
    approveSubmission,
    rejectSubmission
  };
}