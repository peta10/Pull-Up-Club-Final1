import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface VideoSubmissionFormProps {
  onSubmissionComplete?: () => void;
}

const VideoSubmissionForm: React.FC<VideoSubmissionFormProps> = ({
  onSubmissionComplete,
}) => {
  const [pullUpCount, setPullUpCount] = useState<number>(0);
  const [videoLink, setVideoLink] = useState("");
  const [videoConfirmed, setVideoConfirmed] = useState(false);
  const [videoAuthenticity, setVideoAuthenticity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("No authenticated user found");
      }

      const { error: submissionError } = await supabase
        .from("submissions")
        .insert([
          {
            user_id: session.user.id,
            pull_up_count: pullUpCount,
            video_url: videoLink,
            status: "pending",
          },
        ]);

      if (submissionError) throw submissionError;

      // Call the onSubmissionComplete callback if it exists
      if (onSubmissionComplete) {
        onSubmissionComplete();
      }

      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit video");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-gray-800 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Submit Your Video
        </h2>

        {error && (
          <div className="bg-red-900 border border-red-700 text-white p-4 rounded-lg mb-6 flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pullUpCount" className="block text-white mb-1">
              Pull-Up Count <span className="text-[#9b9b6f]">*</span>
            </label>
            <input
              type="number"
              id="pullUpCount"
              min="1"
              max="100"
              value={pullUpCount || ""}
              onChange={(e) => setPullUpCount(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
              required
            />
          </div>

          <div>
            <label htmlFor="videoLink" className="block text-white mb-1">
              Video Link <span className="text-[#9b9b6f]">*</span>
            </label>
            <input
              type="url"
              id="videoLink"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
              required
            />
            <p className="mt-1 text-sm text-gray-400">
              Please upload your video to YouTube, Instagram, or TikTok and
              paste the public link here.
            </p>
          </div>

          <div className="flex items-start mt-4">
            <input
              type="checkbox"
              id="videoConfirmed"
              checked={videoConfirmed}
              onChange={(e) => setVideoConfirmed(e.target.checked)}
              className="w-5 h-5 mt-1 mr-3 rounded border-gray-300 text-[#9b9b6f] focus:ring-[#9b9b6f] cursor-pointer"
              required
            />
            <label htmlFor="videoConfirmed" className="text-gray-300 text-sm">
              I confirm that the video link I have provided is correct and
              publicly accessible.
              <span className="text-[#9b9b6f]">*</span>
            </label>
          </div>

          <div className="flex items-start mt-4">
            <input
              type="checkbox"
              id="videoAuthenticity"
              checked={videoAuthenticity}
              onChange={(e) => setVideoAuthenticity(e.target.checked)}
              className="w-5 h-5 mt-1 mr-3 rounded border-gray-300 text-[#9b9b6f] focus:ring-[#9b9b6f] cursor-pointer"
              required
            />
            <label
              htmlFor="videoAuthenticity"
              className="text-gray-300 text-sm"
            >
              I confirm this is an authentic video of my performance.
              <span className="text-[#9b9b6f]">*</span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={
              !pullUpCount ||
              !videoLink ||
              !videoConfirmed ||
              !videoAuthenticity ||
              isSubmitting
            }
            isLoading={isSubmitting}
            className="w-full"
          >
            Submit Video
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VideoSubmissionForm;
