import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const DebugConnection: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<
    'checking' | 'connected' | 'error'
  >('checking');
  const [authStatus, setAuthStatus] = useState<
    'checking' | 'authenticated' | 'unauthenticated' | 'error'
  >('checking');
  const [adminStatus, setAdminStatus] = useState<
    'checking' | 'admin' | 'not-admin' | 'error'
  >('checking');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check database connection
    const checkConnection = async () => {
      try {
        console.log('Checking database connection...');
        // Try a simple query that doesn't involve RLS
        const { data, error, count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        
        if (error) {
          throw error;
        }
        
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Database connection error:', error);
        setConnectionStatus('error');
        setErrorDetails(error instanceof Error ? error.message : 'Unknown connection error');
      }
    };
    
    // Check auth status
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          setAuthStatus('authenticated');
          setUserId(session.user.id);
          
          // Only check admin status if authenticated
          await checkAdminStatus(session.user.id);
        } else {
          setAuthStatus('unauthenticated');
          setAdminStatus('not-admin'); // Not authenticated means not admin
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthStatus('error');
        setErrorDetails(error instanceof Error ? error.message : 'Unknown auth error');
      }
    };
    
    // Check admin status
    const checkAdminStatus = async (userId: string) => {
      try {
        console.log('Checking admin status...');
        
        // Use a direct Edge Function call to bypass RLS issues
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-auth-status`, {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Admin check failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.user?.isAdmin) {
          setAdminStatus('admin');
        } else {
          setAdminStatus('not-admin');
        }
      } catch (error) {
        console.error('Admin status check error:', error);
        setAdminStatus('error');
        setErrorDetails(error instanceof Error ? error.message : 'Unknown admin check error');
      }
    };
    
    checkConnection();
    checkAuth();
  }, []);
  
  if (connectionStatus === 'checking' || authStatus === 'checking' || adminStatus === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg z-50 max-w-md">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#9b9b6f] mr-3"></div>
          <p className="text-white">Checking connection status...</p>
        </div>
      </div>
    );
  }
  
  if (connectionStatus === 'error' || authStatus === 'error' || adminStatus === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-900/80 p-4 rounded-lg shadow-lg z-50 max-w-md">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-red-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-white font-medium">Connection Error</h3>
            <p className="text-red-200 text-sm mt-1">
              {errorDetails || 'An error occurred connecting to the database.'}
            </p>
            <div className="mt-2 text-xs text-red-200">
              <p>Connection: {connectionStatus}</p>
              <p>Auth: {authStatus}</p>
              <p>Admin: {adminStatus}</p>
              {userId && <p>User ID: {userId}</p>}
            </div>
            <button 
              className="mt-2 px-3 py-1 bg-red-700 text-white text-sm rounded-md hover:bg-red-600"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (import.meta.env.DEV) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-900/50 p-3 rounded-lg shadow-lg z-50 text-sm border border-green-800">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
          <div>
            <p className="text-green-200">
              Connected to Supabase {authStatus === 'authenticated' ? '(Authenticated)' : '(Not logged in)'}
            </p>
            {adminStatus === 'admin' && (
              <p className="text-green-300 text-xs">Admin privileges detected</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return null; // In production, don't show anything when connected properly
};

export default DebugConnection;