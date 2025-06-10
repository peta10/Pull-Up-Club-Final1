import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { SubmitVideoParams } from '../types';

interface SubmitVideoResult {
  success: boolean;
  error?: string;
}

export const useVideoSubmission = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitVideo = async ({ videoUrl, pullUpCount, userId }: SubmitVideoParams): Promise<SubmitVideoResult> => {
    try {
      setUploading(true);
      setError(null);

      // Insert submission with videoUrl
      const { error } = await supabase.from('submissions').insert([
        {
          user_id: userId,
          video_url: videoUrl,
          pull_up_count: pullUpCount,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setUploading(false);
      return { success: true };
    } catch (err: any) {
      setUploading(false);
      setError(err.message || 'Submission failed');
      return { success: false, error: err.message };
    }
  };

  return {
    submitVideo,
    uploading,
    error
  };
};

export default useVideoSubmission; 