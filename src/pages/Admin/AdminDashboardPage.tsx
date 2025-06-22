import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { LoadingState, ErrorState } from "../../components/ui/LoadingState";
import { Eye, CheckCircle, XCircle, Star, Filter, Search, ChevronDown } from "lucide-react";
import { supabase } from "../../lib/supabase";

const LOGO_PATH = "/PUClogo-optimized.webp";

// Add index signature for STATUS_MAP
const STATUS_MAP: Record<string, { label: string; variant: string; icon?: string }> = {
  'pending': { label: "Pending", variant: "warning" },
  'approved': { label: "Approved", variant: "success" },
  'rejected': { label: "Rejected", variant: "danger" },
  'featured': { label: "Featured", variant: "default" },
  'Pending': { label: "Pending", variant: "warning" },
  'Approved': { label: "Approved", variant: "success" },
  'Rejected': { label: "Rejected", variant: "danger" },
  'Featured': { label: "Featured", variant: "default" },
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
      console.log('Raw submissions data:', data); // Debug log
      const formattedSubmissions = (data || []).map((submission: any) => ({
        id: submission.id.toString(),
        userId: submission.user_id,
        fullName: submission.profiles?.full_name || 'Unknown User',
        email: submission.profiles?.email,
        socialHandle: submission.profiles?.social_media || '',
        challenge: 'Pull-Up Challenge',
        category: submission.region || 'General',
        submittedAt: submission.created_at,
        submissionDate: new Date(submission.created_at).toLocaleDateString(),
        status: submission.status,
        pullUpCount: submission.pull_up_count,
        claimedCount: submission.pull_up_count,
        verifiedCount: submission.actual_pull_up_count,
        videoUrl: submission.video_url,
        notes: submission.notes,
        profiles: submission.profiles
      }));
      console.log('Formatted submissions:', formattedSubmissions); // Debug log
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
      filtered = filtered.filter(sub => {
        const subStatus = sub.status.toLowerCase();
        const filterStatus = filters.status.toLowerCase();
        // Handle "Featured ⭐" filter
        if (filterStatus.includes('featured') || filterStatus.includes('⭐')) {
          return subStatus === 'featured';
        }
        return subStatus === filterStatus || 
               STATUS_MAP[subStatus]?.label.toLowerCase().includes(filterStatus) ||
               sub.status === filters.status;
      });
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
    setCurrentPage(1);
  }, [filters, submissions]);

  // Pagination logic
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);

  // Add sendRejectionEmail function
  const sendRejectionEmail = async (userProfile: any) => {
    try {
      // Insert email notification record
      const { error: emailError } = await supabase
        .from('email_notifications')
        .insert({
          user_id: userProfile.userId,
          email_type: 'rejection',
          recipient_email: userProfile.email || userProfile.profiles?.email,
          subject: 'Your Pull-Up Club Submission - Resubmission Available',
          message: `Hi ${userProfile.fullName || 'there'},\n\nUnfortunately, your recent pull-up submission was not approved.\n\nGood news: You can submit a new video right away! Make sure to:\n- Film in good lighting with clear form visible\n- Count your reps accurately and honestly\n- Follow our submission guidelines\n- Ensure video quality is clear\n\nReady to try again? Submit your new video at: https://pullupclub.com/submit\n\nKeep pushing your limits!\nThe Pull-Up Club Team`,
          created_at: new Date().toISOString()
        });
      if (emailError) {
        console.error('Error creating email notification:', emailError);
        return;
      }
      // Trigger the edge function to send emails
      await supabase.functions.invoke('send-rejection-email');
      console.log('Rejection email queued successfully');
    } catch (err) {
      console.error('Failed to send rejection email:', err);
    }
  };

  // Update handleStatusChange to use sendRejectionEmail
  const handleStatusChange = async (
    submissionId: string,
    newStatus: 'Approved' | 'Rejected' | 'Featured',
    verifiedCount?: number
  ) => {
    setIsLoading(true);
    try {
      const submission = submissions.find(s => s.id === submissionId);
      let updateObj: any = {
        updated_at: new Date().toISOString()
      };
      // Handle different status updates
      if (newStatus === 'Approved') {
        updateObj.status = 'approved';
        updateObj.actual_pull_up_count = verifiedCount;
      } else if (newStatus === 'Featured') {
        updateObj.status = 'featured';
        updateObj.actual_pull_up_count = verifiedCount || submission?.pullUpCount;
      } else if (newStatus === 'Rejected') {
        updateObj.status = 'rejected';
      }
      console.log('Updating submission with:', updateObj); // Debug log
      const { error } = await supabase
        .from('submissions')
        .update(updateObj)
        .eq('id', submissionId);
      if (error) {
        console.error('Database update error:', error);
        throw error;
      }
      // Send rejection email if status is rejected
      if (newStatus === 'Rejected' && submission) {
        await sendRejectionEmail(submission);
      }
      await fetchSubmissions();
      console.log(`Submission ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating submission:', error);
      setError(error instanceof Error ? error.message : 'Failed to update submission');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    const statusKey = status.toLowerCase();
    const map = STATUS_MAP[statusKey] || STATUS_MAP[status] || { label: status, variant: 'default' };
    // Add star icon only for featured status, but keep it subtle
    if (statusKey === 'featured') {
      return (
        <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-300">
          <Star className="h-3 w-3 mr-1" />
          {map.label}
        </Badge>
      );
    }
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
  const statuses = [
    "All Status",
    "Pending",
    "Approved", 
    "Rejected",
    "Featured"
  ];

  // Count of new submissions
  const newSubmissionsCount = submissions.filter(sub => sub.status === 'Pending').length;

  return (
    <Layout>
      <div className="min-h-screen bg-black py-8 px-2 md:px-8">
        {/* Email notification banner */}
        <div className="bg-[#918f6f]/10 border border-[#918f6f] text-white p-4 rounded-lg mb-6">
          <p className="text-sm">
            📧 <strong className="text-[#918f6f]">Monthly Submission System Active:</strong> Rejection emails are automatically sent to users when you reject submissions. 
            Rejected users can resubmit immediately. Approved users must wait until next month.
            <br />
            <span className="text-[#918f6f]/80">Make sure the send-rejection-email Edge Function is deployed and configured.</span>
          </p>
        </div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-1 items-center justify-center">
            <img 
              src={LOGO_PATH} 
              alt="Pull-Up Club Logo" 
              className="h-12 w-auto object-contain mr-4" 
              onError={(e) => {
                console.log('Logo failed to load, trying PNG fallback');
                e.currentTarget.src = "/PUClogo.png";
              }}
            />
            <h1 className="text-2xl md:text-3xl font-bold text-[#918f6f] tracking-wide text-center">
              Admin Dashboard
            </h1>
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
          <div className="flex items-center mb-2 justify-between">
            <div className="flex items-center">
            <Filter className="h-5 w-5 text-[#9a9871] mr-2" />
            <span className="font-medium text-[#ededed]">Filters</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setFilters({ month: "All Months", status: "All Status", search: "" })}>
              Reset Filters
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {/* Month Filter */}
            <div>
              <label className="block text-xs font-medium text-[#ededed] mb-1">Month</label>
              <select 
                className="w-full p-2 border border-[#23231f] rounded-md bg-black text-[#ededed] text-sm" 
                value={filters.month} 
                onChange={e => setFilters(f => ({ ...f, month: e.target.value }))}
              >
                {months.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-[#ededed] mb-1">Status</label>
              <select 
                className="w-full p-2 border border-[#23231f] rounded-md bg-black text-[#ededed] text-sm" 
                value={filters.status} 
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              >
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {/* Search Filter */}
            <div>
              <label className="block text-xs font-medium text-[#ededed] mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#918f6f]" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-10 pr-4 py-2 border border-[#23231f] rounded-md bg-black text-[#ededed] text-sm" 
                  value={filters.search} 
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} 
                />
              </div>
            </div>
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
                      {/* Replace the expandable details section with this compact version */}
                      {selectedSubmission?.id === submission.id && (
                        <tr>
                          <td colSpan={4} className="px-6 py-3 bg-[#1a1a17]">
                            <div className="max-w-2xl w-full">
                              {/* Compact submission info */}
                              <div className="mb-3">
                                <h5 className="font-medium text-[#ededed] mb-2 text-sm">Submission Info</h5>
                                <div className="bg-[#23231f] p-3 rounded text-sm">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[#9a9871]">Claimed:</span>
                                    <span className="text-[#ededed] font-bold">{submission.pullUpCount}</span>
                                      </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[#9a9871]">Verified:</span>
                                    <span className={`font-bold ${submission.verifiedCount ? 'text-green-400' : 'text-yellow-400'}`}>{submission.verifiedCount || 'Pending'}</span>
                                  </div>
                                </div>
                              </div>
                              {/* Compact actions */}
                              <div className="flex items-center gap-2 flex-wrap">
                                    <input
                                      type="number"
                                  placeholder="Count"
                                  className="w-20 px-2 py-1 border border-[#23231f] rounded text-sm bg-black text-[#ededed]"
                                      id={`verify-${submission.id}`}
                                      defaultValue={submission.verifiedCount || submission.pullUpCount}
                                    />
                                    <Button
                                  variant="secondary"
                                      size="sm"
                                      onClick={() => {
                                        const input = document.getElementById(`verify-${submission.id}`) as HTMLInputElement;
                                        const verifiedCount = parseInt(input.value) || submission.pullUpCount;
                                        handleStatusChange(submission.id, 'Approved', verifiedCount);
                                      }}
                                      disabled={isLoading}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                                    >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => {
                                        const input = document.getElementById(`verify-${submission.id}`) as HTMLInputElement;
                                        const verifiedCount = parseInt(input.value) || submission.pullUpCount;
                                        handleStatusChange(submission.id, 'Featured', verifiedCount);
                                      }}
                                      disabled={isLoading}
                                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-1"
                                    >
                                  <Star className="h-3 w-3 mr-1" />
                                      Feature
                                    </Button>
                                    <Button
                                  variant="secondary"
                                      size="sm"
                                      onClick={() => handleStatusChange(submission.id, 'Rejected')}
                                      disabled={isLoading}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                                    >
                                  <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                <button
                                  onClick={() => window.open(submission.videoUrl, '_blank')}
                                  className="bg-[#9a9871] hover:bg-[#a5a575] text-black px-3 py-1 rounded text-xs font-semibold"
                                >
                                  Watch Video
                                </button>
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
