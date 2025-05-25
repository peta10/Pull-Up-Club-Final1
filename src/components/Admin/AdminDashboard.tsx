import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import AdminStats from './AdminStats';
import SubmissionReview from './SubmissionReview';
import UserManagement from './UserManagement';
import useAdmin from '../../hooks/useAdmin';
import { Alert } from '../ui/Alert';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('submissions');
  const { isAdmin, isLoading, error, stats, refreshStats } = useAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b9b6f]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error" description={error} />
    );
  }

  if (!isAdmin) {
    return (
      <Alert 
        variant="error"
        title="Access Denied" 
        description="You don't have permission to access the admin dashboard." 
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminStats stats={stats} onRefresh={refreshStats} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full mb-6">
          <TabsTrigger value="submissions" className="text-sm">
            Submissions {stats?.pendingSubmissions ? `(${stats.pendingSubmissions})` : ''}
          </TabsTrigger>
          <TabsTrigger value="users" className="text-sm">
            Users
          </TabsTrigger>
          <TabsTrigger value="badges" className="text-sm">
            Badges
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="submissions" className="space-y-6">
          <SubmissionReview />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="badges" className="space-y-6">
          <div className="p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Badge Management</h2>
            <p className="text-gray-400">
              Badge management functionality is under development.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;