import React from "react";
import { Submission } from "../../types";
import { getBadgesForSubmission } from "../../data/mockData";

interface LeaderboardTableProps {
  data: Submission[];
  loading?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  showFilters?: boolean;
  filters?: any;
  onFilterChange?: (filters: any) => void;
  mobileCardMode?: boolean;
}

const PAGE_SIZE = 20;

const InstagramIcon = () => (
  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.258-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  data,
  loading = false,
  currentPage = 1,
  itemsPerPage = PAGE_SIZE,
  mobileCardMode = false,
}) => {
  if (loading) {
    return <div className="text-center text-white py-8">Loading...</div>;
  }

  // Enhanced Card layout for mobile
  if (mobileCardMode) {
    return (
      <div className="divide-y divide-gray-700">
        {data.map((submission, index) => {
          const rank = (currentPage - 1) * itemsPerPage + index + 1;
          const badges = getBadgesForSubmission(submission.actualPullUpCount ?? submission.pullUpCount);
          const highestBadge = badges.length > 0 ? badges[badges.length - 1] : null;
          return (
            <div key={submission.id} className="p-5 bg-gray-900 hover:bg-gray-800 transition-colors rounded-xl mb-4 shadow-lg">
              {/* Top Row: Rank, Name, Pull-ups */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#9b9b6f] rounded-full h-12 w-12 flex items-center justify-center">
                    <span className="text-xl font-bold text-black">#{rank}</span>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{submission.fullName}</div>
                    <div className="text-sm text-gray-400">
                      {submission.age} years • {submission.gender}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#9b9b6f]">
                    {submission.actualPullUpCount ?? submission.pullUpCount}
                  </div>
                  <div className="text-sm text-gray-400 font-medium">Pull-ups</div>
                </div>
              </div>

              {/* Middle Row: Club and Region */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-6">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Club</div>
                    <div className="text-white font-medium">{submission.clubAffiliation || 'Independent'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Region</div>
                    <div className="text-white font-medium">{submission.region}</div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Badge and Social */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Achievement</div>
                    {highestBadge ? (
                      <div className="flex items-center space-x-2">
                        <img
                          src={highestBadge.imageUrl}
                          alt={highestBadge.name}
                          title={highestBadge.name}
                          className="h-16 w-16 rounded-full object-cover border-2 border-[#9b9b6f]"
                          onError={(e) => {
                            console.log('Badge failed to load:', highestBadge.imageUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="text-white font-medium text-sm">{highestBadge.name}</div>
                          <div className="text-gray-400 text-xs">Badge Earned</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="h-16 w-16 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Badge</span>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">No Badge Yet</div>
                          <div className="text-gray-500 text-xs">Keep Training!</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Social Handle */}
                <div className="text-right">
                  {submission.socialHandle ? (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Follow</div>
                      <a
                        href={`https://instagram.com/${submission.socialHandle.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#9b9b6f] hover:text-[#7a7a58] font-medium inline-flex items-center space-x-1"
                      >
                        <span>@{submission.socialHandle.replace(/^@/, "")}</span>
                        <InstagramIcon />
                      </a>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Social</div>
                      <span className="text-gray-500 text-sm">Not provided</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Table layout for desktop
  return (
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
          {data.map((submission, index) => {
            const rank = (currentPage - 1) * itemsPerPage + index + 1;
            const badges = getBadgesForSubmission(submission.actualPullUpCount ?? submission.pullUpCount);
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
  );
};

export default LeaderboardTable; 