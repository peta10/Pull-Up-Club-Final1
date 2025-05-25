import React, { useState } from 'react';
import useSubmissions from '../../hooks/useSubmissions';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Check, X, AlertTriangle, Filter } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from '../ui/LoadingState';

type FilterStatus = 'pending' | 'approved' | 'rejected' | 'all';

const SubmissionReview: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('pending');
  const [actualCount, setActualCount] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  
  const { 
    submissions, 
    isLoading, 
    error, 
    refetch, 
    approveSubmission,
    rejectSubmission,
    totalCount
  } = useSubmissions({ 
    status: currentFilter === 'all' ? undefined : currentFilter,
    isAdmin: true,
    limit: 50 // Fetch more to ensure we have enough data for the admin
  });

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

  const handleApprove = async (submissionId: string) => {
    // Use the entered actual count or fall back to the claimed count
    const submission = submissions.find(s => s.id === submissionId);
    const actualPullUps = actualCount[submissionId] || submission?.pullUpCount || 0;
    
    await approveSubmission(submissionId, actualPullUps);
  };

  const handleReject = async (submissionId: string) => {
    await rejectSubmission(submissionId, notes[submissionId]);
  };

  // Count submissions by status
  const counts = {
    pending: submissions.filter(s => s.status === "Pending").length,
    approved: submissions.filter(s => s.status === "Approved").length,
    rejected: submissions.filter(s => s.status === "Rejected").length,
    all: submissions.length
  };

  if (isLoading) {
    return <LoadingState message="Loading submissions..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const filteredSubmissions = submissions.filter(submission => {
    if (currentFilter === 'all') return true;
    return submission.status.toLowerCase() === currentFilter;
  });

  const renderVideoEmbed = (videoUrl: string, platform?: string) => {
    try {
      const url = new URL(videoUrl);
      
      // YouTube embed
      if (platform === 'youtube' || url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        let videoId = '';
        
        if (url.hostname.includes('youtube.com')) {
          videoId = url.searchParams.get('v') || '';
        } else if (url.hostname.includes('youtu.be')) {
          videoId = url.pathname.slice(1);
        }
        
        if (videoId) {
          return (
            <iframe 
              width="100%" 
              height="200" 
              src={`https://www.youtube.com/embed/${videoId}`} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="rounded"
            ></iframe>
          );
        }
      }
      
      // If we can't embed, just show a link
      return (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 bg-gray-800 text-center hover:bg-gray-700 transition-colors rounded"
        >
          Open Video
        </a>
      );
    } catch (e) {
      // Invalid URL, show direct link
      return (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 bg-gray-800 text-center hover:bg-gray-700 transition-colors rounded"
        >
          Open Video
        </a>
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <Filter size={18} className="text-gray-400" />
          <span className="text-gray-300 text-sm font-medium">Filter:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCurrentFilter('pending')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentFilter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-800 text-yellow-500 hover:bg-gray-700'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setCurrentFilter('approved')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentFilter === 'approved'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-green-500 hover:bg-gray-700'
            }`}
          >
            Approved ({counts.approved})
          </button>
          <button
            onClick={() => setCurrentFilter('rejected')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentFilter === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-red-500 hover:bg-gray-700'
            }`}
          >
            Rejected ({counts.rejected})
          </button>
          <button
            onClick={() => setCurrentFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentFilter === 'all'
                ? 'bg-[#9b9b6f] text-white'
                : 'bg-gray-800 text-[#9b9b6f] hover:bg-gray-700'
            }`}
          >
            All ({counts.all})
          </button>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <EmptyState
          title={`No ${currentFilter} submissions`}
          message={
            currentFilter === 'pending'
              ? 'There are no submissions waiting for review.'
              : currentFilter === 'approved'
              ? 'No submissions have been approved yet.'
              : currentFilter === 'rejected'
              ? 'No submissions have been rejected.'
              : 'No submissions found.'
          }
        />
      ) : (
        <div className="space-y-6">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                  <div>
                    <h3 className="text-white text-xl font-bold">
                      {submission.fullName}
                    </h3>
                    <p className="text-gray-400">
                      Submitted on {new Date(submission.submissionDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400">
                      Email: {submission.email}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      submission.status === 'Approved' 
                        ? 'bg-green-900 text-green-300' 
                        : submission.status === 'Rejected'
                        ? 'bg-red-900 text-red-300'
                        : 'bg-yellow-900 text-yellow-300'
                    }`}
                  >
                    {submission.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-gray-300 font-medium mb-2">
                      Submission Details
                    </h4>
                    <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gender:</span>
                        <span className="text-white">{submission.gender}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Club:</span>
                        <span className="text-white">
                          {submission.clubAffiliation || 'None'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Region:</span>
                        <span className="text-white">
                          {submission.region || 'Not specified'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Claimed Pull-Up Count:</span>
                        <span className="text-white font-bold">
                          {submission.pullUpCount}
                        </span>
                      </div>
                      
                      {submission.status === 'Approved' && submission.actualPullUpCount !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Verified Pull-Up Count:</span>
                          <span className="text-green-300 font-bold">
                            {submission.actualPullUpCount}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {submission.notes && (
                      <div className="mt-4 bg-gray-700 rounded-lg p-4">
                        <h4 className="text-gray-300 font-medium mb-2">Notes</h4>
                        <p className="text-white">{submission.notes}</p>
                      </div>
                    )}
                    
                    {submission.status === 'Pending' && (
                      <div className="mt-4">
                        <label className="block text-gray-300 font-medium mb-2">
                          Add Review Notes:
                        </label>
                        <textarea
                          value={notes[submission.id] || ''}
                          onChange={(e) => handleNotesChange(submission.id, e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                          rows={3}
                          placeholder="Add notes about this submission..."
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-gray-300 font-medium mb-2">Video</h4>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="mb-4">
                        {renderVideoEmbed(submission.videoLink, submission.platform)}
                      </div>
                    </div>
                  </div>
                </div>

                {submission.status === "Pending" && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                    <div className="flex items-center">
                      <label htmlFor={`actualCount-${submission.id}`} className="text-gray-300 mr-2">
                        Actual Pull-Up Count:
                      </label>
                      <input
                        id={`actualCount-${submission.id}`}
                        type="number"
                        value={actualCount[submission.id] ?? submission.pullUpCount}
                        onChange={(e) => handleActualCountChange(submission.id, parseInt(e.target.value))}
                        min="0"
                        className="w-20 px-2 py-1 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => handleReject(submission.id)}
                        className="flex items-center border-red-800 text-red-400 hover:bg-red-900/30"
                      >
                        <X size={18} className="mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(submission.id)}
                        className="flex items-center"
                      >
                        <Check size={18} className="mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Refresh button */}
          <div className="flex justify-center mt-8">
            <Button
              variant="secondary"
              onClick={refetch}
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh Submissions"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionReview;