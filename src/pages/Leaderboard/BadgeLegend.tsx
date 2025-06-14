import React from "react";
import badges from "../../data/mockData";
import { Award } from "lucide-react";

const BadgeLegend: React.FC = () => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg mb-6">
      <div className="flex items-center mb-4">
        <Award size={20} className="text-[#9b9b6f] mr-2" />
        <h3 className="text-white text-lg font-medium">Badge Legend</h3>
      </div>
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
            <span className="text-white font-bold text-sm mt-1">{badge.criteria.value} Pull-Ups Required</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeLegend;
