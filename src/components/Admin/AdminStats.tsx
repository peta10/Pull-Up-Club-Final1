import React from 'react';
import { RefreshCw, Users, Award, FileCheck, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface StatsProps {
  totalUsers?: number;
  paidUsers?: number;
  pendingSubmissions?: number;
  approvedSubmissions?: number;
  rejectedSubmissions?: number;
}

interface AdminStatsProps {
  stats: StatsProps | null;
  onRefresh?: () => void;
  className?: string;
}

const AdminStats: React.FC<AdminStatsProps> = ({ 
  stats, 
  onRefresh, 
  className = '' 
}) => {
  const refreshStats = () => {
    if (onRefresh) onRefresh();
  };

  const statsItems = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <Users className="h-5 w-5 text-blue-400" />,
      color: 'bg-blue-900/20 border-blue-800',
    },
    {
      label: 'Paid Users',
      value: stats?.paidUsers || 0,
      icon: <Award className="h-5 w-5 text-green-400" />,
      color: 'bg-green-900/20 border-green-800',
    },
    {
      label: 'Pending Submissions',
      value: stats?.pendingSubmissions || 0,
      icon: <FileCheck className="h-5 w-5 text-yellow-400" />,
      color: 'bg-yellow-900/20 border-yellow-800',
    },
    {
      label: 'Approved Submissions',
      value: stats?.approvedSubmissions || 0,
      icon: <Check className="h-5 w-5 text-green-400" />,
      color: 'bg-green-900/20 border-green-800',
    },
    {
      label: 'Rejected Submissions',
      value: stats?.rejectedSubmissions || 0,
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      color: 'bg-red-900/20 border-red-800',
    },
  ];

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
        <Button 
          onClick={refreshStats} 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-1"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsItems.map((item, index) => (
          <div key={index} className={`p-4 rounded-lg ${item.color} border`}>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-white">{item.value.toLocaleString()}</div>
              {item.icon}
            </div>
            <div className="text-sm text-gray-400 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminStats;