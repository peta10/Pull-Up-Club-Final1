import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout/Layout';
import SubmissionDashboard from './SubmissionDashboard';
import ProfileSettings from '../../components/Profile/ProfileSettings';

const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("submissions");

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900 p-6 rounded-lg">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-[#9b9b6f] rounded-full p-4">
                <User className="h-8 w-8 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{profile?.full_name || 'Loading...'}</h1>
                <p className="text-gray-400">{profile?.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab("submissions")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "submissions"
                    ? "text-[#9b9b6f] border-b-2 border-[#9b9b6f]"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Submissions
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "settings"
                    ? "text-[#9b9b6f] border-b-2 border-[#9b9b6f]"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Settings
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "submissions" ? (
                <SubmissionDashboard />
              ) : (
                <ProfileSettings />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;