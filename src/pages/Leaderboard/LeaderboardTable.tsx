import React, { useState } from "react";
import {
  Submission,
  LeaderboardFilters,
  Badge as BadgeType,
} from "../../types";
import { Badge } from "../../components/ui/Badge";
import { getBadgesForSubmission, badges } from "../../data/mockData";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  Info,
} from "lucide-react";

interface LeaderboardTableProps {
  submissions: Submission[];
  filters: LeaderboardFilters;
}

interface GroupedSubmissions {
  [key: number]: Submission[];
}

interface BadgeTooltipProps {
  badge: BadgeType;
  currentPullUps: number;
}

const BadgeTooltip: React.FC<BadgeTooltipProps> = ({
  badge,
  currentPullUps,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Get next badge threshold if exists
  const badgeIndex = badges.findIndex((b) => b.id === badge.id);
  const nextBadge =
    badgeIndex < badges.length - 1 ? badges[badgeIndex + 1] : null;
  const nextThreshold = nextBadge?.criteria.value as number;

  // Calculate progress percentage if next badge exists
  let progressPercentage = 100;
  let repsToNextBadge = 0;

  if (nextBadge) {
    const currentThreshold = badge.criteria.value as number;
    const range = nextThreshold - currentThreshold;
    const progress = currentPullUps - currentThreshold;
    progressPercentage = Math.min(Math.floor((progress / range) * 100), 100);
    repsToNextBadge = Math.max(0, nextThreshold - currentPullUps);
  }

  return (
    <div className="relative inline-block">
      <div
        className="group flex items-center cursor-pointer"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <img
          src={badge.imageUrl}
          alt={badge.name}
          className="h-20 w-20 rounded-full object-cover transition-transform group-hover:scale-105"
        />
        <Info
          size={16}
          className="absolute bottom-0 right-0 text-gray-400 bg-gray-900 rounded-full p-1"
        />
      </div>

      {isVisible && (
        <div className="absolute z-10 w-64 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-4 transform -translate-x-1/2 left-1/2">
          <div className="text-center mb-2">
            <h3 className="text-[#9b9b6f] font-bold">{badge.name}</h3>
            <p className="text-gray-400 text-sm">{badge.description}</p>
          </div>

          {nextBadge ? (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{badge.name}</span>
                <span>{nextBadge.name}</span>
              </div>
              <div className="h-2 w-full bg-gray-800 rounded-full">
                <div
                  className="h-2 bg-[#9b9b6f] rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-2 text-center text-sm text-gray-400">
                {repsToNextBadge > 0 ? (
                  <span>{repsToNextBadge} more pull-ups for next badge</span>
                ) : (
                  <span>Badge achieved!</span>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-2 text-center text-sm flex items-center justify-center text-[#9b9b6f]">
              <Award size={16} className="mr-1" />
              <span>Highest badge achieved!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  submissions,
  filters,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: number]: boolean;
  }>({});

  const highestSubmissions = submissions.reduce((acc: Submission[], curr) => {
    const existingSubmission = acc.find((s) => s.email === curr.email);
    if (!existingSubmission) {
      acc.push(curr);
    } else {
      const existingCount =
        existingSubmission.actualPullUpCount ?? existingSubmission.pullUpCount;
      const currentCount = curr.actualPullUpCount ?? curr.pullUpCount;
      if (currentCount > existingCount) {
        const index = acc.indexOf(existingSubmission);
        acc[index] = curr;
      }
    }
    return acc;
  }, []);

  const filteredSubmissions = highestSubmissions.filter((submission) => {
    if (filters.club && submission.clubAffiliation !== filters.club)
      return false;

    if (filters.gender && submission.gender !== filters.gender) return false;

    if (filters.region && submission.region !== filters.region) return false;

    if (filters.ageGroup) {
      const ageGroups = {
        "Under 18": [0, 17],
        "18-24": [18, 24],
        "25-29": [25, 29],
        "30-39": [30, 39],
        "40-49": [40, 49],
        "50+": [50, 200],
      };

      if (typeof submission.age === "undefined") return false;

      const [min, max] = ageGroups[filters.ageGroup as keyof typeof ageGroups];
      if (submission.age < min || submission.age > max) return false;
    }

    if (filters.badge) {
      const userBadges = getBadgesForSubmission(submission);
      if (!userBadges.some((badge) => badge.id === filters.badge)) return false;
    }

    return true;
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    const aCount = a.actualPullUpCount ?? a.pullUpCount;
    const bCount = b.actualPullUpCount ?? b.pullUpCount;

    if (bCount !== aCount) {
      return bCount - aCount;
    }
    return (
      new Date(b.submissionDate).getTime() -
      new Date(a.submissionDate).getTime()
    );
  });

  const groupedSubmissions: GroupedSubmissions = sortedSubmissions.reduce(
    (acc, submission) => {
      const count = submission.actualPullUpCount ?? submission.pullUpCount;
      if (!acc[count]) {
        acc[count] = [];
      }
      acc[count].push(submission);
      return acc;
    },
    {} as GroupedSubmissions
  );

  const groupsArray = Object.entries(groupedSubmissions)
    .map(([pullUpCount, submissions]) => ({
      pullUpCount: Number(pullUpCount),
      submissions,
    }))
    .sort((a, b) => b.pullUpCount - a.pullUpCount);

  const toggleGroup = (pullUpCount: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [pullUpCount]: !prev[pullUpCount],
    }));
  };

  if (sortedSubmissions.length === 0) {
    return (
      <div className="bg-gray-900 p-8 rounded-lg text-center">
        <h3 className="text-white text-xl mb-2">
          No matching submissions found
        </h3>
        <p className="text-gray-400">
          Try adjusting your filters or check back later for new submissions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-950 text-gray-400 text-left text-sm uppercase">
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Region</th>
              <th className="px-6 py-3">Details</th>
              <th className="px-6 py-3">Pull-Ups</th>
              <th className="px-6 py-3">Badge & Progress</th>
              <th className="px-6 py-3">Social</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {groupsArray.map((group, groupIndex) => {
              const isExpanded = expandedGroups[group.pullUpCount];
              const showSubmissions =
                group.submissions.length === 1 || isExpanded;
              const currentRank =
                groupsArray
                  .slice(0, groupIndex)
                  .reduce((sum, g) => sum + g.submissions.length, 0) + 1;

              return (
                <React.Fragment key={group.pullUpCount}>
                  {group.submissions.length > 1 && (
                    <tr
                      className="bg-gray-950 cursor-pointer hover:bg-gray-900 transition-colors"
                      onClick={() => toggleGroup(group.pullUpCount)}
                    >
                      <td colSpan={7} className="px-6 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="font-bold text-[#9b9b6f] mr-2">
                              {currentRank}-
                              {currentRank + group.submissions.length - 1}
                            </span>
                            <span className="text-white">
                              {group.submissions.length} athletes with{" "}
                              {group.pullUpCount} pull-ups
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={20} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {showSubmissions &&
                    group.submissions.map(
                      (submission: Submission, index: number) => {
                        const badges = getBadgesForSubmission(submission);
                        const rank =
                          group.submissions.length > 1
                            ? currentRank + index
                            : currentRank;
                        const pullUpCount =
                          submission.actualPullUpCount ??
                          submission.pullUpCount;

                        return (
                          <tr
                            key={submission.id}
                            className="bg-gray-900 hover:bg-gray-950 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-2xl font-bold text-[#9b9b6f]">
                                  {rank}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-white font-medium">
                                {submission.fullName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-300">
                                {submission.region}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <div className="text-gray-400">
                                  {submission.clubAffiliation || "No Club"}
                                </div>
                                <div className="text-gray-500">
                                  {submission.age} years • {submission.gender}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xl font-bold text-white">
                                {pullUpCount}
                              </div>
                              {submission.actualPullUpCount !== undefined &&
                                submission.actualPullUpCount !==
                                  submission.pullUpCount && (
                                  <div className="text-sm text-gray-400">
                                    Claimed: {submission.pullUpCount}
                                  </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-2">
                                {badges.map((badge) => (
                                  <BadgeTooltip
                                    key={badge.id}
                                    badge={badge}
                                    currentPullUps={pullUpCount}
                                  />
                                ))}
                                {badges.length === 0 && (
                                  <div className="text-gray-500">
                                    No badges yet
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {submission.socialHandle ? (
                                <a
                                  href={`https://instagram.com/${submission.socialHandle}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#9b9b6f] hover:text-[#7a7a58] flex items-center"
                                >
                                  @{submission.socialHandle}
                                </a>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
