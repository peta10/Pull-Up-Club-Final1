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

  const submitVideo = async ({ videoFile, pullUpCount, userId }: SubmitVideoParams): Promise<SubmitVideoResult> => {
    try {
      setUploading(true);
      setError(null);

      // Upload video to Supabase Storage
      const fileExt = videoFile.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, videoFile);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      // Create submission record
      const { error: submissionError } = await supabase.functions.invoke('video-submission', {
        body: {
          videoUrl: publicUrl,
          pullUpCount,
          userId
        }
      });

      if (submissionError) throw submissionError;

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit video';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  return {
    submitVideo,
    uploading,
    error
  };
};

export default useVideoSubmission; 