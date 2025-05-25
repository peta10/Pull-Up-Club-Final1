import { supabase } from '../lib/supabase';

/**
 * Utility function for making authenticated requests to Supabase Edge Functions
 * @param functionName The name of the Edge Function
 * @param route Optional route within the function (for multi-route functions)
 * @param body Optional request body
 * @param retries Number of retries in case of failure (default: 2)
 * @returns Response data
 */
export async function callEdgeFunction<T = any>(
  functionName: string, 
  route?: string, 
  body?: Record<string, any>,
  retries: number = 2
): Promise<T> {
  // Get the current session for authentication
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    throw new Error(`Authentication error: ${sessionError.message}`);
  }

  if (!session) {
    throw new Error('No active session found');
  }

  // Build the URL with optional route
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const url = route 
    ? `${baseUrl}/functions/v1/${functionName}/${route}`
    : `${baseUrl}/functions/v1/${functionName}`;

  let lastError: Error | null = null;
  
  // Try the request with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Make the request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: body ? JSON.stringify(body) : null
      });

      // Handle non-2xx responses
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
        let errorDetails: string | undefined;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData.details;
        } catch (e) {
          // Ignore JSON parsing errors
        }
        
        // Format error message with details if available
        const fullErrorMessage = errorDetails 
          ? `${errorMessage}: ${errorDetails}`
          : errorMessage;
          
        throw new Error(fullErrorMessage);
      }

      // Parse and return the response
      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this was the last attempt, throw the error
      if (attempt === retries) {
        throw lastError;
      }
      
      // Otherwise, wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 300;
      console.warn(`Edge function attempt ${attempt + 1} failed, retrying in ${delay}ms: ${lastError.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never happen due to the for loop structure, but TypeScript needs it
  throw new Error('Unexpected error in edge function call');
}

/**
 * Utility for calling the admin-api Edge Function
 */
export const adminApi = {
  /**
   * Get all submissions with user data
   */
  async getSubmissions(): Promise<any[]> {
    return callEdgeFunction('admin-api', 'get-submissions');
  },

  /**
   * Approve a submission
   */
  async approveSubmission(submissionId: string, actualCount: number): Promise<any> {
    return callEdgeFunction('admin-api', 'approve-submission', {
      submissionId,
      actualCount
    });
  },

  /**
   * Reject a submission
   */
  async rejectSubmission(submissionId: string, notes?: string): Promise<any> {
    return callEdgeFunction('admin-api', 'reject-submission', {
      submissionId,
      notes
    });
  },

  /**
   * Get all users
   */
  async getUsers(): Promise<any[]> {
    return callEdgeFunction('admin-api', 'get-users');
  },

  /**
   * Get admin dashboard stats
   */
  async getStats(): Promise<any> {
    return callEdgeFunction('admin-api', 'get-stats');
  },
  
  /**
   * Add or remove admin role for a user
   */
  async toggleAdmin(userId: string, action: 'add' | 'remove'): Promise<any> {
    return callEdgeFunction('add-admin', undefined, {
      user_id: userId,
      action: action === 'remove' ? 'remove' : 'add'
    });
  }
};