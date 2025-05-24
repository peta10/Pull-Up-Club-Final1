import React, { useState } from "react";
import { Submission } from "../../types";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { getStatusInfo, getBadgesForSubmission } from "../../data/mockData";
import { Check, X, ExternalLink } from "lucide-react";

interface ReviewSubmissionProps {
  submission: Submission;
  onApprove: (id: string, actualCount: number) => void;
  onReject: (id: string) => void;
}

const ReviewSubmission: React.FC<ReviewSubmissionProps> = ({
  submission,
  onApprove,
  onReject,
}) => {
  const [actualCount, setActualCount] = useState(submission.pullUpCount);
  const { text, color } = getStatusInfo(submission.status);
  const badges = getBadgesForSubmission(submission);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-6">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-white text-xl font-bold">
              {submission.fullName}
            </h3>
            <p className="text-gray-400">
              Submitted on{" "}
              {new Date(submission.submissionDate).toLocaleDateString()}
            </p>
          </div>
          <div
            className={`${color} text-white text-sm font-medium px-3 py-1 rounded-full`}
          >
            {text}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-gray-300 font-medium mb-2">
              Submission Details
            </h4>
            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{submission.email}</span>
              </div>

              {submission.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white">{submission.phone}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-400">Age:</span>
                <span className="text-white">{submission.age}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Gender:</span>
                <span className="text-white">{submission.gender}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Club:</span>
                <span className="text-white">
                  {submission.clubAffiliation || "None"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Claimed Pull-Up Count:</span>
                <span className="text-white font-bold">
                  {submission.pullUpCount}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-gray-300 font-medium mb-2">Video</h4>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="mb-4 aspect-video bg-gray-800 flex items-center justify-center">
                <a
                  href={submission.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-red-400 hover:text-red-300"
                >
                  <ExternalLink size={40} />
                  <span className="mt-2">View Video</span>
                </a>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <p className="text-gray-400 text-sm">Eligible badges:</p>
                {badges.length > 0 ? (
                  badges.map((badge) => (
                    <Badge
                      key={badge.id}
                      variant={badge.id === "elite" ? "elite" : "default"}
                      className={
                        badge.id === "elite" ? "" : "bg-gray-600 text-white"
                      }
                    >
                      {badge.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">None</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {submission.status === "Pending" && (
          <div className="flex justify-end space-x-4 mt-6 items-center">
            <div className="flex items-center space-x-2">
              <label htmlFor="actualCount" className="text-gray-300">
                Actual Pull-Up Count:
              </label>
              <input
                type="number"
                id="actualCount"
                value={actualCount}
                onChange={(e) => setActualCount(Number(e.target.value))}
                min="0"
                className="w-20 px-2 py-1 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => onReject(submission.id)}
              className="flex items-center"
            >
              <X size={18} className="mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => onApprove(submission.id, actualCount)}
              className="flex items-center"
            >
              <Check size={18} className="mr-2" />
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSubmission;
