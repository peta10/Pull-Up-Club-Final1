import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Submission, UseSubmissionsOptions } from '../types';

const useSubmissions = (options: UseSubmissionsOptions = {}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('submissions')
        .select('*, profiles(email, full_name, age, gender, city, organisation)')
        .order('created_at', { ascending: false });

      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status.toLowerCase());
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedData: Submission[] = (data || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        fullName: record.profiles?.full_name || 'Unknown User',
        email: record.profiles?.email || 'unknown@example.com',
        phone: record.profiles?.phone,
        age: record.profiles?.age || 0,
        gender: (record.profiles?.gender as 'Male' | 'Female' | 'Other') || 'Other',
        region: record.profiles?.city || 'Unknown Region',
        clubAffiliation: record.profiles?.organisation || 'None',
        pullUpCount: record.pull_up_count,
        actualPullUpCount: record.actual_pull_up_count || undefined,
        videoUrl: record.video_url,
        status: record.status.charAt(0).toUpperCase() + record.status.slice(1) as 'Pending' | 'Approved' | 'Rejected',
        submittedAt: record.created_at,
        approvedAt: record.approved_at || undefined,
        notes: record.notes || undefined,
        featured: record.status === 'approved',
        socialHandle: record.social_handle
      }));

      setSubmissions(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  const approveSubmission = async (submissionId: string, actualCount?: number) => {
    try {
      const { error } = await supabase.functions.invoke('admin-submissions', {
        body: {
          action: 'approve',
          submissionId,
          actualCount
        }
      });

      if (error) throw error;
      await fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error approving submission');
    }
  };

  const rejectSubmission = async (submissionId: string, reason?: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-submissions', {
        body: {
          action: 'reject',
          submissionId,
          reason
        }
      });

      if (error) throw error;
      await fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rejecting submission');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [options.status, options.limit]);

  return {
    submissions,
    loading,
    error,
    refetch: fetchSubmissions,
    approveSubmission,
    rejectSubmission
  };
};

export default useSubmissions; 