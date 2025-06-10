import React, { useState, useEffect } from "react";
import { Badge } from "../../components/ui/Badge";
import { ExternalLink, Upload, AlertTriangle, Clock } from "lucide-react";
import { Submission } from "../../types";
import { getBadgesForSubmission } from "../../data/mockData";
import { Button } from "../../components/ui/Button";
import { Link } from "../../components/ui/Link";
import CountdownTimer from "../../pages/Home/CountdownTimer";
import BadgeProgress from "./BadgeProgress";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

interface SubmissionDashboardProps {
  submissions: Submission[];
  onRefresh?: () => void;
}

const SubmissionDashboard: React.FC<SubmissionDashboardProps> = ({
  submissions: propSubmissions,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>(propSubmissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSubmissions(propSubmissions);
  }, [propSubmissions]);

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

  const fetchLatestSubmissions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

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

        // Call parent refresh function if provided
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submission history");
    } finally {
      setLoading(false);
    }
  };

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
            onClick={fetchLatestSubmissions}
            variant="default"
            size="sm"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Badge Progress Section */}
      {highestSubmission && (
        <BadgeProgress
          pullUps={highestPullUps}
        />
      )}

      {/* Monthly Submission Prompt */}
      <div
        className={`p-6 rounded-lg text-white ${
          canSubmit ? "bg-[#9b9b6f]" : "bg-gray-700"
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-white/10 rounded-lg mb-4">
            {canSubmit ? <Upload size={24} /> : <Clock size={24} />}
          </div>

          {lastPendingSubmission ? (
            <h3 className="text-lg font-semibold mb-2">
              Submission Under Review
            </h3>
          ) : hasRejectedSubmission ? (
            <h3 className="text-lg font-semibold mb-2">
              Ready to Resubmit Your Video
            </h3>
          ) : canSubmit ? (
            <h3 className="text-lg font-semibold mb-2">
              Ready for Your Next Submission!
            </h3>
          ) : (
            <h3 className="text-lg font-semibold mb-2">
              Next Submission Available in {daysUntilNextSubmission} Days
            </h3>
          )}

          {lastPendingSubmission ? (
            <p className="text-sm opacity-90 max-w-md">
              Your submission from{" "}
              {new Date(
                lastPendingSubmission.submittedAt
              ).toLocaleDateString()}
              is currently being reviewed. We'll notify you once it's approved
              or if additional information is needed.
            </p>
          ) : canSubmit ? (
            <>
              <Link href="/submit">
                <Button variant="secondary" className="mb-6">
                  {hasRejectedSubmission
                    ? "Resubmit Video"
                    : "Submit Your Video"}
                </Button>
              </Link>
              <div className="w-full bg-gray-950 mt-4 p-2">
                <CountdownTimer />
              </div>
            </>
          ) : (
            <p className="text-sm opacity-90 max-w-md">
              To maintain fairness and consistency, members are limited to one
              submission per month. Your next submission will be available on{" "}
              {lastSubmissionDate &&
                new Date(
                  lastSubmissionDate.getTime() + 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              .
            </p>
          )}
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Your Submission History
          </h2>
          <div className="space-y-4">
            {submissions.map((submission) => {
              const badges = getBadgesForSubmission(submission.actualPullUpCount ?? submission.pullUpCount);
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

                    <div>
                      <p className="text-gray-400">Badges Earned:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {badges.length > 0 ? (
                          badges.map((badge) => (
                            <Badge
                              key={badge.id}
                              variant={
                                badge.id === "elite" ? "elite" : "default"
                              }
                              className={
                                badge.id === "elite"
                                  ? ""
                                  : "bg-gray-800 text-white"
                              }
                            >
                              {badge.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500">
                            No badges earned yet
                          </span>
                        )}
                      </div>
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
                      <Link href="/submit">
                        <Button variant="secondary" size="sm">
                          Submit New Video
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-6">
            <Button
              onClick={fetchLatestSubmissions}
              variant="outline"
              size="sm"
            >
              Refresh Submission Status
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-950 p-6 rounded-lg text-center">
          <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No Submissions Yet
          </h3>
          <p className="text-gray-400 mb-4">
            Ready to show off your pull-up skills? Submit your first video to
            get started!
          </p>
          <Link href="/submit">
            <Button variant="secondary">Submit Your First Video</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SubmissionDashboard;
