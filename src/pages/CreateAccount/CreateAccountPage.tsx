import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2, AlertTriangle, User, Building, Globe, Calendar, Users, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/Button";

const REGION_OPTIONS = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Australia/Oceania",
];

const CreateAccountPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    region: "North America",
    socialMedia: "",
    organization: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [intendedPlan, setIntendedPlan] = useState<"monthly" | "annual" | undefined>(undefined);
  const [returnTo, setReturnTo] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true, state: { success: "Account created and profile completed!" } });
      return;
    }
    // Extract state from location
    const routeState = location.state as {
      intendedAction?: string;
      plan?: "monthly" | "annual";
      returnTo?: string;
    } | null;
    if (routeState?.plan) setIntendedPlan(routeState.plan);
    if (routeState?.returnTo) setReturnTo(routeState.returnTo);
    const storedEmail = localStorage.getItem("checkoutEmail");
    if (storedEmail) setFormData((prev) => ({ ...prev, email: storedEmail }));
  }, [navigate, user, location.state]);

  // Validation
  const hasMinLength = formData.password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasLowerCase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid =
    formData.fullName &&
    formData.email &&
    isEmailValid(formData.email) &&
    isPasswordValid &&
    formData.password === formData.confirmPassword &&
    formData.age &&
    formData.gender &&
    formData.region;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!isFormValid) {
        setError("Please fill out all required fields and ensure passwords match.");
        setIsLoading(false);
        return;
      }
      await signUp(formData.email, formData.password);
      // Get the user ID from the current session
      const {
        data: { user: newUser },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !newUser) throw new Error("Could not get user after signup");
      // Update profile with all fields
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          age: parseInt(formData.age),
          gender: formData.gender,
          region: formData.region,
          social_media: formData.socialMedia,
          organisation: formData.organization,
          phone: formData.phone,
          is_profile_completed: true,
        })
        .eq("id", newUser.id);
      if (profileError) throw profileError;
      setSuccess("Account created and profile completed!");
      localStorage.removeItem("checkoutEmail");
      navigate("/profile", { replace: true, state: { success: "Account created and profile completed!" } });
    } catch (err: any) {
      setError(err?.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRequirement = ({
    met,
    text,
  }: {
    met: boolean;
    text: string;
  }) => (
    <div className="flex items-center space-x-2 text-sm">
      <CheckCircle2
        size={16}
        className={met ? "text-green-500" : "text-gray-500"}
      />
      <span className={met ? "text-green-500" : "text-gray-500"}>{text}</span>
    </div>
  );

  return (
    <Layout>
      <div className="bg-black min-h-screen py-16 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full mx-auto bg-gray-900 rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <p className="text-gray-400 mt-1">Sign up to join Pull-Up Club</p>
            </div>
          </div>
          <div className="p-6">
            {error && (
              <div className="bg-red-900 border border-red-700 text-white p-4 rounded-lg flex items-center mb-4">
                <AlertTriangle size={20} className="mr-2" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-900 border border-green-700 text-white p-4 rounded-lg flex items-center mb-4">
                <CheckCircle2 size={20} className="mr-2 text-green-400" />
                <span>{success}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Region *
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                    >
                      {REGION_OPTIONS.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div>
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                      placeholder="Create Password"
                    />
                    <div className="space-y-2 bg-white/5 p-2 rounded-xl mt-2">
                      <PasswordRequirement met={hasMinLength} text="At least 6 characters" />
                      <PasswordRequirement met={hasUpperCase} text="One uppercase letter" />
                      <PasswordRequirement met={hasLowerCase} text="One lowercase letter" />
                      <PasswordRequirement met={hasNumber} text="One number" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                      placeholder="Confirm Password"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="w-full bg-[#9b9b6f] hover:bg-[#8a8a63] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? "Processing..." : "Create Account"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateAccountPage;
