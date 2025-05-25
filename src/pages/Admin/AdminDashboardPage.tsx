import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout.tsx";
import ReviewSubmission from "./ReviewSubmission.tsx";
import { Submission } from "../../types/index.ts";
import { Button } from "../../components/ui/Button.tsx";
import { LogOut, Users } from "lucide-react";
import { supabase } from "../../lib/supabase.ts";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../utils/edgeFunctions.ts";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/LoadingState.tsx";
import { useAuth } from "../../context/AuthContext.tsx";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

const AdminDashboardPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isLoading: authIsLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authIsLoading && user && isAdmin) {
      fetchSubmissions();
    } else if (!authIsLoading && (!user || !isAdmin)) {
      console.log("User is not an admin or not logged in. Redirecting from AdminDashboardPage.");
      navigate("/login");
    }
  }, [authIsLoading, user, isAdmin, navigate]);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      setLoadingError(null);

      // Use our adminApi utility
      const data = await adminApi.getSubmissions();

      interface SubmissionData {
        id: string;
        user_id: string;
        video_url: string;
        pull_up_count: number;
        actual_pull_up_count: number | null;
        status: string;
        notes: string | null;
        submitted_at: string;
        approved_at: string | null;
        created_at: string;
        updated_at: string;
        platform: string | null;
        email: string | null;
        full_name: string | null;
        age?: number;
        gender?: string;
        region?: string;
        club_affiliation?: string;
      }

      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error("Expected array of submissions, got:", data);
        throw new Error("Invalid response format from server");
      }

      const formattedSubmissions: Submission[] = (data as SubmissionData[]).map((submission) => {
        // Helper function to validate gender
        const validateGender = (gender: string | undefined): "Male" | "Female" | "Other" => {
          if (!gender) return "Other"; // Default to "Other" or handle as an error
          return ["Male", "Female", "Other"].includes(gender) ? gender as "Male" | "Female" | "Other" : "Other";
        };

        return {
          id: submission.id.toString(),
          userId: submission.user_id, // Assumed to be always present
          fullName: submission.full_name || submission.email?.split('@')[0] || 'Unknown User',
          email: submission.email || 'unknown@example.com',
          age: submission.age ?? 0,
          gender: validateGender(submission.gender),
          region: submission.region || 'Unknown Region',
          clubAffiliation: submission.club_affiliation || 'None',
          pullUpCount: submission.pull_up_count,
          actualPullUpCount: submission.actual_pull_up_count ?? undefined,
          videoLink: submission.video_url,
          submissionDate: submission.created_at,
          status: (submission.status.charAt(0).toUpperCase() + submission.status.slice(1)) as "Pending" | "Approved" | "Rejected",
          featured: submission.status === 'approved',
          notes: submission.notes ?? undefined
        };
      });

      setSubmissions(formattedSubmissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setLoadingError(
        err instanceof Error ? err.message : 'Failed to fetch submissions'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleApproveSubmission = async (id: string, actualCount: number) => {
    try {
      setIsLoading(true);
      // Use our adminApi utility
      await adminApi.approveSubmission(id, actualCount);
      
      // Refresh submissions after update
      await fetchSubmissions();
    } catch (err) {
      console.error("Error approving submission:", err);
      setLoadingError(
        err instanceof Error ? err.message : "Failed to approve submission"
      );
      setIsLoading(false);
    }
  };

  const handleRejectSubmission = async (id: string) => {
    try {
      setIsLoading(true);
      // Use our adminApi utility
      await adminApi.rejectSubmission(id);
      
      // Refresh submissions after update
      await fetchSubmissions();
    } catch (err) {
      console.error("Error rejecting submission:", err);
      setLoadingError(
        err instanceof Error ? err.message : "Failed to reject submission"
      );
      setIsLoading(false);
    }
  };

  const handleUserManagement = () => {
    navigate("/admin-users");
  };

  // Filter submissions based on current filter
  const filteredSubmissions = submissions.filter((submission) => {
    if (currentFilter === "all") return true;
    return submission.status.toLowerCase() === currentFilter.toLowerCase();
  });

  // Count submissions by status
  const counts = {
    pending: submissions.filter((s) => s.status === "Pending").length,
    approved: submissions.filter((s) => s.status === "Approved").length,
    rejected: submissions.filter((s) => s.status === "Rejected").length,
  };

  return (
    <Layout>
      <div className="bg-black py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex items-center justify-between w-full md:w-auto mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={handleUserManagement}
                  className="flex items-center space-x-2"
                >
                  <Users size={18} />
                  <span>User Management</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCurrentFilter("pending")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentFilter === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-800 text-yellow-500 hover:bg-gray-700"
                }`}
              >
                Pending ({counts.pending})
              </button>
              <button
                onClick={() => setCurrentFilter("approved")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentFilter === "approved"
                    ? "bg-green-500 text-white"
                    : "bg-gray-800 text-green-500 hover:bg-gray-700"
                }`}
              >
                Approved ({counts.approved})
              </button>
              <button
                onClick={() => setCurrentFilter("rejected")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentFilter === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-800 text-red-500 hover:bg-gray-700"
                }`}
              >
                Rejected ({counts.rejected})
              </button>
              <button
                onClick={() => setCurrentFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentFilter === "all"
                    ? "bg-[#9b9b6f] text-white"
                    : "bg-gray-800 text-[#9b9b6f] hover:bg-gray-700"
                }`}
              >
                All ({submissions.length})
              </button>
            </div>
          </div>

          {loadingError && (
            <ErrorState 
              message={loadingError}
              className="mb-6"
              onRetry={fetchSubmissions}
            />
          )}

          {isLoading ? (
            <LoadingState message="Loading submissions..." />
          ) : (
            <>
              {filteredSubmissions.length > 0 ? (
                <>
                  {filteredSubmissions.map((submission) => (
                    <ReviewSubmission
                      key={submission.id}
                      submission={submission}
                      onApprove={handleApproveSubmission}
                      onReject={handleRejectSubmission}
                    />
                  ))}
                  
                  {/* Refresh button */}
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="secondary"
                      onClick={fetchSubmissions}
                      disabled={isLoading}
                    >
                      {isLoading ? "Refreshing..." : "Refresh Data"}
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  title={`No ${currentFilter} submissions`}
                  message={
                    currentFilter === "pending"
                      ? "There are no submissions waiting for review."
                      : currentFilter === "approved"
                      ? "No submissions have been approved yet."
                      : currentFilter === "rejected"
                      ? "No submissions have been rejected."
                      : "No submissions found."
                  }
                />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
