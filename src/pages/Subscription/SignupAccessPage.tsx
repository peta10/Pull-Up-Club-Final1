import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout/Layout';
import { Button } from '../../components/ui/Button';

interface VerificationResult {
  isValid: boolean;
  customerEmail?: string;
  subscriptionId?: string;
  customerId?: string;
  error?: string;
}

const REGION_OPTIONS = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Australia/Oceania"
];

const SignupAccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    age: '',
    gender: '',
    organisation: '',
    region: ''
  });

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/profile');
      return;
    }

    // If no session ID, redirect to subscription page
    if (!sessionId) {
      navigate('/subscription');
      return;
    }

    verifyStripeSession();
  }, [sessionId, user, navigate]);

  const verifyStripeSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-stripe-session', {
        body: { sessionId }
      });

      if (error) {
        console.error('Error verifying session:', error);
        setVerificationStatus('invalid');
        setVerificationResult({ isValid: false, error: 'Failed to verify payment session' });
        return;
      }

      if (data.success && data.isValid) {
        setVerificationStatus('valid');
        setVerificationResult(data);
        // Pre-fill email if available
        if (data.customerEmail) {
          setFormData(prev => ({ ...prev, email: data.customerEmail }));
        }
      } else {
        setVerificationStatus('invalid');
        setVerificationResult({ isValid: false, error: 'Payment session is not valid or expired' });
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      setVerificationStatus('invalid');
      setVerificationResult({ isValid: false, error: 'Failed to verify payment session' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAccount(true);

    try {
      // Validate form
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      // Create account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            age: formData.age ? parseInt(formData.age) : null,
            gender: formData.gender,
            organisation: formData.organisation,
            region: formData.region,
            stripe_customer_id: verificationResult?.customerId,
            is_paid: true
          }
        }
      });

      if (authError) {
        console.error('Error creating account:', authError);
        alert(`Failed to create account: ${authError.message}`);
        return;
      }

      // Account created successfully
      console.log('Account created successfully:', authData);
      
      // Wait a moment for the trigger to create the profile, then redirect
      setTimeout(() => {
        console.log('Redirecting to profile page...');
        navigate('/profile');
      }, 1500);

    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account. Please try again.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Password validation logic (copied from SignUpForm)
  const hasMinLength = formData.password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasLowerCase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center space-x-2 text-sm">
      <CheckCircle2 size={16} className={met ? "text-green-500" : "text-gray-500"} />
      <span className={met ? "text-green-500" : "text-gray-500"}>{text}</span>
    </div>
  );

  if (verificationStatus === 'loading') {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#9b9b6f] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Verifying Payment</h2>
            <p className="text-gray-400">Please wait while we verify your payment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (verificationStatus === 'invalid') {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Payment Verification Failed</h2>
            <p className="text-gray-400 mb-6">
              {verificationResult?.error || 'We could not verify your payment. Please try again.'}
            </p>
            <Button 
              onClick={() => navigate('/subscription')}
              className="bg-[#9b9b6f] text-black hover:bg-[#7a7a58]"
            >
              Back to Subscription
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden w-full">
        <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
          <div className="flex items-center justify-center mb-6">
            <img src="/PUClogo (1).webp" alt="Pull-Up Club Logo" className="h-16 w-auto" />
          </div>
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#9b9b6f] mb-2 text-center">Payment Successful!</h1>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Now create your account to access the Pull-Up Club platform.
          </p>
          <div className="w-full">
            <form onSubmit={handleCreateAccount} className="flex flex-col w-full gap-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                readOnly={!!verificationResult?.customerEmail}
                className={`w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] ${verificationResult?.customerEmail ? 'opacity-75 cursor-not-allowed' : ''}`}
                placeholder="Email"
              />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                placeholder="Full Name"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="13"
                  max="100"
                  className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                  placeholder="Age"
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                placeholder="Phone Number"
              />
              <input
                type="text"
                name="organisation"
                value={formData.organisation}
                onChange={handleInputChange}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                placeholder="Organisation (Optional)"
              />
              <div className="w-full">
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                >
                  <option value="">Region</option>
                  {REGION_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                placeholder="Password"
              />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                placeholder="Confirm Password"
              />
              {/* Password Requirements */}
              <div className="space-y-2 bg-white/5 p-4 rounded-xl">
                <p className="text-sm font-medium text-gray-300 mb-2">
                  Password Requirements:
                </p>
                <PasswordRequirement met={hasMinLength} text="At least 6 characters" />
                <PasswordRequirement met={hasUpperCase} text="One uppercase letter" />
                <PasswordRequirement met={hasLowerCase} text="One lowercase letter" />
                <PasswordRequirement met={hasNumber} text="One number" />
              </div>
              <Button
                type="submit"
                disabled={isCreatingAccount || !isPasswordValid}
                className="w-full bg-[#9b9b6f] text-black hover:bg-[#7a7a58] font-medium py-3"
              >
                {isCreatingAccount ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Account & Access Platform'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupAccessPage; 