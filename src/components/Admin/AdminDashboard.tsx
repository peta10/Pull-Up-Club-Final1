import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import AdminStats from './AdminStats';
import SubmissionReview from './SubmissionReview';
import UserManagement from './UserManagement';
import { Alert } from '../ui/Alert';
import { LoadingState } from '../ui/LoadingState';
import { Submission } from '../../types';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState('submissions');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats] = useState<any>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, profiles(email, full_name, age, gender, city, organisation)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { submissions: data };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching submissions');
      return null;
    }
  };

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await getSubmissions();
      if (data) {
        // Transform the data to match the Submission interface
        const transformedSubmissions: Submission[] = data.submissions.map((submission: any) => ({
          id: submission.id,
          userId: submission.user_id,
          fullName: submission.full_name || submission.email?.split('@')[0] || 'Unknown User',
          email: submission.email || 'unknown@example.com',
          phone: submission.phone,
          age: submission.age || 0,
          gender: (submission.gender as 'Male' | 'Female' | 'Other') || 'Other',
          region: submission.region || 'Unknown Region',
          clubAffiliation: submission.club_affiliation || 'None',
          pullUpCount: submission.pull_up_count,
          actualPullUpCount: submission.actual_pull_up_count || undefined,
          videoUrl: submission.video_url,
          status: submission.status.charAt(0).toUpperCase() + submission.status.slice(1) as 'Pending' | 'Approved' | 'Rejected',
          submittedAt: submission.created_at,
          approvedAt: submission.approved_at || undefined,
          notes: submission.notes || undefined,
          featured: submission.status === 'approved',
          socialHandle: submission.social_handle
        }));
        setSubmissions(transformedSubmissions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const approveSubmission = async (submissionId: string, actualCount: number) => {
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

  const rejectSubmission = async (submissionId: string, notes?: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-submissions', {
        body: {
          action: 'reject',
          submissionId,
          notes
        }
      });

      if (error) throw error;
      await fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rejecting submission');
    }
  };

  const refreshStats = async () => {
    // Implement stats refresh logic here
  };

  if (isLoading) return <LoadingState message="Loading dashboard..." />;

  if (error) {
    return (
      <Alert
        variant="error"
        title="Error"
        description={error}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <SubmissionReview
                key={submission.id}
                submission={submission}
                onApprove={approveSubmission}
                onReject={rejectSubmission}
              />
            ))
          ) : (
            <div className="text-gray-400">No submissions found.</div>
          )}
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="stats">
          <AdminStats stats={stats} onRefresh={refreshStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;