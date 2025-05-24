import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import LeaderboardFilters from "./LeaderboardFilters";
import LeaderboardTable from "./LeaderboardTable";
import BadgeLegend from "./BadgeLegend";
import { mockSubmissions } from "../../data/mockData";
import { LeaderboardFilters as FiltersType } from "../../types";

const LeaderboardPage: React.FC = () => {
  const [filters, setFilters] = useState<FiltersType>({});

  // Only show approved submissions
  const approvedSubmissions = mockSubmissions.filter(
    (submission) => submission.status === "Approved" && submission.featured
  );

  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
  };

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
            submissions={approvedSubmissions}
            filters={filters}
          />
        </div>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
