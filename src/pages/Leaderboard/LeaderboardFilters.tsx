import React from 'react';
import { LeaderboardFilters as FiltersType } from '../../types';
import badges, { clubs, getAgeGroups, regions } from '../../data/mockData';

interface LeaderboardFiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: FiltersType) => void;
}

const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({ filters, onFilterChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const allowedRegions = [
    'North America',
    'South America',
    'Europe',
    'Asia',
    'Africa',
    'Australia/Oceania'
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h3 className="text-white text-lg font-medium mb-4 md:mb-0">Filter Leaderboard</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-[#9b9b6f] hover:text-[#7a7a58]"
        >
          Clear Filters
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Club</label>
          <select
            name="club"
            value={filters.club || ''}
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
          >
            <option value="">All Clubs</option>
            {clubs.map((club) => (
              <option key={club} value={club}>
                {club}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Region</label>
          <select
            name="region"
            value={filters.region || ''}
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
          >
            <option value="">All Regions</option>
            {allowedRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Age Group</label>
          <select
            name="ageGroup"
            value={filters.ageGroup || ''}
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
          >
            <option value="">All Ages</option>
            {getAgeGroups().map((ageGroup) => (
              <option key={ageGroup} value={ageGroup}>
                {ageGroup}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Gender</label>
          <select
            name="gender"
            value={filters.gender || ''}
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Badge</label>
          <select
            name="badge"
            value={filters.badge || ''}
            onChange={handleChange}
            className="w-full bg-gray-950 border border-gray-800 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
          >
            <option value="">All Badges</option>
            {badges.map((badge: any) => (
              <option key={badge.id} value={badge.id}>
                {badge.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardFilters;