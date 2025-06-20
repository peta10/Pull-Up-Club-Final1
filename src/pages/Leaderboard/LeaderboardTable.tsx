import React, { useState } from "react";
import { Submission } from "../../types";
import { getBadgesForSubmission } from "../../data/mockData";
import LeaderboardFilters from "../../pages/Leaderboard/LeaderboardFilters";
import { Button } from "../../components/ui/Button";

interface LeaderboardTableProps {
  submissions: Submission[];
  showPagination?: boolean;
  maxEntries?: number;
  showFilters?: boolean;
  filters?: any;
  onFilterChange?: (filters: any) => void;
}

const PAGE_SIZE = 20;

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  submissions,
  showPagination = false,
  maxEntries,
  showFilters = false,
  filters = {},
  onFilterChange,
}) => {
  const [page, setPage] = useState(1);

  // Filtering logic (if filters are provided)
  let filtered = submissions;
  if (filters) {
    if (filters.club) filtered = filtered.filter(s => s.clubAffiliation === filters.club);
    if (filters.region) filtered = filtered.filter(s => s.region === filters.region);
    if (filters.gender) filtered = filtered.filter(s => s.gender === filters.gender);
    if (filters.ageGroup) {
      if (filters.ageGroup.includes('+')) {
        const min = parseInt(filters.ageGroup, 10);
        filtered = filtered.filter(s => s.age >= min);
      } else {
        const [min, max] = filters.ageGroup.split("-").map(Number);
        filtered = filtered.filter(s => s.age >= min && (max ? s.age <= max : true));
      }
    }
    if (filters.badge) {
      filtered = filtered.filter(s => getBadgesForSubmission(s.actualPullUpCount ?? s.pullUpCount).some(b => b.id === filters.badge));
    }
  }

  // Sort by pull-up count DESC, then approvedAt ASC
  filtered = [...filtered].sort((a, b) => {
    const aCount = a.actualPullUpCount ?? a.pullUpCount;
    const bCount = b.actualPullUpCount ?? b.pullUpCount;
    if (aCount !== bCount) return bCount - aCount;
    if (a.approvedAt && b.approvedAt) return new Date(a.approvedAt).getTime() - new Date(b.approvedAt).getTime();
    return 0;
  });

  // Pagination logic
  const totalEntries = filtered.length;
  const totalPages = showPagination ? Math.ceil(totalEntries / PAGE_SIZE) : 1;
  const paginated = showPagination
    ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filtered;
  const display = maxEntries ? paginated.slice(0, maxEntries) : paginated;

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl mb-8">
      {showFilters && onFilterChange && (
        <LeaderboardFilters filters={filters} onFilterChange={onFilterChange} />
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-800 text-gray-400 text-left text-sm uppercase">
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Club</th>
              <th className="px-6 py-3">Region</th>
              <th className="px-6 py-3">Details</th>
              <th className="px-6 py-3">Pull-Ups</th>
              <th className="px-6 py-3">Badge</th>
              <th className="px-6 py-3">Social</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {display.map((submission, index) => {
              const rank = (showPagination ? (page - 1) * PAGE_SIZE : 0) + index + 1;
              const badges = getBadgesForSubmission(submission.actualPullUpCount ?? submission.pullUpCount);
              // Only show the highest badge earned
              const highestBadge = badges.length > 0 ? badges[badges.length - 1] : null;
              return (
                <tr key={submission.id} className="bg-gray-900 hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-[#9b9b6f]">{rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">{submission.fullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-300">{submission.clubAffiliation || 'None'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-300">{submission.region}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-500">{submission.age} years • {submission.gender}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xl font-bold text-white">{submission.actualPullUpCount ?? submission.pullUpCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {highestBadge ? (
                        <img
                          key={highestBadge.id}
                          src={highestBadge.imageUrl}
                          alt={highestBadge.name}
                          title={highestBadge.name}
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.socialHandle ? (
                      <a
                        href={`https://instagram.com/${submission.socialHandle.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#9b9b6f] hover:text-[#7a7a58] flex items-center"
                      >
                        @{submission.socialHandle.replace(/^@/, "")}
                      </a>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center py-4 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <span className="text-gray-300 px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;
