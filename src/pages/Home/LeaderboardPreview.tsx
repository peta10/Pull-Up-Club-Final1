import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Link } from "../../components/ui/Link";
import LeaderboardTable from "../../components/Leaderboard/LeaderboardTable";
import { Submission } from "../../types";
import { supabase } from "../../lib/supabase";

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

const LeaderboardPreview: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const fetchTopSubmissions = async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`*, profiles:user_id (email, full_name, age, gender, organization, social_media, city, state, country)`)
        .eq('status', 'approved')
        .not('actual_pull_up_count', 'is', null)
        .order('actual_pull_up_count', { ascending: false })
        .limit(5);
      if (!error && data) {
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
      }
    };
    fetchTopSubmissions();
  }, []);

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Top Performers</h2>
          <div className="w-20 h-1 bg-[#9b9b6f] mx-auto mt-4 mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Check out our current leaderboard champions. Will your name be on
            this list?
          </p>
        </div>
        <LeaderboardTable
          submissions={submissions}
          maxEntries={5}
          showPagination={false}
          showFilters={false}
        />
        <div className="text-center">
          <Button variant="secondary" size="lg">
            <Link href="/leaderboard" className="text-white">
              View Full Leaderboard
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;
