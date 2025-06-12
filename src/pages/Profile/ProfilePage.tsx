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
import { User, Building, Globe, Calendar, Users, MapPin } from "lucide-react";
import type { Submission } from '../../types';
import toast from 'react-hot-toast';

const REGION_OPTIONS = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Australia/Oceania"
];

const ProfilePage: React.FC = () => {
  const { user, signOut, isFirstLogin, profile, setProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "submissions" | "rankings" | "personal"
  >("submissions");
  const [formData, setFormData] = useState({
    fullName: "",
    socialMedia: "",
    age: "",
    gender: "",
    organization: "",
    region: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isFirstLogin && profile && !profile.isProfileCompleted) {
      setActiveTab("personal");
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
    ? getBadgesForSubmission(
        highestSubmission.actualPullUpCount ?? highestSubmission.pullUpCount,
        formData.gender || highestSubmission.gender || 'Male'
      )
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
    setDirty(true);
  };

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the form errors before saving');
      setIsSaving(false);
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          social_media: formData.socialMedia,
          age: parseInt(formData.age),
          gender: formData.gender,
          organization: formData.organization,
          region: formData.region,
          phone: formData.phone,
          is_profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);
      if (error) throw error;
      const { data: updated, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (fetchError) throw fetchError;
      if (setProfile) {
        setProfile((prev) => prev ? {
          ...prev,
          fullName: updated.full_name,
          socialMedia: updated.social_media,
          age: updated.age,
          gender: updated.gender,
          organization: updated.organization,
          region: updated.region,
          phone: updated.phone,
          isProfileCompleted: updated.is_profile_completed,
        } : prev);
      }
      toast.success('Profile updated successfully!', {
        duration: 3000,
        style: {
          background: '#1f2937',
          color: '#ffffff',
          border: '1px solid #9b9b6f',
        },
        iconTheme: {
          primary: '#9b9b6f',
          secondary: '#ffffff',
        },
      });
      setDirty(false);
    } catch (err: any) {
      console.error('Profile save error:', err);
      toast.error('Failed to save profile. Please try again.', {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#ffffff',
          border: '1px solid #ef4444',
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) errors.fullName = "Full Name is required";
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 13 || Number(formData.age) > 100) errors.age = "Valid age required (13-100)";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.region) errors.region = "Region is required";
    return errors;
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
                            Region *
                          </label>
                          <select
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                          >
                            <option value="">Select Region</option>
                            {REGION_OPTIONS.map((region) => (
                              <option key={region} value={region}>
                                {region}
                              </option>
                            ))}
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