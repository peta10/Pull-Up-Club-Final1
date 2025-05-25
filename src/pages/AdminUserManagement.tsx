import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout.tsx";
import { Users, ArrowLeft, Lock, Unlock } from "lucide-react";
import { Button } from "../components/ui/Button.tsx";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.ts";
import { adminApi } from "../utils/edgeFunctions.ts";
import { Alert } from "../components/ui/Alert";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_paid: boolean;
  created_at: string;
  is_admin?: boolean;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{
    userId: string;
    action: "admin_add" | "admin_remove" | "delete";
    status: "processing" | "success" | "error";
    message?: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    console.log("fetchUsers called");
    setIsLoading(true);
    setError(null);
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Authentication error: ' + sessionError.message);
      }

      if (!session) {
        throw new Error('No active session found');
      }

      // Check if user is admin first
      const { data: adminCheck, error: adminError } = await supabase
        .from('admin_roles')
        .select('user_id')
        .eq('user_id', session.user.id);

      if (adminError) {
        console.error('Admin check error:', adminError);
        throw new Error('Error checking admin permissions');
      }

      if (!adminCheck || adminCheck.length === 0) {
        throw new Error('Unauthorized: Admin access required');
      }

      const functionUrl = `${
        import.meta.env.VITE_SUPABASE_URL ||
        "https://yqnikgupiaghgjtsaypr.supabase.co"
      }/functions/v1/admin-get-users`;
      console.log("Fetching from URL:", functionUrl);

      const response = await fetch(functionUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });
      console.log("Fetch response status:", response.status);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        console.error("Fetch error data:", errorData);
        
        // If unauthorized, redirect to dashboard
        if (response.status === 403) {
          navigate('/dashboard');
          throw new Error('You do not have admin access');
        }
        
        throw new Error(
          errorData.message ||
            `Failed to fetch users. Status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Fetch result:", result);

      if (result.users) {
        // Get admin roles to determine which users are admins
        const { data: adminRoles, error: adminRolesError } = await supabase
          .from('admin_roles')
          .select('user_id');
        
        if (adminRolesError) {
          console.error('Error fetching admin roles:', adminRolesError);
          throw new Error('Error fetching admin status');
        }

        const adminUserIds = new Set((adminRoles || []).map(role => role.user_id));

        const fetchedUsers: User[] = result.users.map((profile: any) => ({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          is_paid: profile.is_paid,
          created_at: profile.created_at,
          is_admin: adminUserIds.has(profile.id)
        }));
        console.log("Mapped users:", fetchedUsers);
        setUsers(fetchedUsers);
        if (fetchedUsers.length === 0) {
          setError("No users found in the system.");
        }
      } else if (result.error) {
        console.error("Error from function:", result.error);
        setError(`Error: ${result.error}`);
        setUsers([]);
      } else {
        console.warn("Unexpected response format:", result);
        setError("Unexpected response format from server.");
        setUsers([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Catch block error:", err);
      setError(`Error: ${errorMessage}`);
      setUsers([]);

      // If unauthorized, redirect to dashboard
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('admin access')) {
        navigate('/profile');
      }
    } finally {
      setIsLoading(false);
      console.log("fetchUsers finished");
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    // Set loading state for this specific action
    setActionStatus({
      userId,
      action: isCurrentlyAdmin ? "admin_remove" : "admin_add",
      status: "processing"
    });

    try {
      const response = await adminApi.toggleAdmin(
        userId, 
        isCurrentlyAdmin ? 'remove' : 'add'
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to update admin status');
      }

      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, is_admin: !isCurrentlyAdmin } : user
        )
      );

      // Set success state
      setActionStatus({
        userId,
        action: isCurrentlyAdmin ? "admin_remove" : "admin_add",
        status: "success",
        message: response.message
      });

      // Clear status after 3 seconds
      setTimeout(() => {
        setActionStatus(null);
      }, 3000);

    } catch (err) {
      console.error("Error toggling admin status:", err);
      
      setActionStatus({
        userId,
        action: isCurrentlyAdmin ? "admin_remove" : "admin_add",
        status: "error",
        message: err instanceof Error ? err.message : "Failed to update admin status"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionStatus({
      userId,
      action: "delete",
      status: "processing"
    });

    try {
      const supabaseUrl =
        import.meta.env.VITE_SUPABASE_URL ||
        "https://yqnikgupiaghgjtsaypr.supabase.co";

      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete user. Status: ${response.status}, Response: ${errorText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        // Remove the deleted user from the list
        setUsers(users.filter((user) => user.id !== userId));

        setActionStatus({
          userId,
          action: "delete",
          status: "success",
          message: `User deleted successfully`
        });

        // Clear status after 3 seconds
        setTimeout(() => {
          setActionStatus(null);
        }, 3000);
      } else {
        throw new Error(result.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error in handleDeleteUser:", err);
      
      setActionStatus({
        userId,
        action: "delete",
        status: "error",
        message: err instanceof Error ? err.message : "An error occurred while deleting the user"
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  return (
    <Layout>
      <div className="bg-black min-h-screen py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2"
              >
                <ArrowLeft size={18} />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Users className="text-[#9b9b6f]" size={32} />
                <h1 className="text-3xl font-bold text-white">
                  User Management
                </h1>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={fetchUsers}
              className="flex items-center space-x-2"
            >
              <span>Refresh Users</span>
            </Button>
          </div>

          {error && (
            <Alert 
              variant="error" 
              title="Error" 
              description={error} 
              className="mb-6" 
            />
          )}

          {isLoading ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading users...</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Paid
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 px-6 text-center text-gray-400"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-700 transition-colors"
                        >
                          <td className="py-4 px-6 text-white">{user.email}</td>
                          <td className="py-4 px-6 text-white">
                            {user.full_name || "N/A"}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.is_admin
                                  ? "bg-purple-900 text-purple-300"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {user.is_admin ? "Admin" : user.role || "User"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.is_paid
                                  ? "bg-green-900 text-green-300"
                                  : "bg-red-900 text-red-300"
                              }`}
                            >
                              {user.is_paid ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-300">
                            {new Date(user.created_at).toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleAdmin(user.id, !!user.is_admin)}
                                disabled={actionStatus?.userId === user.id && 
                                         (actionStatus.action === "admin_add" || 
                                          actionStatus.action === "admin_remove") && 
                                         actionStatus.status === "processing"}
                                className={`${
                                  user.is_admin 
                                    ? "border-red-600 text-red-400 hover:bg-red-900 hover:border-red-500" 
                                    : "border-green-600 text-green-400 hover:bg-green-900 hover:border-green-500"
                                }`}
                              >
                                {actionStatus?.userId === user.id && 
                                 (actionStatus.action === "admin_add" || actionStatus.action === "admin_remove") && 
                                 actionStatus.status === "processing" ? (
                                  "Processing..."
                                ) : user.is_admin ? (
                                  <>
                                    <Unlock size={16} className="mr-2" />
                                    Remove Admin
                                  </>
                                ) : (
                                  <>
                                    <Lock size={16} className="mr-2" />
                                    Make Admin
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={actionStatus?.userId === user.id && 
                                         actionStatus.action === "delete" && 
                                         actionStatus.status === "processing"}
                                className="border-red-600 text-red-400 hover:bg-red-900 hover:border-red-500"
                              >
                                {actionStatus?.userId === user.id && 
                                 actionStatus.action === "delete" && 
                                 actionStatus.status === "processing" 
                                  ? "Deleting..." 
                                  : "Delete"}
                              </Button>
                            </div>
                            
                            {/* Show status messages */}
                            {actionStatus?.userId === user.id && actionStatus.status === "error" && (
                              <div className="mt-2 text-red-400 text-xs">
                                Error: {actionStatus.message}
                              </div>
                            )}
                            
                            {actionStatus?.userId === user.id && actionStatus.status === "success" && (
                              <div className="mt-2 text-green-400 text-xs">
                                Success: {
                                  actionStatus.action === "admin_add" 
                                    ? "Admin role added" 
                                    : actionStatus.action === "admin_remove"
                                    ? "Admin role removed"
                                    : "User deleted"
                                }
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminUserManagement;