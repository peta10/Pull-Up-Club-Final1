import React, { useState, useEffect } from 'react';
import Layout from "../../components/Layout/Layout";
import LeaderboardFilters from "./LeaderboardFilters";
import LeaderboardTable from "./LeaderboardTable";
import BadgeLegend from "./BadgeLegend";
import { LeaderboardFilters as FiltersType, Submission } from "../../types";
import { supabase } from '../../lib/supabase';
import { LoadingState, ErrorState } from '../../components/ui/LoadingState';

const LeaderboardPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersType>({});

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name,
            age,
            gender,
            city,
            organization,
            social_media
          )
        `)
        .eq('status', 'approved')
        .not('actual_pull_up_count', 'is', null)
        .order('actual_pull_up_count', { ascending: false });

      if (error) throw error;

      // Transform the data to match the Submission interface
      const transformedSubmissions: Submission[] = (data || []).map(record => {
        const verifiedCount = record.actual_pull_up_count || record.pull_up_count;
        return {
          id: record.id,
          userId: record.user_id,
          fullName: record.profiles?.full_name || 'Unknown User',
          email: record.profiles?.email || 'unknown@example.com',
          phone: record.profiles?.phone,
          age: record.profiles?.age || 0,
          gender: (record.profiles?.gender as 'Male' | 'Female' | 'Other') || 'Other',
          region: record.region || record.profiles?.city || 'Unknown Region',
          clubAffiliation: record.club_affiliation || record.profiles?.organization || 'None',
          pullUpCount: verifiedCount,
          actualPullUpCount: record.actual_pull_up_count,
          videoUrl: record.video_url,
          status: 'Approved',
          submittedAt: record.created_at,
          approvedAt: record.approved_at || undefined,
          notes: record.notes || undefined,
          featured: true,
          socialHandle: record.profiles?.social_media
        };
      });
      setSubmissions(transformedSubmissions);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
  };

  if (loading) return <LoadingState message="Loading leaderboard..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <Layout>
      <div className="bg-black py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
              See how you stack up against the competition. Our leaderboard
              shows the top performers in the Pull-Up Club Challenge.
            </p>
          </div>

          <LeaderboardFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <BadgeLegend />

          <LeaderboardTable
            submissions={submissions}
            filters={filters}
          />
        </div>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
