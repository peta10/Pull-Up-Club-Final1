import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/AuthContext";
import SubmissionDashboard from "./SubmissionDashboard";
import ProfileSettings from "../../components/Profile/ProfileSettings";
import SubscriptionRewards from "./SubscriptionRewards";

const ProfilePage: React.FC = () => {
  const { user, isFirstLogin, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("submissions");
  const [formData, setFormData] = useState({
    fullName: "",
    socialMedia: "",
    age: "",
    gender: "",
    organization: "",
    region: "",
    phone: "",
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isFirstLogin && profile && !profile.isProfileCompleted) {
      setActiveTab("settings");
    }
  }, [isFirstLogin, profile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        socialMedia: profile.socialMedia || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        organization: profile.organization || '',
        region: profile.region || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const initial = profile ? {
      fullName: (profile as any).fullName ?? (profile as any).full_name ?? "",
      socialMedia: (profile as any).socialMedia ?? (profile as any).social_media ?? "",
      age: (profile as any).age !== undefined ? String((profile as any).age) : ((profile as any).age !== undefined ? String((profile as any).age) : ""),
      gender: (profile as any).gender ?? "",
      organization: (profile as any).organization ?? (profile as any).organisation ?? "",
      region: (profile as any).region ?? "",
      phone: (profile as any).phone ?? "",
    } : {
      fullName: "",
      socialMedia: "",
      age: "",
      gender: "",
      organization: "",
      region: "",
      phone: "",
    };
    setDirty(JSON.stringify(formData) !== JSON.stringify(initial));
  }, [formData, profile]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header - Clean, no background */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
          <p className="text-gray-400">{user?.email}</p>
        </div>

        {/* Tab Navigation - HORIZONTAL like before */}
        <div className="flex justify-center mb-8">
          <nav className="flex bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("submissions")}
              className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center ${
                activeTab === "submissions"
                  ? "bg-[#9b9b6f] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Submissions
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center ${
                activeTab === "settings"
                  ? "bg-[#9b9b6f] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center ${
                activeTab === "subscription"
                  ? "bg-[#9b9b6f] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Subscription & Rewards
            </button>
          </nav>
        </div>

        {/* Tab Content - No background wrapper, cards float on black */}
        <div className="max-w-6xl mx-auto">
          {activeTab === "submissions" && <SubmissionDashboard />}
          {activeTab === "settings" && <ProfileSettings />}
          {activeTab === "subscription" && <SubscriptionRewards />}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;