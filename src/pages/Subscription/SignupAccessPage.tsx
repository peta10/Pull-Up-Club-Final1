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
    organisation: ''
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
      
      // Redirect to success page or dashboard
      navigate('/success?account=created');

    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account. Please try again.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

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
      <div className="min-h-screen bg-black py-12">
        <div className="max-w-md mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-400">
              Now create your account to access the Pull-Up Club platform.
            </p>
          </div>

          {/* Account Creation Form */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Create Your Account</h2>
            
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  readOnly={!!verificationResult?.customerEmail}
                  className={`w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] ${
                    verificationResult?.customerEmail ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="13"
                    max="100"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                    placeholder="25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Organisation (Optional)
                </label>
                <input
                  type="text"
                  name="organisation"
                  value={formData.organisation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                  placeholder="Your gym, team, or organization"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f]"
                  placeholder="Confirm your password"
                />
              </div>

              <Button
                type="submit"
                disabled={isCreatingAccount}
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