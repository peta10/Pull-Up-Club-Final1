import React, { useState } from 'react';
import { Submission } from '../../types';
import { Button } from '../ui/Button';
import { Check, X } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from '../ui/LoadingState';

interface SubmissionReviewProps {
  submission: Submission;
  onApprove: (submissionId: string, actualCount: number) => void;
  onReject: (submissionId: string, reason: string) => void;
}

const SubmissionReview: React.FC<SubmissionReviewProps> = ({ submission, onApprove, onReject }) => {
  const [currentFilter, setCurrentFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [actualCount, setActualCount] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const handleActualCountChange = (submissionId: string, count: number) => {
    setActualCount({
      ...actualCount,
      [submissionId]: count
    });
  };

  const handleNotesChange = (submissionId: string, text: string) => {
    setNotes({
      ...notes,
      [submissionId]: text
    });
  };

  const handleApprove = async (submissionId: string, actualCount: number) => {
    onApprove(submissionId, actualCount);
  };

  const handleReject = async (submissionId: string, reason: string) => {
    onReject(submissionId, reason);
  };

  const renderVideoEmbed = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1] || url.split('/').pop();
      return (
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    // Add support for other video platforms as needed
    return <a href={url} target="_blank" rel="noopener noreferrer">View Video</a>;
  };

  return (
    <div className="space-y-6">
      {error && <ErrorState message={error} />}
      {loading ? (
        <LoadingState message="Loading submissions..." />
      ) : submissions.length === 0 ? (
        <EmptyState
          title={`No ${currentFilter} Submissions`}
          message={
            currentFilter === 'Pending'
              ? 'There are no submissions waiting for review.'
              : currentFilter === 'Approved'
              ? 'No submissions have been approved yet.'
              : currentFilter === 'Rejected'
              ? 'No submissions have been rejected.'
              : 'No submissions found.'
          }
        />
      ) : (
        <div className="space-y-8">
          {submissions.map((submission: Submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-lg shadow-md p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {submission.fullName} ({submission.email})
                  </h3>
                  <p className="text-gray-600">
                    Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    Pull-ups claimed: {submission.pullUpCount}
                  </p>
                </div>
                <div className="space-x-2">
                  {submission.status === 'Pending' && (
                    <>
                      <Button
                        onClick={() =>
                          handleApprove(
                            submission.id,
                            actualCount[submission.id] || submission.pullUpCount
                          )
                        }
                        variant="primary"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() =>
                          handleReject(
                            submission.id,
                            notes[submission.id] || 'Submission rejected'
                          )
                        }
                        variant="danger"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {submission.status === 'Pending' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Actual Pull-up Count
                      </label>
                      <input
                        type="number"
                        value={actualCount[submission.id] || submission.pullUpCount}
                        onChange={(e) =>
                          handleActualCountChange(
                            submission.id,
                            parseInt(e.target.value)
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        value={notes[submission.id] || ''}
                        onChange={(e) =>
                          handleNotesChange(submission.id, e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        rows={3}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Video Submission
                  </label>
                  <div className="mt-1">
                    {renderVideoEmbed(submission.videoUrl)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionReview;