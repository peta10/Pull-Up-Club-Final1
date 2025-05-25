import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { AlertTriangle, CheckCircle, Clock, Info, Upload } from "lucide-react";
import { Button } from "../../components/ui/Button";
import useVideoSubmission from "../../hooks/useVideoSubmission";
import useSubmissions from "../../hooks/useSubmissions";
import { Alert } from "../../components/ui/Alert";
import { LoadingState, EmptyState } from "../../components/ui/LoadingState";
import { LinkButton } from '../../components/ui/LinkButton';

const VideoSubmissionPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    pullUpCount: 0,
    videoUrl: '',
    clubAffiliation: '',
    region: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
  });
  const [isChecked, setIsChecked] = useState({
    videoConfirmed: false,
    videoAuthenticity: false,
  });
  const [submitted, setSubmitted] = useState(false);
  
  const { submitVideo, isSubmitting, error: submitError, validateVideoUrl } = useVideoSubmission();
  const { 
    submissions, 
    isLoading: submissionsLoading, 
    error: submissionsError, 
    refetch 
  } = useSubmissions({ 
    userId: user?.id,
    limit: 3  
  });

  // Check submission eligibility
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [daysUntilNextSubmission, setDaysUntilNextSubmission] = useState(0);
  const [eligibilityStatus, setEligibilityStatus] = useState<string | null>(null);

  React.useEffect(() => {
    const checkEligibility = async () => {
      if (!user) return;

      try {
        // Call the submission eligibility function
        const { data, error } = await supabase.rpc('get_submission_status', { user_id: user.id });
        
        if (error) throw error;
        
        if (data) {
          setCanSubmit(data.can_submit || false);
          setEligibilityStatus(data.status || null);
          setDaysUntilNextSubmission(data.days_left || 0);
        }
        
      } catch (err) {
        console.error('Error checking eligibility:', err);
      } finally {
        setEligibilityChecked(true);
      }
    };

    checkEligibility();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setIsChecked(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await submitVideo({
      pullUpCount: formData.pullUpCount,
      videoUrl: formData.videoUrl,
      gender: formData.gender,
      region: formData.region,
      clubAffiliation: formData.clubAffiliation
    });
    
    if (result.success) {
      setSubmitted(true);
      refetch();  // Refresh submission list
    }
  };

  // Validate form
  const isFormValid = () => {
    // Validate video URL
    const { isValid } = validateVideoUrl(formData.videoUrl);
    
    return (
      formData.pullUpCount > 0 &&
      isValid &&
      isChecked.videoConfirmed &&
      isChecked.videoAuthenticity
    );
  };

  if (!user) {
    return (
      <Layout>
        <div className="bg-black min-h-screen py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <Alert
              variant="warning"
              title="Authentication Required"
              description="You need to be logged in to submit videos. Please log in or create an account to continue."
              icon={<Info size={24} />}
            />
            
            <div className="mt-6 flex justify-center space-x-4">
              <LinkButton to="/login">
                Log In
              </LinkButton>
              <LinkButton to="/create-account" variant="outline">
                Create Account
              </LinkButton>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="bg-black min-h-screen py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto bg-gray-800 rounded-lg p-8 text-center">
            <div className="rounded-full bg-green-900/30 p-4 mx-auto w-fit mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Submission Successful!
            </h1>
            <p className="text-gray-300 mb-8">
              Your video has been submitted for review. You'll be notified once it has been approved or if any issues are found.
            </p>
            <LinkButton to="/profile">
              Return to Profile
            </LinkButton>
          </div>
        </div>
      </Layout>
    );
  }

  if (!eligibilityChecked) {
    return (
      <Layout>
        <div className="bg-black min-h-screen py-16 px-4 sm:px-6 lg:px-8">
          <LoadingState message="Checking submission eligibility..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-black min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Submit Your Pull-Up Video
          </h1>
          
          {!canSubmit && eligibilityStatus === 'cooldown' && (
            <Alert
              variant="warning"
              title="Submission Cooldown Period"
              description={`You have an approved submission within the last 30 days. Your next submission will be available in ${daysUntilNextSubmission} days.`}
              icon={<Clock size={24} />}
              className="mb-6"
            />
          )}
          
          {!canSubmit && eligibilityStatus === 'pending' && (
            <Alert
              variant="info"
              title="Submission Under Review"
              description="You already have a submission that is currently being reviewed. Please wait for the review to complete before submitting another video."
              icon={<Info size={24} />}
              className="mb-6"
            />
          )}
          
          {eligibilityStatus === 'rejected' && (
            <Alert
              variant="error"
              title="Previous Submission Rejected"
              description="Your previous submission was not approved. Please review the feedback (if any) and submit a new video."
              icon={<AlertTriangle size={24} />}
              className="mb-6"
            />
          )}
          
          {submitError && (
            <Alert
              variant="error"
              title="Submission Error"
              description={submitError}
              className="mb-6"
            />
          )}

          {canSubmit ? (
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pullUpCount" className="block text-gray-300 font-medium mb-2">
                      Pull-Up Count <span className="text-[#9b9b6f]">*</span>
                    </label>
                    <input
                      type="number"
                      id="pullUpCount"
                      name="pullUpCount"
                      value={formData.pullUpCount || ''}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Enter the number of consecutive pull-ups you completed in the video.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-gray-300 font-medium mb-2">
                      Gender <span className="text-[#9b9b6f]">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="region" className="block text-gray-300 font-medium mb-2">
                      Region
                    </label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      placeholder="e.g. North America, Europe, Asia"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                    />
                  </div>

                  <div>
                    <label htmlFor="clubAffiliation" className="block text-gray-300 font-medium mb-2">
                      Club Affiliation
                    </label>
                    <input
                      type="text"
                      id="clubAffiliation"
                      name="clubAffiliation"
                      value={formData.clubAffiliation}
                      onChange={handleInputChange}
                      placeholder="e.g. CrossFit Central, Iron Warriors, etc."
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="videoUrl" className="block text-gray-300 font-medium mb-2">
                    Video URL <span className="text-[#9b9b6f]">*</span>
                  </label>
                  <input
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                    required
                  />
                  <div className="mt-1 text-sm text-gray-400 flex items-start">
                    <Info className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>
                      Please upload your video to YouTube, Instagram, or TikTok and paste the public link here. 
                      Make sure your video is publicly accessible.
                    </span>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-3">Video Requirements</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm ml-1">
                    <li>Clear, unobstructed view of the full movement</li>
                    <li>Chin must clear the bar for each rep</li>
                    <li>Full arm extension at the bottom of each rep</li>
                    <li>Continuous recording without cuts or edits</li>
                    <li>Video must be publicly accessible</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="videoConfirmed"
                      name="videoConfirmed"
                      checked={isChecked.videoConfirmed}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 rounded border-gray-700 text-[#9b9b6f] focus:ring-[#9b9b6f]"
                      required
                    />
                    <label htmlFor="videoConfirmed" className="ml-2 block text-sm text-gray-300">
                      I confirm that the video link I have provided is correct and publicly accessible.
                      <span className="text-[#9b9b6f]">*</span>
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="videoAuthenticity"
                      name="videoAuthenticity"
                      checked={isChecked.videoAuthenticity}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 rounded border-gray-700 text-[#9b9b6f] focus:ring-[#9b9b6f]"
                      required
                    />
                    <label htmlFor="videoAuthenticity" className="ml-2 block text-sm text-gray-300">
                      I confirm this is an authentic video of my performance, with no edits, cuts, or manipulation.
                      <span className="text-[#9b9b6f]">*</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    isLoading={isSubmitting}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Video
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg p-6 text-center">
              <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-3">
                {eligibilityStatus === 'pending'
                  ? 'Submission In Review'
                  : 'Cooldown Period Active'}
              </h2>
              <p className="text-gray-300 mb-6">
                {eligibilityStatus === 'pending'
                  ? 'Your current submission is still under review. You can submit a new video once the review is complete.'
                  : `You can submit a new video in ${daysUntilNextSubmission} days. Please check back later.`}
              </p>
              <LinkButton to="/profile" variant="secondary">
                Return to Profile
              </LinkButton>
            </div>
          )}

          {/* Recent submissions section */}
          {submissions.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-white mb-6">Recent Submissions</h2>
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white">
                          <span className="font-medium">{submission.pullUpCount} pull-ups</span>
                          {submission.actualPullUpCount !== undefined && submission.pullUpCount !== submission.actualPullUpCount && (
                            <span className="text-gray-400 ml-2">
                              (Verified: {submission.actualPullUpCount})
                            </span>
                          )}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Submitted on {new Date(submission.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            submission.status === 'Approved'
                              ? 'bg-green-900 text-green-300'
                              : submission.status === 'Rejected'
                              ? 'bg-red-900 text-red-300'
                              : 'bg-yellow-900 text-yellow-300'
                          }`}
                        >
                          {submission.status}
                        </span>
                      </div>
                    </div>
                    
                    {submission.notes && (
                      <div className="mt-3 p-3 bg-gray-700 rounded-lg text-sm">
                        <p className="text-gray-300 font-medium">Review Notes:</p>
                        <p className="text-white">{submission.notes}</p>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-between">
                      <a
                        href={submission.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#9b9b6f] hover:text-[#7a7a58] text-sm flex items-center"
                      >
                        <Info className="h-3 w-3 mr-1" /> View Video
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              {submissions.length >= 3 && (
                <div className="mt-4 text-center">
                  <LinkButton 
                    to="/profile" 
                    variant="outline" 
                    size="sm"
                  >
                    View All Submissions
                  </LinkButton>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VideoSubmissionPage;