import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { LoadingState, ErrorState } from "../../components/ui/LoadingState";
import { Eye, CheckCircle, XCircle, Star, Filter, Search, ChevronDown } from "lucide-react";
import { supabase } from "../../lib/supabase";

const LOGO_PATH = "/PUClogo (1).png";

// Add a type for all possible statuses
const ALL_STATUSES = ["Pending", "Approved", "Rejected", "Featured"] as const;
type StatusType = typeof ALL_STATUSES[number];

// Add index signature for STATUS_MAP
const STATUS_MAP: Record<StatusType, { label: string; variant: string }> = {
  Pending: { label: "New Submission", variant: "warning" },
  Approved: { label: "Approved", variant: "success" },
  Rejected: { label: "Rejected", variant: "danger" },
  Featured: { label: "Featured", variant: "default" },
};

const ITEMS_PER_PAGE = 50;

const AdminDashboardPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    month: "All Months",
    challenge: "All Challenges",
    category: "All Categories",
    status: "All Status",
    search: ""
  });

  // Fetch submissions (paginated)
  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name,
            age,
            gender,
            organization,
            social_media,
            city,
            state
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const formattedSubmissions = (data || []).map((submission: any) => ({
        id: submission.id.toString(),
        userId: submission.user_id,
        fullName: submission.profiles?.full_name || 'Unknown User',
        socialHandle: submission.profiles?.social_media || '',
        challenge: 'Pull-Up Challenge',
        category: submission.region || 'General',
        submittedAt: submission.created_at,
        submissionDate: new Date(submission.created_at).toLocaleDateString(),
        status: submission.status.charAt(0).toUpperCase() + submission.status.slice(1),
        pullUpCount: submission.pull_up_count,
        claimedCount: submission.pull_up_count,
        verifiedCount: submission.actual_pull_up_count,
        videoUrl: submission.video_url,
        notes: submission.notes
      }));
      setSubmissions(formattedSubmissions);
      setFilteredSubmissions(formattedSubmissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line
  }, []);

  // Filtering logic
  useEffect(() => {
    let filtered = submissions;
    if (filters.status !== "All Status") {
      filtered = filtered.filter(sub => (sub.status === filters.status || STATUS_MAP[(sub.status as StatusType)]?.label === filters.status));
    }
    if (filters.category !== "All Categories") {
      filtered = filtered.filter(sub => sub.category === filters.category);
    }
    if (filters.challenge !== "All Challenges") {
      filtered = filtered.filter(sub => sub.challenge === filters.challenge);
    }
    if (filters.month !== "All Months") {
      filtered = filtered.filter(sub => {
        const date = new Date(sub.submittedAt || sub.submissionDate);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        return monthYear === filters.month;
      });
    }
    if (filters.search) {
      filtered = filtered.filter(sub =>
        (sub.fullName || "").toLowerCase().includes(filters.search.toLowerCase()) ||
        (sub.socialHandle || "").toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    setFilteredSubmissions(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [filters, submissions]);

  // Pagination logic
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);

  // Actions
  const handleStatusChange = async (
    submissionId: string,
    newStatus: 'Approved' | 'Rejected' | 'Featured',
    verifiedCount?: number
  ) => {
    setIsLoading(true);
    try {
      let updateObj: any = {
        status: newStatus.toLowerCase(),
        updated_at: new Date().toISOString()
      };
      if (newStatus === 'Approved') {
        updateObj.actual_pull_up_count = verifiedCount;
      }
      const { error } = await supabase
        .from('submissions')
        .update(updateObj)
        .eq('id', submissionId);
      if (error) throw error;
      await fetchSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
      setError(error instanceof Error ? error.message : 'Failed to update submission');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    const map = STATUS_MAP[(status as StatusType)] || { label: status, variant: 'default' };
    return <Badge variant={map.variant as any}>{map.label}</Badge>;
  };

  // Unique filter options
  const months = [
    "All Months",
    ...Array.from(new Set(submissions.map(sub => {
      const date = new Date(sub.submittedAt || sub.submissionDate);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }))).filter(Boolean)
  ];
  const challenges = [
    "All Challenges",
    ...Array.from(new Set(submissions.map(sub => sub.challenge || "Pull-Up Challenge"))).filter(Boolean)
  ];
  const categories = [
    "All Categories",
    ...Array.from(new Set(submissions.map(sub => sub.category || "Outdoor"))).filter(Boolean)
  ];
  const statuses = [
    "All Status",
    ...Array.from(new Set(submissions.map(sub => STATUS_MAP[(sub.status as StatusType)]?.label || sub.status))).filter(Boolean)
  ];

  // Count of new submissions
  const newSubmissionsCount = submissions.filter(sub => sub.status === 'Pending').length;

  return (
    <Layout>
      <div className="min-h-screen bg-black py-8 px-2 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img src={LOGO_PATH} alt="Pull-Up Club Logo" className="h-12 w-auto" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#9a9871] tracking-wide">Admin Dashboard</h1>
          </div>
          {newSubmissionsCount > 0 && (
            <div className="flex items-center bg-[#9a9871]/10 border border-[#9a9871] rounded-lg px-4 py-2">
              <span className="w-6 h-6 bg-[#9a9871] text-black font-bold rounded-full flex items-center justify-center mr-2">{newSubmissionsCount}</span>
              <span className="text-[#9a9871] text-sm font-medium">New submissions to review</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-[#18181b] rounded-lg shadow-sm border border-[#23231f] p-4 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-[#9a9871] mr-2" />
            <span className="font-medium text-[#ededed]">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#ededed] mb-1">Month</label>
              <select className="w-full p-2 border border-[#23231f] rounded-md bg-black text-[#ededed]" value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))}>
                {months.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#ededed] mb-1">Challenge</label>
              <select className="w-full p-2 border border-[#23231f] rounded-md bg-black text-[#ededed]" value={filters.challenge} onChange={e => setFilters(f => ({ ...f, challenge: e.target.value }))}>
                {challenges.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#ededed] mb-1">Category</label>
              <select className="w-full p-2 border border-[#23231f] rounded-md bg-black text-[#ededed]" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#ededed] mb-1">Status</label>
              <select className="w-full p-2 border border-[#23231f] rounded-md bg-black text-[#ededed]" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#ededed] mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9a9871]" />
                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-[#23231f] rounded-md bg-black text-[#ededed]" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setFilters({ month: "All Months", challenge: "All Challenges", category: "All Categories", status: "All Status", search: "" })}>
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#18181b] rounded-lg shadow-sm border border-[#23231f] overflow-hidden">
          {isLoading ? (
            <LoadingState message="Loading submissions..." />
          ) : error ? (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#23231f] border-b border-[#23231f]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#ededed] uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#ededed] uppercase tracking-wider">Challenge / Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#ededed] uppercase tracking-wider">Submission Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#ededed] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#ededed] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-[#23231f]">
                  {paginatedSubmissions.map((submission) => (
                    <React.Fragment key={submission.id}>
                      <tr className="hover:bg-[#23231f] cursor-pointer" onClick={() => setSelectedSubmission(selectedSubmission?.id === submission.id ? null : submission)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-[#ededed]">{submission.fullName}</div>
                            <div className="text-xs text-[#9a9871]">{submission.socialHandle}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-[#ededed]">{submission.challenge || "Pull-Up Challenge"}</div>
                            <div className="flex items-center mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#9a9871]/20 text-[#9a9871]">
                                {submission.category || "Outdoor"}
                              </span>
                              <span className="ml-2 text-xs text-[#ededed]">
                                {new Date(submission.submittedAt || submission.submissionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#ededed]">
                          {new Date(submission.submittedAt || submission.submissionDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); window.open(submission.videoUrl, '_blank'); }}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Video
                          </Button>
                          <Button variant="secondary" size="sm" className="ml-2" onClick={e => { e.stopPropagation(); setSelectedSubmission(selectedSubmission?.id === submission.id ? null : submission); }}>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      {/* Expandable Details Row */}
                      {selectedSubmission?.id === submission.id && (
                        <tr className="bg-[#23231f]">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="bg-black rounded-lg p-4 border border-[#23231f]">
                              <h4 className="font-medium text-[#ededed] mb-3">Submission Details</h4>
                              <p className="text-sm text-[#ededed] mb-4">
                                {submission.notes || `Pull-up submission with ${submission.pullUpCount} claimed repetitions.`}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium text-[#ededed] mb-2">Change Status</h5>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      placeholder={`Verify count (claimed: ${submission.pullUpCount})`}
                                      className="w-32 px-3 py-1.5 border border-[#23231f] rounded text-sm bg-black text-[#ededed]"
                                      id={`verify-${submission.id}`}
                                      defaultValue={submission.pullUpCount}
                                    />
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => {
                                        const input = document.getElementById(`verify-${submission.id}`) as HTMLInputElement;
                                        const verifiedCount = parseInt(input.value) || submission.pullUpCount;
                                        handleStatusChange(submission.id, 'Approved', verifiedCount);
                                      }}
                                      disabled={isLoading}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve & Add to Leaderboard
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleStatusChange(submission.id, 'Featured')}
                                      disabled={isLoading}
                                    >
                                      <Star className="h-4 w-4 mr-1" />
                                      Feature
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleStatusChange(submission.id, 'Rejected')}
                                      disabled={isLoading}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <h5 className="font-medium text-[#ededed] mb-2">Video</h5>
                                  <a
                                    href={submission.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1.5 border border-[#9a9871] text-sm font-medium rounded text-[#9a9871] hover:bg-[#9a9871]/10"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Watch Submission Video
                                  </a>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-[#ededed]">
            Showing {paginatedSubmissions.length} of {filteredSubmissions.length} submissions
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
            <span className="text-[#ededed] text-sm">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
