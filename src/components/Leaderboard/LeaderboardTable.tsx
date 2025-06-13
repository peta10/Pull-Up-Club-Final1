import React from "react";
import { Submission } from "../../types";
import { getBadgesForSubmission } from "../../data/mockData";
import LeaderboardFilters from "../../pages/Leaderboard/LeaderboardFilters";

interface LeaderboardTableProps {
  data: Submission[];
  loading?: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalUsers: number;
  showFilters?: boolean;
  filters?: any;
  onFilterChange?: (filters: any) => void;
  maxEntries?: number; // for preview
  isPreview?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  data,
  loading = false,
  currentPage,
  itemsPerPage,
  totalUsers,
  showFilters = false,
  filters = {},
  onFilterChange,
  maxEntries,
  isPreview = false,
}) => {
  // Calculate display indices
  const startIndex = isPreview ? 1 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = isPreview ? data.length : Math.min(currentPage * itemsPerPage, totalUsers);
  const display = maxEntries ? data.slice(0, maxEntries) : data;

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl mb-8">
      {showFilters && onFilterChange && (
        <div className="mb-2">
          <LeaderboardFilters filters={filters} onFilterChange={onFilterChange} />
        </div>
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
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                  Loading leaderboard...
                </td>
              </tr>
            ) : (
              display.map((submission, index) => {
                const rank = startIndex + index;
                const badges = getBadgesForSubmission(submission.actualPullUpCount ?? submission.pullUpCount, submission.gender);
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
                            className="h-20 w-20 rounded-full object-cover"
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
              })
            )}
          </tbody>
        </table>
      </div>
      {!isPreview && (
        <div className="px-6 py-3 bg-gray-800 border-t border-gray-700">
          <p className="text-sm text-gray-300">
            Showing {startIndex}-{endIndex} of {totalUsers} users
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable; 