import React from 'react';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { Submission } from '../../types';
import { mockSubmissions } from '../../data/mockData';

interface RankingsTabProps {
  userEmail: string;
}

const RankingsTab: React.FC<RankingsTabProps> = ({ userEmail }) => {
  // Get all approved submissions and sort by actual count
  const approvedSubmissions = mockSubmissions
    .filter(sub => sub.status === 'Approved')
    .sort((a, b) => {
      const aCount = a.actualPullUpCount ?? a.pullUpCount;
      const bCount = b.actualPullUpCount ?? b.pullUpCount;
      return bCount - aCount;
    });

  // Find user's position
  const userIndex = approvedSubmissions.findIndex(sub => sub.email === userEmail);
  
  if (userIndex === -1) {
    return (
      <div className="bg-gray-950 p-6 rounded-lg text-center">
        <Trophy className="w-12 h-12 text-[#9b9b6f] mx-auto mb-4" />
        <h3 className="text-white text-lg font-medium mb-2">Not Yet Ranked</h3>
        <p className="text-gray-400">
          Submit your first video to appear on the global leaderboard!
        </p>
      </div>
    );
  }

  // Get surrounding competitors (3 above and 3 below)
  const start = Math.max(0, userIndex - 3);
  const end = Math.min(approvedSubmissions.length, userIndex + 4);
  const relevantSubmissions = approvedSubmissions.slice(start, end);

  return (
    <div className="space-y-6">
      <div className="bg-gray-950 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Trophy className="w-6 h-6 text-[#9b9b6f] mr-2" />
            <h3 className="text-lg font-medium text-white">Your Global Ranking</h3>
          </div>
          <span className="text-3xl font-bold text-[#9b9b6f]">#{userIndex + 1}</span>
        </div>

        <div className="space-y-4">
          {relevantSubmissions.map((submission, index) => {
            const isUser = submission.email === userEmail;
            const actualCount = submission.actualPullUpCount ?? submission.pullUpCount;
            const position = start + index + 1;
            
            return (
              <div 
                key={submission.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  isUser ? 'bg-[#9b9b6f] bg-opacity-20' : 'bg-gray-900'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`text-lg font-bold ${
                    isUser ? 'text-[#9b9b6f]' : 'text-gray-400'
                  }`}>
                    #{position}
                  </span>
                  <div>
                    <p className={`font-medium ${
                      isUser ? 'text-white' : 'text-gray-300'
                    }`}>
                      {submission.fullName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {submission.clubAffiliation || 'No Club'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {position < userIndex + 1 && (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  )}
                  {position > userIndex + 1 && (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-xl font-bold text-white">
                    {actualCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RankingsTab;