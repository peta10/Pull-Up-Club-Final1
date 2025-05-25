import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface SubmissionData {
  pullUpCount: number;
  videoUrl: string;
  platform?: 'youtube' | 'instagram' | 'tiktok' | 'other';
  gender?: string;
  region?: string;
  clubAffiliation?: string;
}

interface UseVideoSubmissionReturn {
  isSubmitting: boolean;
  submitVideo: (data: SubmissionData) => Promise<{ success: boolean; error?: string }>;
  validateVideoUrl: (url: string) => { isValid: boolean; platform: string | null };
  error: string | null;
}

export default function useVideoSubmission(): UseVideoSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const validateVideoUrl = (url: string): { isValid: boolean; platform: string | null } => {
    try {
      // Ensure URL has a protocol
      let videoUrl = url;
      if (!url.match(/^https?:\/\//)) {
        videoUrl = `https://${url}`;
      }

      const parsedUrl = new URL(videoUrl);
      
      // YouTube URL patterns
      if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be')) {
        return { isValid: true, platform: 'youtube' };
      }
      
      // TikTok URL pattern
      if (parsedUrl.hostname.includes('tiktok.com')) {
        return { isValid: true, platform: 'tiktok' };
      }

      // Instagram URL pattern
      if (parsedUrl.hostname.includes('instagram.com')) {
        return { isValid: true, platform: 'instagram' };
      }

      // If it's a valid URL but not a recognized platform
      return { isValid: true, platform: 'other' };
      
    } catch (e) {
      // Invalid URL
      return { isValid: false, platform: null };
    }
  };

  const submitVideo = async (data: SubmissionData): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to submit a video' };
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Validate URL
      const { isValid, platform } = validateVideoUrl(data.videoUrl);
      
      if (!isValid) {
        throw new Error('Please enter a valid video URL');
      }

      // Submit to database
      const { error: submissionError } = await supabase.from('submissions').insert([
        {
          user_id: user.id,
          pull_up_count: data.pullUpCount,
          video_url: data.videoUrl,
          platform: platform || 'other',
          gender: data.gender,
          region: data.region,
          club_affiliation: data.clubAffiliation,
          status: 'pending'
        }
      ]);

      if (submissionError) {
        // Check for cooldown error
        if (submissionError.message.includes('wait 30 days')) {
          throw new Error('You must wait 30 days between submissions');
        }
        
        // Check for pending submissions
        if (submissionError.code === '23505') { // Unique constraint violation
          throw new Error('You already have a pending submission');
        }
        
        throw submissionError;
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit video';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitVideo,
    validateVideoUrl,
    error
  };
}