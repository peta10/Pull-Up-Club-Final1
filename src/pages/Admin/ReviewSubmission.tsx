import React from 'react';
import { useParams } from 'react-router-dom';
import { getStatusInfo } from '../../data/mockData';
import { Button } from '../../components/ui/Button';

interface Submission {
  id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  videoUrl: string;
  pullUpCount: number;
  notes?: string;
}

const ReviewSubmission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = React.useState<Submission | null>(null);

  React.useEffect(() => {
    // Fetch submission details
    // This is a placeholder - implement actual fetch logic
    setSubmission({
      id: id || '',
      status: 'Pending',
      videoUrl: 'https://example.com/video',
      pullUpCount: 10
    });
  }, [id]);

  if (!submission) {
    return <div>Loading...</div>;
  }

  const { label, color, description } = getStatusInfo(submission.status);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Review Submission #{submission.id}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full ${color} mr-2`} />
          <span className="font-medium">{label}</span>
        </div>
        
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Video Submission</h3>
          <a
            href={submission.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Video
          </a>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Pull-up Count</h3>
          <p>{submission.pullUpCount}</p>
        </div>
        
        {submission.notes && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Notes</h3>
            <p className="text-gray-600">{submission.notes}</p>
          </div>
        )}
        
        {submission.status === 'Pending' && (
          <div className="flex gap-2">
            <Button variant="primary">Approve</Button>
            <Button variant="danger">Reject</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSubmission;
