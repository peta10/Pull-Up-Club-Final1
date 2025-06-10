import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase } from './supabase';

const DebugConnection: React.FC = () => {
  const [status, setStatus] = React.useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastChecked, setLastChecked] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw error;
        setStatus('connected');
        setError(null);
      } catch (err) {
        console.error('Database connection error:', err);
        setStatus('disconnected');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLastChecked(new Date());
      }
    };

    // Check connection immediately and then every 30 seconds
    checkConnection();
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') {
    return null;
  }

  if (status === 'connected') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-sm">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-300">Connection Error</h3>
            <p className="text-red-200 mt-1">
              {error || 'Unable to connect to the database. Some features may not work correctly.'}
            </p>
            {lastChecked && (
              <p className="text-red-400 text-xs mt-2">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugConnection; 