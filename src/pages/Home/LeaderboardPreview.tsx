import React from "react";
import { Button } from "../../components/ui/Button";
import { Link } from "../../components/ui/Link";
import LeaderboardTable from "../../components/Leaderboard/LeaderboardTable";
import { useLeaderboard } from '../../hooks/useLeaderboard';

const LeaderboardPreview: React.FC = () => {
  const { leaderboardData, isLoading } = useLeaderboard(5);

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
          data={leaderboardData}
          loading={isLoading}
          currentPage={1}
          itemsPerPage={5}
          totalUsers={leaderboardData.length}
          maxEntries={5}
          isPreview={true}
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
