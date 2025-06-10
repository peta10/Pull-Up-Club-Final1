import React from "react";
import { Button } from "../../components/ui/Button";
import { Link } from "../../components/ui/Link";
import { mockSubmissions, getBadgesForSubmission } from "../../data/mockData";

const LeaderboardPreview: React.FC = () => {
  // Take top 5 submissions for preview
  const topSubmissions = mockSubmissions
    .filter((submission) => submission.status === "Approved")
    .sort((a, b) => b.pullUpCount - a.pullUpCount)
    .slice(0, 5);

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

        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-800 text-gray-400 text-left text-sm uppercase">
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Region</th>
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3">Pull-Ups</th>
                  <th className="px-6 py-3">Badges</th>
                  <th className="px-6 py-3">Social</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {topSubmissions.map((submission, index) => {
                  const badges = getBadgesForSubmission(submission.pullUpCount);

                  return (
                    <tr
                      key={submission.id}
                      className="bg-gray-900 hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-[#9b9b6f]">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white font-medium">
                          {submission.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-300">{submission.region}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-400">
                            {submission.clubAffiliation}
                          </div>
                          <div className="text-gray-500">
                            {submission.age} years • {submission.gender}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xl font-bold text-white">
                          {submission.pullUpCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {badges.map((badge) => (
                            <img
                              key={badge.id}
                              src={badge.imageUrl}
                              alt={badge.name}
                              title={badge.name}
                              className="h-20 w-20 rounded-full object-cover"
                            />
                          ))}
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
                })}
              </tbody>
            </table>
          </div>
        </div>

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
