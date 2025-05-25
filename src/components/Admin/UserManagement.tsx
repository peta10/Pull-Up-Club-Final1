import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Search, User, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingState, ErrorState, EmptyState } from '../ui/LoadingState';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_paid: boolean;
  created_at: string;
  is_admin?: boolean;
}

const USERS_PER_PAGE = 10;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get users from profiles table
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (profilesError) throw profilesError;
        
        // Get admin roles
        const { data: adminRoles, error: adminError } = await supabase
          .from('admin_roles')
          .select('user_id');
          
        if (adminError) throw adminError;
        
        // Combine data
        const adminUserIds = new Set(adminRoles?.map(role => role.user_id) || []);
        
        const formattedUsers: UserProfile[] = (profiles || []).map(profile => ({
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          role: profile.role || 'user',
          is_paid: profile.is_paid || false,
          created_at: profile.created_at,
          is_admin: adminUserIds.has(profile.id)
        }));
        
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
        setTotalPages(Math.ceil(formattedUsers.length / USERS_PER_PAGE));
        
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      setTotalPages(Math.ceil(users.length / USERS_PER_PAGE));
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(term) || 
      (user.full_name && user.full_name.toLowerCase().includes(term))
    );
    
    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / USERS_PER_PAGE));
    setPage(1); // Reset to first page on new search
  }, [searchTerm, users]);

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('admin_roles')
          .delete()
          .eq('user_id', userId);
          
        if (error) throw error;
      } else {
        // Add admin role
        const { error } = await supabase
          .from('admin_roles')
          .insert({ user_id: userId });
          
        if (error) throw error;
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: !isCurrentlyAdmin } : user
      ));
      
      setFilteredUsers(filteredUsers.map(user => 
        user.id === userId ? { ...user, is_admin: !isCurrentlyAdmin } : user
      ));
      
    } catch (err) {
      console.error('Error toggling admin status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update admin status');
    }
  };

  const getCurrentPageUsers = () => {
    const startIndex = (page - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  };

  if (isLoading) {
    return <LoadingState message="Loading users..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (filteredUsers.length === 0) {
    return (
      <EmptyState 
        title="No users found" 
        message={searchTerm ? "No users match your search criteria." : "No users have signed up yet."} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border-none rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
          />
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {getCurrentPageUsers().map((user) => (
                <tr key={user.id} className="hover:bg-gray-750">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <User size={16} className="text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.full_name || 'No name provided'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_admin 
                        ? 'bg-purple-900 text-purple-300' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_paid
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {user.is_paid ? 'Paid' : 'Free'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${
                        user.is_admin
                          ? 'border-red-800 text-red-400 hover:bg-red-900/20'
                          : 'border-green-800 text-green-400 hover:bg-green-900/20'
                      }`}
                      onClick={() => handleToggleAdmin(user.id, !!user.is_admin)}
                    >
                      {user.is_admin ? (
                        <>
                          <Lock size={14} className="mr-1" />
                          Remove Admin
                        </>
                      ) : (
                        <>
                          <Unlock size={14} className="mr-1" />
                          Make Admin
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
            <div className="flex items-center">
              <p className="text-sm text-gray-400">
                Showing <span className="font-medium">{(page - 1) * USERS_PER_PAGE + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * USERS_PER_PAGE, filteredUsers.length)}
                </span>{' '}
                of <span className="font-medium">{filteredUsers.length}</span> users
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </Button>
              
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;