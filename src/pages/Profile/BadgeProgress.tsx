import React from 'react';
import { calculateBadgeProgress } from '../../lib/badgeUtils';

interface BadgeProgressProps {
  pullUps: number;
}

const BadgeProgress: React.FC<BadgeProgressProps> = ({ pullUps }) => {
  const { currentBadge, nextBadge, progress } = calculateBadgeProgress(pullUps);
  const pullUpsNeeded = nextBadge ? nextBadge.pullUps - pullUps : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Badge Progress</h2>
      
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0 mr-4">
          <img
            className="w-24 h-24 object-contain"
            src={`/badges/${currentBadge.name.toLowerCase()}.png`}
            alt={`${currentBadge.name} Badge`}
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold">{currentBadge.name}</h3>
          <p className="text-gray-600">{currentBadge.description}</p>
        </div>
      </div>

      {nextBadge && (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{currentBadge.name}</span>
              <span>{nextBadge.name}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
              <img
                className="w-16 h-16 object-contain opacity-50"
                src={`/badges/${nextBadge.name.toLowerCase()}.png`}
                alt={`${nextBadge.name} Badge`}
              />
            </div>
            <div>
              <h4 className="font-medium">Next Badge: {nextBadge.name}</h4>
              <p className="text-sm text-gray-600">
                {pullUpsNeeded > 0
                  ? `${pullUpsNeeded} more pull-ups needed`
                  : nextBadge.description}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BadgeProgress; 