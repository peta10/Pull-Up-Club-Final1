import React, { useState, useEffect } from "react";
import { ExternalLink, Upload, AlertTriangle, Clock } from "lucide-react";
import { Submission } from "../../types";
import { Button } from "../../components/ui/Button";
import { Link } from "../../components/ui/Link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

interface SubmissionDashboardProps {
  submissions: Submission[];
  onRefresh?: () => void;
}

const ProminentCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const diff = endOfMonth.getTime() - now.getTime();
      if (diff <= 0) return null;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return { days, hours, minutes, seconds };
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!timeLeft) return null;
  return (
    <div className="w-full flex justify-center mb-4">
      <div className="bg-[#b2b285] border-4 border-black rounded-xl w-full max-w-3xl flex items-center justify-center py-4 px-6">
        <span className="text-2xl font-bold text-black flex items-center">
          <Clock className="w-8 h-8 mr-3 text-black" />
          <span className="mr-3">Get your submissions in!</span>
          <span className="ml-2">{timeLeft.days} <span className="text-base font-normal">d</span></span>
          <span className="ml-2">{timeLeft.hours} <span className="text-base font-normal">h</span></span>
          <span className="ml-2">{timeLeft.minutes} <span className="text-base font-normal">m</span></span>
          <span className="ml-2">{timeLeft.seconds} <span className="text-base font-normal">s</span></span>
        </span>
      </div>
    </div>
  );
};

const MonthlySubmissionStatus: React.FC<{ submissions: Submission[] }> = ({ submissions }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthSubmissions = submissions.filter(sub => {
    const subDate = new Date(sub.submittedAt);
    return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear;
  });
  const latestThisMonth = thisMonthSubmissions[0];
  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-6">
      <h3 className="text-white font-semibold mb-3">This Month's Submission</h3>
      {latestThisMonth ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Status: {latestThisMonth.status}</p>
            <p className="text-gray-400 text-sm">
              Submitted {new Date(latestThisMonth.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#918f6f] font-bold text-lg">{latestThisMonth.pullUpCount} pull-ups</p>
            {latestThisMonth.status === 'Approved' && (
              <span className="text-green-400 text-xs">✅ On Leaderboard</span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400">No submission this month</p>
          <Link 
            href="/submit" 
            className="inline-block mt-2 px-4 py-2 bg-[#918f6f] hover:bg-[#a19f7f] text-black font-semibold rounded text-sm"
          >
            Submit Now
          </Link>
        </div>
      )}
    </div>
  );
};

const SubmissionDashboard: React.FC<SubmissionDashboardProps> = ({
  onRefresh,
}) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserSubmissions = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
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
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setError("Failed to load submission history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Get the highest pull-up count from approved submissions
  const highestSubmission = submissions
    .filter((s) => s.status === "Approved")
    .reduce((highest, current) => {
      const currentCount = current.actualPullUpCount ?? current.pullUpCount;
      const highestCount = highest
        ? highest.actualPullUpCount ?? highest.pullUpCount
        : 0;
      return currentCount > highestCount ? current : highest;
    }, null as Submission | null);

  const highestPullUps = highestSubmission
    ? highestSubmission.actualPullUpCount ?? highestSubmission.pullUpCount
    : 0;

  // Check if user has submitted this month
  const today = new Date();
  const lastApprovedSubmission = submissions.find(
    (s) => s.status === "Approved"
  );
  const lastPendingSubmission = submissions.find((s) => s.status === "Pending");
  const hasRejectedSubmission = submissions.some(
    (s) => s.status === "Rejected"
  );

  const lastSubmissionDate =
    lastPendingSubmission || lastApprovedSubmission
      ? new Date(
          lastPendingSubmission?.submittedAt ||
            lastApprovedSubmission?.submittedAt ||
            ""
        )
      : null;

  const daysUntilNextSubmission = lastSubmissionDate
    ? Math.ceil(
        (lastSubmissionDate.getTime() +
          30 * 24 * 60 * 60 * 1000 -
          today.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const canSubmit =
    (!lastPendingSubmission &&
      (!lastApprovedSubmission || daysUntilNextSubmission <= 0)) ||
    hasRejectedSubmission;

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9b9b6f] mx-auto"></div>
          <p className="mt-2 text-gray-400">Updating submission status...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
          <p className="text-white">{error}</p>
          <Button
            onClick={() => {
              fetchUserSubmissions();
            }}
            variant="default"
            size="sm"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Patch claim and Stripe portal buttons for all users with US-only disclaimer */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        {/* ... claim patch and manage subscription buttons ... */}
      </div>
      <p className="text-xs text-gray-400 mt-1">US shipping only. International users are not eligible for the patch or physical rewards at this time.</p>
      {/* Main submission prompt area */}
      <div className={`p-6 rounded-lg text-white border-2 mb-4 ${canSubmit ? "bg-[#9b9b6f] border-[#9b9b6f]" : "bg-gray-700 border-gray-600"}`}>
        <ProminentCountdown />
        <div className="flex flex-col items-center justify-center">
          <div className="text-lg font-semibold mb-2 text-black">
            {canSubmit ? "Ready for Your Next Submission!" : "Submission Cooldown Active"}
          </div>
          {canSubmit && (
            <Link href="/submit">
              <Button 
                variant="secondary" 
                className="bg-white text-[#9b9b6f] hover:bg-gray-100 font-semibold px-8 py-3"
              >
                {hasRejectedSubmission ? "Resubmit Video" : "Submit Your Video"}
              </Button>
            </Link>
          )}
          {!canSubmit && daysUntilNextSubmission > 0 && (
            <div className="mt-2 text-gray-200">
              You can submit again in {daysUntilNextSubmission} day{daysUntilNextSubmission > 1 ? "s" : ""}.
            </div>
          )}
        </div>
      </div>
      {/* Best performance summary */}
      {highestSubmission && (
        <div className="bg-gray-950 p-4 rounded-lg mb-6">
          <h3 className="text-white font-semibold mb-2">Your Best Performance</h3>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#9b9b6f]">{highestPullUps}</div>
              <div className="text-xs text-gray-400">Pull-ups</div>
            </div>
            <div className="text-gray-400 text-sm">
              Submitted on {new Date(highestSubmission.submittedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
      {/* Monthly submission status */}
      <MonthlySubmissionStatus submissions={submissions} />
      {/* Submission history or no submissions message */}
      {submissions.length === 0 ? (
        <div className="bg-gray-950 p-6 rounded-lg text-center">
          <Upload className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-2">No Submissions Yet</h3>
          <p className="text-gray-400 text-sm">
            Your submission history will appear here once you submit your first video.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Your Submission History
          </h2>
          <div className="space-y-4">
            {submissions.slice(0, 3).map((submission) => {
              const actualCount =
                submission.actualPullUpCount ?? submission.pullUpCount;

              return (
                <div key={submission.id} className="bg-gray-950 p-6 rounded-lg">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        Submission from{" "}
                        {new Date(
                          submission.submittedAt
                        ).toLocaleDateString()}
                      </h3>
                      <p className="text-gray-400 mt-1">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            submission.status === "Approved"
                              ? "text-green-400"
                              : submission.status === "Rejected"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {submission.status}
                        </span>
                      </p>
                    </div>
                    <a
                      href={submission.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#9b9b6f] hover:text-[#7a7a58] flex items-center"
                    >
                      <ExternalLink size={20} className="mr-1" />
                      View Video
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400">Pull-Up Count:</p>
                      <p className="text-xl font-bold text-white">
                        {actualCount}
                      </p>
                      {submission.actualPullUpCount !== undefined &&
                        submission.actualPullUpCount !==
                          submission.pullUpCount && (
                          <p className="text-sm text-gray-500">
                            Originally claimed: {submission.pullUpCount}
                          </p>
                        )}
                    </div>
                  </div>

                  {submission.notes && (
                    <div className="mt-2 p-3 bg-gray-900 rounded border border-gray-800">
                      <p className="text-gray-400 text-sm">Reviewer Notes:</p>
                      <p className="text-white">{submission.notes}</p>
                    </div>
                  )}

                  {submission.status === "Rejected" && (
                    <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded">
                      <p className="text-red-200 mb-3">
                        Your submission was not approved.{" "}
                        {submission.notes
                          ? "Please review the feedback provided above."
                          : "Please review the video requirements and submit a new attempt."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-6">
            <Button
              onClick={() => {
                fetchUserSubmissions();
              }}
              variant="outline"
              size="sm"
            >
              Refresh Submission Status
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionDashboard;
