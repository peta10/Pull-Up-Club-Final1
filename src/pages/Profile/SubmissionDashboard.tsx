import { Clock, Trophy, Target, FileText, Calendar } from "lucide-react";
import { Submission } from "../../types";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";

// Live countdown hook with seconds
const useLiveCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const difference = nextMonth.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
};

const SubmissionDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const timeLeft = useLiveCountdown();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [bestPerformance, setBestPerformance] = useState(0);
  const [currentMonthSubmission, setCurrentMonthSubmission] = useState<Submission | null>(null);
  const [canSubmitThisMonth, setCanSubmitThisMonth] = useState(false);

  const fetchUserSubmissions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) {
        const formattedSubmissions: Submission[] = data.map((submission) => ({
          id: submission.id,
          userId: submission.user_id,
          fullName: submission.full_name || submission.email?.split('@')[0] || 'Unknown User',
          email: submission.email || 'unknown@example.com',
          phone: submission.phone ?? undefined,
          age: submission.age ?? 0,
          gender: (submission.gender as "Male" | "Female" | "Other") || "Other",
          region: submission.region || 'Unknown Region',
          clubAffiliation: submission.club_affiliation || 'None',
          pullUpCount: submission.pull_up_count,
          actualPullUpCount: submission.actual_pull_up_count ?? undefined,
          videoUrl: submission.video_url,
          status: (submission.status.charAt(0).toUpperCase() + submission.status.slice(1)) as "Pending" | "Approved" | "Rejected",
          submittedAt: submission.created_at,
          approvedAt: submission.approved_at || undefined,
          notes: submission.notes ?? undefined,
          featured: submission.status === 'approved',
          socialHandle: submission.social_handle
        }));
        setSubmissions(formattedSubmissions);

        // Calculate best performance
        const approvedSubmissions = formattedSubmissions.filter(sub => sub.status.toLowerCase() === 'approved');
        const best = approvedSubmissions.reduce((max, sub) => {
          const count = sub.actualPullUpCount ?? sub.pullUpCount;
          return count > max ? count : max;
        }, 0);
        setBestPerformance(best);

        // Find current month submission and determine if user can submit again
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const submissionsThisMonth = formattedSubmissions.filter(sub => {
          const subDate = new Date(sub.submittedAt);
          return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear;
        });

        const latestSubmissionThisMonth = submissionsThisMonth.length > 0 ? submissionsThisMonth[0] : null;
        setCurrentMonthSubmission(latestSubmissionThisMonth);
        
        const hasActiveSubmission = submissionsThisMonth.some(sub => 
            sub.status.toLowerCase() === 'approved' || sub.status.toLowerCase() === 'pending'
        );
        
        setCanSubmitThisMonth(!hasActiveSubmission);
      }
    } catch (err) {
      console.error("Failed to load submission history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      case 'featured': return 'text-yellow-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
      case 'featured': return 'bg-yellow-600';
      default: return 'bg-yellow-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Monthly Competition Countdown */}
      <div className="bg-gray-900 p-6 rounded-lg text-center transform transition-transform hover:scale-105">
        <div className="flex justify-center mb-4">
          <Clock size={48} className="text-[#9b9b6f]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Monthly Competition</h3>
        <p className="text-2xl font-bold text-white mb-1">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </p>
        <p className="text-gray-400">time remaining to submit</p>
      </div>

      {/* Submission Status */}
      <div className="bg-gray-900 p-6 rounded-lg text-center transform transition-transform hover:scale-105">
        <div className="flex justify-center mb-4">
          <Target size={48} className="text-[#9b9b6f]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          {currentMonthSubmission && !canSubmitThisMonth ? 'Submission Status' : 'Ready to Submit!'}
        </h3>
        {canSubmitThisMonth ? (
          <div>
            <p className="text-gray-400 mb-4">Submit your pull-up video to compete this month</p>
            {currentMonthSubmission?.status.toLowerCase() === 'rejected' && (
              <p className="text-red-400 text-sm mb-4">Your last submission was rejected. Please try again.</p>
            )}
            <button 
              onClick={() => navigate('/submit')}
              className="bg-[#9b9b6f] hover:bg-[#a5a575] text-black font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Submit Video
            </button>
          </div>
        ) : currentMonthSubmission ? (
          <div>
            <p className="text-gray-400 mb-2">This month's submission</p>
            <p className={`font-semibold mb-2 capitalize ${getStatusColor(currentMonthSubmission.status)}`}> 
              {currentMonthSubmission.status}
            </p>
            <p className="text-2xl font-bold text-white">
              {currentMonthSubmission.actualPullUpCount ?? currentMonthSubmission.pullUpCount} pull-ups
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 mb-4">Submit your pull-up video to compete this month</p>
            <button 
              onClick={() => navigate('/submit')}
              className="bg-[#9b9b6f] hover:bg-[#a5a575] text-black font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Submit Video
            </button>
          </div>
        )}
      </div>

      {/* Your Best Performance */}
      <div className="bg-gray-900 p-6 rounded-lg text-center transform transition-transform hover:scale-105">
        <div className="flex justify-center mb-4">
          <Trophy size={48} className="text-[#9b9b6f]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Best Performance</h3>
        <p className="text-2xl font-bold text-white mb-1">{bestPerformance}</p>
        <p className="text-gray-400">pull-ups</p>
        {bestPerformance > 0 && (
          <div className="mt-4 text-sm text-gray-400">
            <p className="text-[#9b9b6f]">On Leaderboard</p>
          </div>
        )}
      </div>

      {/* This Month's Details */}
      {currentMonthSubmission && (
        <div className="bg-gray-900 p-6 rounded-lg text-center transform transition-transform hover:scale-105">
          <div className="flex justify-center mb-4">
            <Calendar size={48} className="text-[#9b9b6f]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">This Month</h3>
          <p className="text-2xl font-bold text-white mb-1">
            {currentMonthSubmission.actualPullUpCount ?? currentMonthSubmission.pullUpCount}
          </p>
          <p className="text-gray-400">pull-ups submitted</p>
          <div className="mt-4 text-sm text-gray-400">
            <p>Status: <span className={`capitalize ${getStatusColor(currentMonthSubmission.status)}`}>
              {currentMonthSubmission.status}
            </span></p>
            <p>Submitted: {new Date(currentMonthSubmission.submittedAt).toLocaleDateString()}</p>
            {currentMonthSubmission.status.toLowerCase() === 'approved' && (
              <p className="text-green-400 mt-1">✓ On Leaderboard</p>
            )}
          </div>
        </div>
      )}

      {/* Submission History */}
      <div className={`bg-gray-900 p-6 rounded-lg text-center transform transition-transform hover:scale-105 ${
        currentMonthSubmission ? 'md:col-span-2' : 'md:col-span-3'
      }`}>
        <div className="flex justify-center mb-4">
          <FileText size={48} className="text-[#9b9b6f]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-4">Submission History</h3>
        
        {loading ? (
          <p className="text-gray-400">Loading submissions...</p>
        ) : submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.slice(0, 5).map((submission) => (
              <div key={submission.id} className="flex justify-between items-center text-sm bg-gray-800 p-3 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-white font-medium">
                    {new Date(submission.submittedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric' 
                    })}
                  </span>
                  <span className={`text-white text-xs px-2 py-1 rounded capitalize ${getStatusBadgeColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold">
                    {submission.actualPullUpCount ?? submission.pullUpCount} pull-ups
                  </span>
                  {submission.videoUrl && (
                    <div className="mt-1">
                      <a 
                        href={submission.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#9b9b6f] hover:text-[#a5a575] text-xs"
                      >
                        View Video
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {submissions.length > 5 && (
              <p className="text-gray-400 text-sm">And {submissions.length - 5} more submissions...</p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 mb-4">No submissions yet</p>
            <p className="text-gray-500 text-sm mb-4">
              Your submission history will appear here once you submit your first video.
            </p>
            <button 
              onClick={() => navigate('/submit')}
              className="bg-[#9b9b6f] hover:bg-[#a5a575] text-black font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Submit Your First Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionDashboard;
