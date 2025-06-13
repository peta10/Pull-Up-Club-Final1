import React, { useState } from 'react';
import Layout from "../../components/Layout/Layout";
import BadgeLegend from "./BadgeLegend";
import LeaderboardTable from "../../components/Leaderboard/LeaderboardTable";
import { LeaderboardFilters as FiltersType } from "../../types";
import { LoadingState, ErrorState } from '../../components/ui/LoadingState';
import { useTranslation } from 'react-i18next';
import { useLeaderboard } from '../../hooks/useLeaderboard';

// PaginationControls component
const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
      }
    }
    return pages;
  };
  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      {getPageNumbers().map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            pageNumber === currentPage
              ? 'bg-[#918f6f] text-black'
              : 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600'
          }`}
        >
          {pageNumber}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

const LeaderboardPage: React.FC = () => {
  const { leaderboardData, isLoading, error } = useLeaderboard();
  const [filters, setFilters] = useState<FiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { t } = useTranslation('leaderboard');

  // Filtering logic (client-side, same as before)
  let filtered = leaderboardData;
  if (filters) {
    if (filters.club) filtered = filtered.filter(s => s.clubAffiliation === filters.club);
    if (filters.region) filtered = filtered.filter(s => s.region === filters.region);
    if (filters.gender) filtered = filtered.filter(s => s.gender === filters.gender);
    if (filters.ageGroup) {
      const [min, max] = filters.ageGroup.split("-").map(Number);
      filtered = filtered.filter(s => s.age >= min && (max ? s.age <= max : true));
    }
    if (filters.badge) {
      // You may want to use your badge logic here
      // For now, just filter by badge id if available
      // (Assume getBadgesForSubmission is available in scope if needed)
    }
  }
  // Sort by pull-up count DESC, then approvedAt ASC
  filtered = [...filtered].sort((a, b) => {
    const aCount = a.actualPullUpCount ?? a.pullUpCount;
    const bCount = b.actualPullUpCount ?? b.pullUpCount;
    if (aCount !== bCount) return bCount - aCount;
    if (a.approvedAt && b.approvedAt) return new Date(a.approvedAt).getTime() - new Date(b.approvedAt).getTime();
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  if (isLoading) return <LoadingState message={t('loading')} />;
  if (error) return <ErrorState message={error} />;

  return (
    <Layout>
      <div className="bg-black py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <img src="/PUClogo (1).webp" alt="Pull-Up Club Logo" className="h-10 w-auto mr-3" />
            <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
          </div>
          <div className="text-center mb-8">
            <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
          <BadgeLegend />
          <LeaderboardTable
            data={currentItems}
            loading={isLoading}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalUsers={filtered.length}
            showFilters={true}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
