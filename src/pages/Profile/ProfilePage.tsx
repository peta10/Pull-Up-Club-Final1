import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import SubmissionDashboard from "./SubmissionDashboard";
import PatchProgress from "./PatchProgress";
import RankingsTab from "./RankingsTab";
import SubscriptionStatus from "./SubscriptionStatus";
import { mockSubmissions, getBadgesForSubmission } from "../../data/mockData";
import { supabase } from "../../lib/supabase";
import { AlertTriangle } from "lucide-react";
import { Submission } from "../../types";
import SubscriptionWidget from "../../components/Profile/SubscriptionWidget";

const ProfilePage: React.FC = () => {
  const { user, signOut, isFirstLogin, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "submissions" | "rankings" | "personal"
  >("submissions");
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    socialMedia: "",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
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
        socialMedia: profile.socialMedia || "",
        streetAddress: profile.streetAddress || "",
        apartment: profile.apartment || "",
        city: profile.city || "",
        state: profile.state || "",
        zipCode: profile.zipCode || "",
        country: profile.country || "",
      });
    }
  }, [profile]);

  const userSubmissions = mockSubmissions.filter(
    (sub) => sub.email === user?.email
  );
  const mockBillingHistory = [
    {
      id: "1",
      date: "2025-03-01",
      amount: "$10.00",
      status: "Paid",
      description: "Monthly Subscription",
    },
    {
      id: "2",
      date: "2025-02-01",
      amount: "$10.00",
      status: "Paid",
      description: "Monthly Subscription",
    },
  ];

  const highestSubmission = userSubmissions.reduce((highest: Submission | null, current: Submission) => {
    const currentCount = current.actualPullUpCount ?? current.pullUpCount;
    const highestCount = highest
      ? (highest.actualPullUpCount ?? highest.pullUpCount)
      : 0;
    return currentCount > highestCount ? current : highest;
  }, null);

  const userBadges = highestSubmission
    ? getBadgesForSubmission(highestSubmission)
    : [];
  const eliteBadge = userBadges.find((badge) => badge.id === "elite");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (
      !formData.streetAddress ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode ||
      !formData.country
    ) {
      setError("Please fill in all required address fields (*).");
      setIsSaving(false);
      return;
    }

    try {
      const { data: updateData, error: updateError } = await supabase
        .from("profiles")
        .update({
          social_media: formData.socialMedia || null,
          street_address: formData.streetAddress,
          apartment: formData.apartment || null,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country,
          is_profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log("Profile updated:", updateData);
      if (isFirstLogin) {
        setActiveTab("submissions");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
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
                <div className="bg-gray-800 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-white">
                    {profile?.isProfileCompleted ? (
                      <>
                        Subscription Status:{" "}
                        <span className="text-green-400">Active</span>
                      </>
                    ) : (
                      <>
                        Subscription Status:{" "}
                        <span className="text-yellow-400">
                          Pending Profile Completion
                        </span>
                      </>
                    )}
                  </span>
                </div>
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
                  onClick={() => setActiveTab("rankings")}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "rankings"
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
                  Your Direct Competitors
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
                  <SubscriptionWidget compact={true} />

                  <SubmissionDashboard submissions={userSubmissions} />

                  <div className="p-6 border-t border-gray-800">
                    <PatchProgress />
                  </div>
                </div>
              )}
              {activeTab === "rankings" && (
                <RankingsTab userEmail={user.email} />
              )}
              {activeTab === "personal" && (
                <div className="space-y-6">
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
                      <h3 className="text-lg font-medium text-white mb-4">
                        Social Media
                      </h3>
                      <div>
                        <label
                          htmlFor="socialMedia"
                          className="block text-sm font-medium text-gray-400"
                        >
                          Social Media Handle{" "}
                          <span className="text-gray-600">(optional)</span>
                        </label>
                        <input
                          type="text"
                          id="socialMedia"
                          name="socialMedia"
                          value={formData.socialMedia}
                          onChange={handleInputChange}
                          placeholder="@yourusername"
                          className="mt-1 block w-full rounded-md bg-gray-900 border border-gray-800 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          This will be displayed on the leaderboard if provided.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-950 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-4">
                        Shipping Address
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label
                            htmlFor="streetAddress"
                            className="block text-sm font-medium text-gray-400"
                          >
                            Street Address{" "}
                            <span className="text-[#9b9b6f]">*</span>
                          </label>
                          <input
                            type="text"
                            id="streetAddress"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md bg-gray-900 border border-gray-800 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="apartment"
                            className="block text-sm font-medium text-gray-400"
                          >
                            Apartment/Suite/Unit{" "}
                            <span className="text-gray-600">(optional)</span>
                          </label>
                          <input
                            type="text"
                            id="apartment"
                            name="apartment"
                            value={formData.apartment}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md bg-gray-900 border border-gray-800 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label
                              htmlFor="city"
                              className="block text-sm font-medium text-gray-400"
                            >
                              City <span className="text-[#9b9b6f]">*</span>
                            </label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              required
                              className="mt-1 block w-full rounded-md bg-gray-900 border border-gray-800 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="state"
                              className="block text-sm font-medium text-gray-400"
                            >
                              State/Province{" "}
                              <span className="text-[#9b9b6f]">*</span>
                            </label>
                            <input
                              type="text"
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              required
                              className="mt-1 block w-full rounded-md bg-gray-900 border border-gray-800 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label
                              htmlFor="zipCode"
                              className="block text-sm font-medium text-gray-400"
                            >
                              ZIP/Postal Code{" "}
                              <span className="text-[#9b9b6f]">*</span>
                            </label>
                            <input
                              type="text"
                              id="zipCode"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleInputChange}
                              required
                              className="mt-1 block w-full rounded-md bg-gray-900 border border-gray-800 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="country"
                              className="block text-sm font-medium text-gray-400"
                            >
                              Country <span className="text-[#9b9b6f]">*</span>
                            </label>
                            <input
                              type="text"
                              id="country"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              required
                              className="mt-1 block w-full rounded-md bg-gray-900 border border-gray-800 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <SubscriptionWidget />

                    <div className="bg-gray-950 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-white mb-4">
                        Account Settings
                      </h3>

                      <div className="space-y-4">
                        <div className="border-t border-gray-800 pt-4">
                          <h4 className="text-red-500 font-medium mb-2">
                            Danger Zone
                          </h4>
                          <p className="text-gray-400 text-sm mb-4">
                            Once you deactivate your account, it cannot be
                            recovered. All your data will be permanently
                            deleted.
                          </p>

                          {deactivateError && (
                            <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center text-red-200">
                              <AlertTriangle size={20} className="mr-2" />
                              <span>{deactivateError}</span>
                            </div>
                          )}

                          {showDeactivateConfirm ? (
                            <div className="bg-gray-900 p-4 rounded-lg border border-red-500">
                              <p className="text-white mb-4">
                                Are you sure you want to deactivate your
                                account? This action cannot be undone.
                              </p>
                              <div className="flex space-x-4">
                                <Button
                                  variant="danger"
                                  onClick={handleDeactivateAccount}
                                  isLoading={isDeactivating}
                                >
                                  Yes, Deactivate My Account
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setShowDeactivateConfirm(false)
                                  }
                                  disabled={isDeactivating}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="danger"
                              onClick={() => setShowDeactivateConfirm(true)}
                            >
                              Deactivate Account
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" isLoading={isSaving}>
                        Save Changes
                      </Button>
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