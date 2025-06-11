import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import SubmissionDashboard from "./SubmissionDashboard";
import PatchProgress from "./PatchProgress";
import { mockSubmissions, getBadgesForSubmission } from "../../data/mockData";
import { supabase } from "../../lib/supabase";
import { AlertTriangle, User, Building, Globe, Calendar, Users, MapPin } from "lucide-react";
import { Submission } from "../../types";

const ProfilePage: React.FC = () => {
  const { user, signOut, isFirstLogin, profile, setProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "submissions" | "rankings" | "personal"
  >("submissions");
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    socialMedia: "",
    age: "",
    gender: "",
    organization: "",
    city: "",
    state: "",
    country: "United States",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isFirstLogin && profile && !profile.isProfileCompleted) {
      setActiveTab("personal");
    }
  }, [isFirstLogin, profile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        socialMedia: profile.socialMedia || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "",
        organization: profile.organization || "",
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "United States",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const userSubmissions = mockSubmissions.filter(
    (sub) => sub.email === user?.email
  );

  const highestSubmission = userSubmissions.reduce((highest: Submission | null, current: Submission) => {
    const currentCount = current.actualPullUpCount ?? current.pullUpCount;
    const highestCount = highest
      ? (highest.actualPullUpCount ?? highest.pullUpCount)
      : 0;
    return currentCount > highestCount ? current : highest;
  }, null);

  const userBadges = highestSubmission
    ? getBadgesForSubmission(highestSubmission.actualPullUpCount ?? highestSubmission.pullUpCount)
    : [];
  const eliteBadge = userBadges.find((badge) => badge.id === "elite");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      // Use the custom RPC function
      const { error } = await supabase.rpc('update_user_profile', {
        profile_user_id: user?.id,
        full_name: formData.fullName,
        social_media_handle: formData.socialMedia,
        age: formData.age,
        gender: formData.gender,
        organization: formData.organization,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        phone: formData.phone,
        profile_completed: true
      });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      // Sync the profile state with the saved data
      if (profile && setProfile) {
        setProfile({
          ...profile,
          fullName: formData.fullName,
          socialMedia: formData.socialMedia,
          age: formData.age,
          gender: formData.gender,
          organization: formData.organization,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          phone: formData.phone,
          isProfileCompleted: true
        });
      }

      if (isFirstLogin) {
        setActiveTab("submissions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true);
    setDeactivateError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error(
          sessionError?.message ||
            "User not authenticated to get session for function call."
        );
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/cancel-stripe-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId: user!.id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Stripe cancellation error response:", errorData);
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Failed to cancel Stripe subscription"
        );
      }
      console.log("Stripe subscription cancellation successful");

      console.warn(
        "User deletion from auth schema should be handled by a secure backend function."
      );

      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Deactivation error:", err);
      setDeactivateError(
        err instanceof Error ? err.message : "Failed to deactivate account"
      );
      setIsDeactivating(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <Layout>
      <div className="bg-black min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Profile</h2>
                <p className="text-gray-400 mt-1">{user.email}</p>
              </div>
              <div className="flex items-center space-x-4">
                {eliteBadge && (
                  <Badge variant="elite" className="text-sm">
                    {eliteBadge.name}
                  </Badge>
                )}
              </div>
            </div>

            <div className="border-b border-gray-800">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab("submissions")}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "submissions"
                      ? "text-white border-b-2 border-[#9b9b6f]"
                      : "text-gray-400 hover:text-white"
                  }`}
                  disabled={
                    !!(
                      profile &&
                      !profile.isProfileCompleted &&
                      activeTab !== "personal"
                    )
                  }
                >
                  Submissions
                </button>
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "personal"
                      ? "text-white border-b-2 border-[#9b9b6f]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "submissions" && (
                <div className="space-y-6">
                  {/* Patch claim and Stripe portal buttons for all users with US-only disclaimer */}
                  <div className="flex flex-col md:flex-row gap-4 mb-2">
                    <a
                      href="https://shop.thebattlebunker.com/checkouts/cn/Z2NwLXVzLWNlbnRyYWwxOjAxSlhCMDJBTkVaOENFOFpTQlM2N1RTM0tR?auto_redirect=false&cart_link_id=MbgRQA7E&discount=PULLUPCLUB100&edge_redirect=true&locale=en-US&skip_shop_pay=true"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#9b9b6f] bg-[#9b9b6f] text-black hover:bg-[#7a7a58] text-sm px-4 py-2 w-full md:w-auto"
                    >
                      Claim your patch
                    </a>
                    <a
                      href="https://billing.stripe.com/p/login/test_dRmdR9dos2kmaQcdHGejK00"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#9b9b6f] bg-white/10 text-white hover:bg-white/20 text-sm px-4 py-2 w-full md:w-auto"
                    >
                      Manage Subscription
                    </a>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">US shipping only. International users are not eligible for the patch or physical rewards at this time.</p>
                  <SubmissionDashboard submissions={userSubmissions} />
                  <div className="p-6 border-t border-gray-800">
                    <PatchProgress />
                  </div>
                </div>
              )}
              {activeTab === "personal" && (
                <div className="space-y-6">
                  {/* Patch claim and Stripe portal buttons for all users with US-only disclaimer (Settings tab) */}
                  <div className="flex flex-col md:flex-row gap-4 mb-2">
                    <a
                      href="https://shop.thebattlebunker.com/checkouts/cn/Z2NwLXVzLWNlbnRyYWwxOjAxSlhCMDJBTkVaOENFOFpTQlM2N1RTM0tR?auto_redirect=false&cart_link_id=MbgRQA7E&discount=PULLUPCLUB100&edge_redirect=true&locale=en-US&skip_shop_pay=true"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#9b9b6f] bg-[#9b9b6f] text-black hover:bg-[#7a7a58] text-sm px-4 py-2 w-full md:w-auto"
                    >
                      Claim your patch
                    </a>
                    <a
                      href="https://billing.stripe.com/p/login/test_dRmdR9dos2kmaQcdHGejK00"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#9b9b6f] bg-white/10 text-white hover:bg-white/20 text-sm px-4 py-2 w-full md:w-auto"
                    >
                      Manage Subscription
                    </a>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">US shipping only. International users are not eligible for the patch or physical rewards at this time.</p>
                  {(isFirstLogin ||
                    (profile && !profile.isProfileCompleted)) && (
                    <div className="p-4 bg-[#9b9b6f] bg-opacity-20 border-l-4 border-[#9b9b6f]">
                      <p className="text-white">
                        Welcome to Pull-Up Club! Please complete your profile
                        information to fully access all features and receive
                        your welcome package.
                      </p>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-900 border border-red-700 text-white p-4 rounded-lg flex items-center">
                      <AlertTriangle size={20} className="mr-2" />
                      <span>{error}</span>
                    </div>
                  )}
                  <form onSubmit={handleSavePersonalInfo} className="space-y-6">
                    <div className="bg-gray-950 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            <User className="inline h-4 w-4 mr-1" />
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                            placeholder="Enter your full name"
                          />
                          <p className="text-xs text-gray-400 mt-1">This will be displayed on the leaderboard</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            <Globe className="inline h-4 w-4 mr-1" />
                            Social Media Handle
                          </label>
                          <input
                            type="text"
                            name="socialMedia"
                            value={formData.socialMedia}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                            placeholder="@yourusername"
                          />
                          <p className="text-xs text-gray-400 mt-1">Displayed on leaderboard for social connections</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Age *
                          </label>
                          <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            required
                            min="13"
                            max="100"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                            placeholder="25"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            <Users className="inline h-4 w-4 mr-1" />
                            Gender *
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            <Building className="inline h-4 w-4 mr-1" />
                            Club/Organization
                          </label>
                          <input
                            type="text"
                            name="organization"
                            value={formData.organization}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                            placeholder="Your gym, team, or club"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                            placeholder="Your city"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            State/Province *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                            placeholder="State or Province"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Country
                          </label>
                          <select
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                          >
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Australia">Australia</option>
                            <option value="Germany">Germany</option>
                            <option value="France">France</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Phone Number (Optional)
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="pt-4">
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="w-full bg-[#9b9b6f] hover:bg-[#8a8a63] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-950 border-t border-gray-800">
              <div className="flex justify-end">
                <Button
                  variant="danger"
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;