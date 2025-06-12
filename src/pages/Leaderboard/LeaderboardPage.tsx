import React, { useState, useEffect } from 'react';
import Layout from "../../components/Layout/Layout";
import BadgeLegend from "./BadgeLegend";
import LeaderboardTable from "../../components/Leaderboard/LeaderboardTable";
import { LeaderboardFilters as FiltersType, Submission } from "../../types";
import { supabase } from '../../lib/supabase';
import { LoadingState, ErrorState } from '../../components/ui/LoadingState';
import { useTranslation } from 'react-i18next';

const allowedRegions = [
  'North America',
  'South America',
  'Europe',
  'Asia',
  'Africa',
  'Australia/Oceania'
];

function mapRegion(region: string): string {
  if (!region) return 'Unknown Region';
  const lower = region.toLowerCase();
  if (lower.includes('north america')) return 'North America';
  if (lower.includes('south america')) return 'South America';
  if (lower.includes('europe')) return 'Europe';
  if (lower.includes('asia')) return 'Asia';
  if (lower.includes('africa')) return 'Africa';
  if (lower.includes('australia') || lower.includes('oceania')) return 'Australia/Oceania';
  return 'Unknown Region';
}

const LeaderboardPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersType>({});
  const { t } = useTranslation('leaderboard');

  useEffect(() => {
    fetchLeaderboardData();
  }, [filters]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('submissions')
        .select(`*, profiles:user_id (email, full_name, age, gender, organization, social_media, city, state, country)`)
        .eq('status', 'approved')
        .not('actual_pull_up_count', 'is', null)
        .order('actual_pull_up_count', { ascending: false });
      if (error) throw error;
      const formatted: Submission[] = (data || []).map((record: any) => {
        const regionRaw = [record.profiles?.city, record.profiles?.state, record.profiles?.country].filter(Boolean).join(', ');
        const mappedRegion = mapRegion(regionRaw);
        return {
          id: record.id,
          userId: record.user_id,
          fullName: record.profiles?.full_name || 'Unknown User',
          email: record.profiles?.email || 'unknown@example.com',
          phone: record.profiles?.phone || '',
          age: record.profiles?.age || 0,
          gender: (record.profiles?.gender as 'Male' | 'Female' | 'Other') || 'Other',
          region: mappedRegion,
          clubAffiliation: record.club_affiliation || record.profiles?.organization || 'None',
          pullUpCount: record.actual_pull_up_count || record.pull_up_count,
          actualPullUpCount: record.actual_pull_up_count,
          videoUrl: record.video_url,
          status: 'Approved',
          submittedAt: record.created_at,
          approvedAt: record.approved_at || undefined,
          notes: record.notes || undefined,
          featured: true,
          socialHandle: record.profiles?.social_media || undefined
        };
      });
      setSubmissions(formatted);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
  };

  if (loading) return <LoadingState message={t('loading')} />;
  if (error) return <ErrorState message={error} />;

  return (
    <Layout>
      <div className="bg-black py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <img src="/PUClogo (1).webp" alt="Pull-Up Club Logo" className="h-10 w-auto mr-3" />
            <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
          </div>
          <div className="text-center mb-8">
            <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
          <BadgeLegend />
          <LeaderboardTable
            submissions={submissions}
            showPagination={true}
            showFilters={true}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
