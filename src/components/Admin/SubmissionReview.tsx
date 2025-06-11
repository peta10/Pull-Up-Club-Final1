import React, { useState } from 'react';
import { Submission } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { User, MapPin, Building, Calendar, ExternalLink, Check, X } from 'lucide-react';

interface SubmissionReviewProps {
  submission: Submission;
  onApprove: (id: string, actualCount: number) => Promise<void>;
  onReject: (id: string, notes?: string) => Promise<void>;
}

const SubmissionReview: React.FC<SubmissionReviewProps> = ({
  submission,
  onApprove,
  onReject,
}) => {
  const [actualCount, setActualCount] = useState(submission.pullUpCount);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(submission.id, actualCount);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    try {
      await onReject(submission.id, adminNotes);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (submission.status) {
      case 'Pending':
        return <Badge variant="warning">⏳ Pending Review</Badge>;
      case 'Approved':
        return <Badge variant="success">✅ Approved</Badge>;
      case 'Rejected':
        return <Badge variant="danger">❌ Rejected</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const getVideoEmbed = (url: string) => {
    // YouTube embed
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      
      if (videoId) {
        return (
          <iframe
            className="w-full h-64 rounded-lg"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Submission Video"
            frameBorder="0"
            allowFullScreen
          />
        );
      }
    }
    
    // Fallback - show link
    return (
      <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#9b9b6f] hover:text-[#7a7a58] flex items-center gap-2"
        >
          <ExternalLink size={20} />
          View Video
        </a>
      </div>
    );
  };

  return (
    <div className="bg-black rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-800">
      {/* Header with Status */}
      <div className="bg-[#18181b] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">
            Submission #{submission.id.slice(-8)}
          </h3>
          {getStatusBadge()}
        </div>
        <div className="text-sm text-[#8f8e6e]">
          <Calendar size={16} className="inline mr-1" />
          {new Date(submission.submittedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information Panel */}
          <div className="space-y-4">
            <div className="bg-[#18181b] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <User size={18} className="mr-2" />
                User Information
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8f8e6e]">Name:</span>
                  <span className="text-white font-medium">
                    {submission.fullName || 'Not provided'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[#8f8e6e]">Email:</span>
                  <span className="text-white">{submission.email}</span>
                </div>
                
                {submission.socialHandle && (
                  <div className="flex justify-between">
                    <span className="text-[#8f8e6e]">Social Handle:</span>
                    <span className="text-[#9b9b6f] font-medium">
                      {submission.socialHandle}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-[#8f8e6e]">Age:</span>
                  <span className="text-white">
                    {submission.age || 'Not provided'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[#8f8e6e]">Gender:</span>
                  <span className="text-white">{submission.gender}</span>
                </div>
                
                {submission.region && (
                  <div className="flex justify-between">
                    <span className="text-[#8f8e6e]">
                      <MapPin size={14} className="inline mr-1" />
                      Location:
                    </span>
                    <span className="text-white">{submission.region}</span>
                  </div>
                )}
                
                {submission.clubAffiliation && submission.clubAffiliation !== 'None' && (
                  <div className="flex justify-between">
                    <span className="text-[#8f8e6e]">
                      <Building size={14} className="inline mr-1" />
                      Club:
                    </span>
                    <span className="text-white">{submission.clubAffiliation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submission Details */}
            <div className="bg-[#18181b] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Submission Details</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#8f8e6e]">Claimed Pull-ups:</span>
                  <span className="text-white text-xl font-bold">
                    {submission.pullUpCount}
                  </span>
                </div>
                
                {submission.actualPullUpCount && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#8f8e6e]">Verified Count:</span>
                    <span className="text-green-400 text-xl font-bold">
                      {submission.actualPullUpCount}
                    </span>
                  </div>
                )}
                
                {submission.notes && (
                  <div>
                    <span className="text-[#8f8e6e] block mb-1">Admin Notes:</span>
                    <div className="bg-gray-700 p-3 rounded text-white text-sm">
                      {submission.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Panel */}
          <div className="space-y-4">
            <div className="bg-[#18181b] rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Video Submission</h4>
              {getVideoEmbed(submission.videoUrl)}
              
              <div className="mt-3">
                <a
                  href={submission.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9b9b6f] hover:text-[#7a7a58] text-sm flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  Open in new tab
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {submission.status === 'Pending' && (
          <div className="mt-6 border-t border-gray-800 pt-6">
            <h4 className="text-white font-medium mb-4">Admin Actions</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Approve Section */}
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <h5 className="text-green-400 font-medium mb-3">Approve Submission</h5>
                
                <div className="mb-3">
                  <label className="block text-sm text-gray-300 mb-2">
                    Verified Pull-up Count:
                  </label>
                  <input
                    type="number"
                    value={actualCount}
                    onChange={(e) => setActualCount(parseInt(e.target.value) || 0)}
                    min="0"
                    max="200"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
                
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check size={16} className="mr-2" />
                  {isProcessing ? 'Approving...' : 'Approve'}
                </Button>
              </div>

              {/* Reject Section */}
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <h5 className="text-red-400 font-medium mb-3">Reject Submission</h5>
                
                <div className="mb-3">
                  <label className="block text-sm text-gray-300 mb-2">
                    Reason for rejection: <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Please provide a clear reason for rejection..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-red-500 focus:outline-none resize-none"
                  />
                </div>
                
                <Button
                  onClick={handleReject}
                  disabled={isProcessing || !adminNotes.trim()}
                  variant="danger"
                  className="w-full"
                >
                  <X size={16} className="mr-2" />
                  {isProcessing ? 'Rejecting...' : 'Reject'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionReview;