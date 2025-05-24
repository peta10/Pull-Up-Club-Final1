import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import VideoSubmissionForm from "./VideoSubmissionForm";
import { Link } from "../../components/ui/Link";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { Submission } from "../../types";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "../../components/ui/Button";

const VideoSubmissionPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [daysUntilNextSubmission, setDaysUntilNextSubmission] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedSubmissions = data.map((submission) => ({
          id: submission.id,
          userId: submission.user_id,
          pullUpCount: submission.pull_up_count,
          actualPullUpCount: submission.actual_pull_up_count,
          videoLink: submission.video_url,
          status:
            submission.status.charAt(0).toUpperCase() +
            submission.status.slice(1), // Capitalize first letter
          submissionDate: submission.created_at,
          notes: submission.notes,
          gender: submission.gender || "Male",
          clubAffiliation: submission.club_affiliation,
          region: submission.region,
        }));

        setSubmissions(formattedSubmissions);

        // Check if user can submit
        const lastApprovedOrPendingSubmission = data.find(
          (s) => s.status === "approved" || s.status === "pending"
        );

        const hasRejectedSubmission = data.some((s) => s.status === "rejected");

        if (lastApprovedOrPendingSubmission) {
          const today = new Date();
          const lastSubmissionDate = new Date(
            lastApprovedOrPendingSubmission.created_at
          );
          const nextSubmissionDate = new Date(lastSubmissionDate);
          nextSubmissionDate.setDate(nextSubmissionDate.getDate() + 30);

          const daysDiff = Math.ceil(
            (nextSubmissionDate.getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          setDaysUntilNextSubmission(daysDiff);

          setCanSubmit(daysDiff <= 0 || hasRejectedSubmission);
        } else {
          setCanSubmit(true);
        }
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submission history");
    } finally {
      setLoading(false);
    }
  };

  const renderSubmissionStatus = () => {
    if (loading)
      return (
        <p className="text-center text-gray-400">
          Loading submission status...
        </p>
      );

    if (error) {
      return (
        <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
          <p className="text-white">{error}</p>
          <Button
            onClick={fetchSubmissions}
            variant="default"
            size="sm"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      );
    }

    if (!canSubmit) {
      return (
        <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg mb-6">
          <Clock className="w-6 h-6 text-yellow-400 mb-2" />
          <h3 className="text-lg font-semibold text-white">
            Submission Cooldown Period
          </h3>
          <p className="text-gray-300">
            You have an active submission. Your next submission will be
            available in {daysUntilNextSubmission} days.
          </p>
        </div>
      );
    }

    const lastRejectedSubmission = submissions.find(
      (s) => s.status === "Rejected"
    );

    if (lastRejectedSubmission) {
      return (
        <div className="bg-amber-900/30 border border-amber-700 p-4 rounded-lg mb-6">
          <AlertTriangle className="w-6 h-6 text-amber-400 mb-2" />
          <h3 className="text-lg font-semibold text-white">
            Previous Submission Rejected
          </h3>
          <p className="text-gray-300 mb-2">
            Your last submission was rejected. You can submit a new video.
            {lastRejectedSubmission.notes && (
              <span className="block mt-2 italic">
                Note from reviewer: "{lastRejectedSubmission.notes}"
              </span>
            )}
          </p>
        </div>
      );
    }

    return (
      <div className="bg-green-900/30 border border-green-700 p-4 rounded-lg mb-6">
        <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
        <h3 className="text-lg font-semibold text-white">
          Ready for Submission
        </h3>
        <p className="text-gray-300">
          You can now submit your pull-up video for review.
        </p>
      </div>
    );
  };

  return (
    <Layout>
      <div className="bg-black py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Submit Your Pull-Up Video
            </h1>
            <p className="mt-2 text-gray-400">
              Share your pull-up achievement and join the leaderboard.
            </p>
          </div>

          {user ? (
            <>
              {renderSubmissionStatus()}

              {canSubmit ? (
                <VideoSubmissionForm onSubmissionComplete={fetchSubmissions} />
              ) : (
                <div className="text-center mt-8">
                  <Link href="/profile">
                    <Button variant="secondary">Return to Dashboard</Button>
                  </Link>
                </div>
              )}

              {submissions.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Submission History
                  </h2>
                  <div className="space-y-4">
                    {submissions.slice(0, 3).map((submission) => (
                      <div
                        key={submission.id}
                        className="bg-gray-900 p-4 rounded-lg"
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="text-white">
                              <span className="font-medium">
                                {submission.pullUpCount} pull-ups
                              </span>
                              {submission.actualPullUpCount !== null &&
                                submission.actualPullUpCount !==
                                  submission.pullUpCount &&
                                ` (verified: ${submission.actualPullUpCount})`}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Submitted on{" "}
                              {new Date(
                                submission.submissionDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                submission.status === "Approved"
                                  ? "bg-green-900 text-green-300"
                                  : submission.status === "Rejected"
                                  ? "bg-red-900 text-red-300"
                                  : "bg-yellow-900 text-yellow-300"
                              }`}
                            >
                              {submission.status}
                            </span>
                          </div>
                        </div>
                        {submission.notes && (
                          <p className="mt-2 text-sm text-gray-400 italic">
                            "{submission.notes}"
                          </p>
                        )}
                        <div className="mt-2">
                          <a
                            href={submission.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#9b9b6f] hover:text-[#7a7a58] text-sm"
                          >
                            View Video
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  {submissions.length > 3 && (
                    <div className="text-center mt-4">
                      <Link
                        href="/profile"
                        className="text-[#9b9b6f] hover:text-[#7a7a58]"
                      >
                        View all submissions
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-900 p-6 rounded-lg text-center">
              <p className="text-white mb-4">
                Please log in to submit your pull-up video.
              </p>
              <Link href="/login">
                <Button variant="default">Log In</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VideoSubmissionPage;
