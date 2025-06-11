import React, { useState } from "react";
import {
  Submission,
  LeaderboardFilters,
  Badge,
} from "../../types/index";
import { getBadgesForSubmission } from "../../data/mockData";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface LeaderboardTableProps {
  submissions: Submission[];
  filters: LeaderboardFilters;
}

interface GroupedSubmissions {
  [key: number]: Submission[];
}

interface BadgeTooltipProps {
  badge: Badge;
  currentPullUps: number;
}

const BadgeTooltip: React.FC<BadgeTooltipProps> = ({ badge, currentPullUps }) => {
  const allBadges = getBadgesForSubmission(currentPullUps);
  const badgeIndex = allBadges.findIndex((b) => b.id === badge.id);
  const nextBadge =
    badgeIndex < allBadges.length - 1 ? allBadges[badgeIndex + 1] : null;

  return (
    <div className="absolute z-10 w-64 p-4 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center mb-2">
        <img
          src={badge.imageUrl}
          alt={badge.name}
          className="w-8 h-8 mr-2"
        />
        <h4 className="font-semibold">{badge.name}</h4>
      </div>
      <p className="text-sm text-gray-300 mb-2">{badge.description}</p>
      {nextBadge && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className="text-sm text-gray-400">
            Next Badge: {nextBadge.name} ({nextBadge.criteria.value} pull-ups)
          </p>
          <div className="mt-2 h-2 bg-gray-700 rounded-full">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (currentPullUps / nextBadge.criteria.value) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  submissions,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: "pullUpCount",
    direction: "desc",
  });
  const [hoveredBadge, setHoveredBadge] = useState<{
    badge: Badge;
    pullUps: number;
  } | null>(null);

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  // Sort by pullUpCount DESC, then approvedAt ASC (for tie-breaker)
  const sortedSubmissions = [...submissions].sort((a, b) => {
    const aCount = a.actualPullUpCount ?? a.pullUpCount;
    const bCount = b.actualPullUpCount ?? b.pullUpCount;
    if (aCount !== bCount) {
      return sortConfig.direction === "asc"
        ? aCount - bCount
        : bCount - aCount;
    }
    // Tie-breaker: earlier approvedAt wins
    if (a.approvedAt && b.approvedAt) {
      return new Date(a.approvedAt).getTime() - new Date(b.approvedAt).getTime();
    }
    return 0;
  });

  // Assign ranks (ties share the same rank, next rank skips accordingly)
  let lastCount: number | null = null;
  let lastRank = 0;
  let skip = 1;
  const rankedSubmissions = sortedSubmissions.map((submission, idx) => {
    const count = submission.actualPullUpCount ?? submission.pullUpCount;
    let rank = lastRank + skip;
    if (lastCount !== null && count === lastCount) {
      rank = lastRank;
      skip += 1;
    } else {
      skip = 1;
    }
    lastCount = count;
    lastRank = rank;
    return { ...submission, rank };
  });

  const renderBadges = (submission: Submission) => {
    const badges = getBadgesForSubmission(submission.actualPullUpCount ?? submission.pullUpCount);
    return (
      <div className="flex items-center space-x-2">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="relative"
            onMouseEnter={() =>
              setHoveredBadge({ badge, pullUps: submission.actualPullUpCount ?? submission.pullUpCount })
            }
            onMouseLeave={() => setHoveredBadge(null)}
          >
            <img
              src={badge.imageUrl}
              alt={badge.name}
              className="w-6 h-6"
            />
            {hoveredBadge?.badge.id === badge.id && (
              <BadgeTooltip
                badge={badge}
                currentPullUps={hoveredBadge.pullUps}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("rank")}
            >
              <div className="flex items-center">
                Rank
                {getSortIcon("rank")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Club
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("pullUpCount")}
            >
              <div className="flex items-center">
                Pull-ups
                {getSortIcon("pullUpCount")}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Badges
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {rankedSubmissions.map((submission, index) => (
            <tr
              key={submission.id}
              className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-850"}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {submission.rank}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-200">
                    {submission.fullName}
                  </div>
                  {submission.socialHandle && (
                    <div className="text-xs text-blue-400 ml-2">
                      <a href={`https://instagram.com/${submission.socialHandle.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer">
                        @{submission.socialHandle}
                      </a>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {submission.clubAffiliation}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-200">
                  {submission.pullUpCount}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {renderBadges(submission)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
