import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';

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
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Fetch submission details
    // This is a placeholder - implement actual fetch logic
    setLoading(true);
    setError(null);
    setSubmission({
      id: id || '',
      status: 'Pending',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      pullUpCount: 10
    });
    setLoading(false);
  }, [id]);

  if (!submission) {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back to Dashboard Link */}
          <Link to="/admin/dashboard" className="text-[#9b9b6f] hover:text-[#7a7a58] mb-6 inline-block">
            &larr; Back to Dashboard
          </Link>

          {loading ? (
            <div className="text-center">
              <p>Loading submission...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : submission ? (
            <div className="bg-gray-900 shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Review Submission</h2>
              <div className="mb-4">
                <video src={submission.videoUrl} controls className="w-full rounded-lg"></video>
              </div>
              <p className="text-white">Pull-up Count: {submission.pullUpCount}</p>
              <p className="text-gray-400">Status: {submission.status}</p>

              <div className="mt-6 flex gap-4">
                <Button>Approve</Button>
                <Button variant="destructive">Reject</Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p>Submission not found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReviewSubmission;
