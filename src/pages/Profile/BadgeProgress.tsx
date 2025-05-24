import React from 'react';
import { calculateBadgeProgress, getBadgeRequirements } from '../../lib/badgeUtils';
import { Award, ChevronRight } from 'lucide-react';

interface BadgeProgressProps {
  pullUps: number;
}

const BadgeProgress: React.FC<BadgeProgressProps> = ({ pullUps }) => {
  const { currentBadge, nextBadge, progress, pullUpsNeeded } = calculateBadgeProgress(pullUps);

  return (
    <div className="bg-gray-950 p-6 rounded-lg">
      <div className="flex items-center mb-6">
        <Award className="w-6 h-6 text-[#9b9b6f] mr-2" />
        <h3 className="text-lg font-medium text-white">Badge Progress</h3>
      </div>

      <div className="space-y-6">
        {/* Current Badge */}
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {currentBadge ? (
              <img
                src={currentBadge.imageUrl}
                alt={currentBadge.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                <Award className="w-8 h-8 text-gray-600" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <p className="text-white font-medium">
              {currentBadge ? currentBadge.name : 'No Badge Yet'}
            </p>
            <p className="text-gray-400 text-sm">
              {currentBadge ? currentBadge.description : 'Complete your first submission'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {nextBadge && (
          <>
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress to {nextBadge.name}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-[#9b9b6f] h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Next Badge Requirements */}
            <div className="flex items-center bg-gray-900 rounded-lg p-4">
              <div className="flex-shrink-0">
                <img
                  src={nextBadge.imageUrl}
                  alt={nextBadge.name}
                  className="w-12 h-12 rounded-full opacity-50"
                />
              </div>
              <div className="ml-4">
                <p className="text-white font-medium flex items-center">
                  Next: {nextBadge.name}
                  <ChevronRight className="w-4 h-4 ml-1 text-[#9b9b6f]" />
                </p>
                <p className="text-gray-400 text-sm">
                  {pullUpsNeeded > 0
                    ? `${pullUpsNeeded} more pull-ups needed`
                    : getBadgeRequirements(nextBadge)}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Elite Badge Achievement */}
        {currentBadge && !nextBadge && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-center">
            <p className="text-red-200 font-medium">
              Congratulations! You've achieved Elite status!
            </p>
            <p className="text-red-300 text-sm mt-1">
              Keep pushing your limits and inspiring others.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeProgress; 