import React, { useState, useEffect } from 'react';
import { User, Hash, Calendar, Users, Building, MapPin, Phone, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { regions } from '../../data/mockData';
import toast from 'react-hot-toast';

const ProfileSettings: React.FC = () => {
  const { user, profile, setProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    socialMedia: '',
    age: '',
    gender: '',
    organization: '',
    region: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        socialMedia: profile.social_media || '',
        age: profile.age ? String(profile.age) : '',
        gender: profile.gender || '',
        organization: profile.organization || '',
        region: profile.region || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const initial = {
      fullName: profile.full_name || '',
      socialMedia: profile.social_media || '',
      age: profile.age ? String(profile.age) : '',
      gender: profile.gender || '',
      organization: profile.organization || '',
      region: profile.region || '',
      phone: profile.phone || '',
    };
    setDirty(JSON.stringify(formData) !== JSON.stringify(initial));
  }, [formData, profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          social_media: formData.socialMedia,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
          organization: formData.organization,
          region: formData.region,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state
      if (setProfile && profile) {
        setProfile({
          ...profile,
          full_name: formData.fullName,
          social_media: formData.socialMedia,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
          organization: formData.organization,
          region: formData.region,
          phone: formData.phone,
        });
      }

      toast.success('Profile updated successfully!');
      setDirty(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900 p-6 rounded-lg text-center transform transition-transform hover:scale-105">
        <div className="flex items-center mb-6 justify-center">
          <Settings size={48} className="text-[#9b9b6f] mr-4" />
          <div className="text-left">
            <h3 className="text-xl font-bold text-white mb-2">Profile Settings</h3>
            <p className="text-gray-400">
              Update your profile information here. This information will be displayed on the leaderboard when you have an approved submission.
            </p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium mb-2 text-[#9b9b6f]">
                <User className="w-4 h-4 mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                name="fullName"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#9b9b6f] focus:outline-none transition-colors"
                placeholder="Enter your full name"
              />
              <p className="text-gray-500 text-xs mt-1">This will be displayed on the leaderboard</p>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-2 text-[#9b9b6f]">
                <Hash className="w-4 h-4 mr-1" />
                Social Media Handle
              </label>
              <input
                type="text"
                value={formData.socialMedia}
                onChange={handleInputChange}
                name="socialMedia"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#9b9b6f] focus:outline-none transition-colors"
                placeholder="yourusername"
              />
              <p className="text-gray-500 text-xs mt-1">
                Do not include the @ symbol, just your username. Displayed on leaderboard for social connections
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium mb-2 text-[#9b9b6f]">
                <Calendar className="w-4 h-4 mr-1" />
                Age *
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                name="age"
                required
                min="13"
                max="120"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#9b9b6f] focus:outline-none transition-colors"
                placeholder="25"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-2 text-[#9b9b6f]">
                <Users className="w-4 h-4 mr-1" />
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={handleInputChange}
                name="gender"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#9b9b6f] focus:outline-none transition-colors"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-2 text-[#9b9b6f]">
                <Building className="w-4 h-4 mr-1" />
                Club/Organization
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={handleInputChange}
                name="organization"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#9b9b6f] focus:outline-none transition-colors"
                placeholder="Wisloka Chicago"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium mb-2 text-[#9b9b6f]">
                <MapPin className="w-4 h-4 mr-1" />
                Region *
              </label>
              <select
                value={formData.region}
                onChange={handleInputChange}
                name="region"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#9b9b6f] focus:outline-none transition-colors"
              >
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-2 text-[#9b9b6f]">
                <Phone className="w-4 h-4 mr-1" />
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                name="phone"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#9b9b6f] focus:outline-none transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving || !dirty}
              className="w-full bg-[#9b9b6f] hover:bg-[#a5a575] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings; 