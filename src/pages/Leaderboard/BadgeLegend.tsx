import React, { useState } from "react";
import badges from "../../data/mockData";
import { ChevronDown, ChevronUp, Award } from "lucide-react";

const BadgeLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg mb-6">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <Award size={20} className="text-[#9b9b6f] mr-2" />
          <h3 className="text-white text-lg font-medium">Badge Legend</h3>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {badges.map((badge: any) => (
            <div
              key={badge.id}
              className="flex flex-col items-center text-center"
            >
              <img
                src={badge.imageUrl}
                alt={badge.name}
                className="h-16 w-16 rounded-full mb-2"
              />
              <h4 className="text-[#9b9b6f] font-bold">{badge.name}</h4>
              <p className="text-gray-400 text-sm">{badge.description}</p>
              <div className="mt-2 text-white text-xs">
                {badge.criteria.type === "pullUps" && (
                  <span>Requires {badge.criteria.value} pull-ups</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isExpanded && (
        <p className="text-gray-400 text-sm mt-2">
          Click to learn about our badge system and what each badge represents.
        </p>
      )}
    </div>
  );
};

export default BadgeLegend;
