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
          // Debug logs
          console.log('Submission data:', submission);
          console.log('Video URL:', submission.videoUrl);
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

              {/* Bottom Row: Badge and Video */}
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
                {/* Video Button */}
                <div className="text-right">
                  {submission.videoUrl ? (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Video</div>
                      <a
                        href={submission.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-[#9b9b6f] text-[#9b9b6f] hover:bg-[#9b9b6f] hover:text-black transition-colors"
                      >
                        View Video
                      </a>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Video</div>
                      <span className="text-gray-500 text-xs">Not available</span>
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
            <th className="px-6 py-3 text-center">Pull-Ups</th>
            <th className="px-6 py-3 text-center">Badge</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">VIDEO</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.map((submission, index) => {
            const rank = (currentPage - 1) * itemsPerPage + index + 1;
            const badges = getBadgesForSubmission(submission.actualPullUpCount ?? submission.pullUpCount);
            const highestBadge = badges.length > 0 ? badges[badges.length - 1] : null;
            // Debug logs
            console.log('Submission data:', submission);
            console.log('Video URL:', submission.videoUrl);
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
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-xl font-bold text-white">{submission.actualPullUpCount ?? submission.pullUpCount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-wrap gap-2 justify-center">
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
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  {submission.videoUrl ? (
                    <a
                      href={submission.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-[#9b9b6f] text-[#9b9b6f] hover:bg-[#9b9b6f] hover:text-black transition-colors"
                    >
                      View Video
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">No video</span>
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