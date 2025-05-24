import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const ALERT_THRESHOLDS = {
  badge_processing_time: 1000, // ms
  error_rate: 5, // percentage
  concurrent_assignments: 100,
  api_response_time: 2000, // ms
  function_execution_time: 5000, // ms
  database_query_time: 1000, // ms
  subscription_failure_rate: 3, // percentage
  video_processing_time: 10000, // ms
  storage_usage_percentage: 80, // percentage
};

interface MetricAlert {
  metric: string;
  value: number;
  threshold: number;
  message: string;
  severity: 'low' | 'medium' | 'high';
  component: string;
}

// Helper function to format durations
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const minutes = seconds / 60;
  return `${minutes.toFixed(2)}m`;
}

async function checkBadgePerformance(): Promise<MetricAlert[]> {
  const alerts: MetricAlert[] = [];
  
  // Get recent badge assignment metrics
  const { data: metrics, error } = await supabaseAdmin
    .from('badge_assignment_metrics')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes
    .order('timestamp', { ascending: false });

  if (error) throw error;

  if (metrics && metrics.length > 0) {
    // Check average processing time
    const avgProcessingTime = metrics.reduce((sum, m) => sum + (m.processing_time_ms || 0), 0) / metrics.length;
    if (avgProcessingTime > ALERT_THRESHOLDS.badge_processing_time) {
      alerts.push({
        metric: 'badge_processing_time',
        value: avgProcessingTime,
        threshold: ALERT_THRESHOLDS.badge_processing_time,
        message: `High badge processing time: ${formatDuration(avgProcessingTime)}`,
        severity: avgProcessingTime > ALERT_THRESHOLDS.badge_processing_time * 2 ? 'high' : 'medium',
        component: 'badge-system'
      });
    }

    // Check error rate
    const errorRate = (metrics.filter(m => !m.success).length / metrics.length) * 100;
    if (errorRate > ALERT_THRESHOLDS.error_rate) {
      alerts.push({
        metric: 'error_rate',
        value: errorRate,
        threshold: ALERT_THRESHOLDS.error_rate,
        message: `High badge assignment error rate: ${errorRate.toFixed(2)}%`,
        severity: errorRate > ALERT_THRESHOLDS.error_rate * 2 ? 'high' : 'medium',
        component: 'badge-system'
      });
    }

    // Check concurrent assignments
    const concurrentAssignments = metrics.reduce((sum, m) => sum + (m.assignments_count || 0), 0);
    if (concurrentAssignments > ALERT_THRESHOLDS.concurrent_assignments) {
      alerts.push({
        metric: 'concurrent_assignments',
        value: concurrentAssignments,
        threshold: ALERT_THRESHOLDS.concurrent_assignments,
        message: `High number of concurrent badge assignments: ${concurrentAssignments}`,
        severity: concurrentAssignments > ALERT_THRESHOLDS.concurrent_assignments * 2 ? 'high' : 'medium',
        component: 'badge-system'
      });
    }
  }

  return alerts;
}

async function checkDatabasePerformance(): Promise<MetricAlert[]> {
  const alerts: MetricAlert[] = [];
  
  // Get recent query performance metrics
  const { data: queryMetrics, error } = await supabaseAdmin
    .from('query_performance_logs')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes
    .order('timestamp', { ascending: false });

  if (error) throw error;

  if (queryMetrics && queryMetrics.length > 0) {
    // Group by query type
    const queryGroups: Record<string, any[]> = {};
    queryMetrics.forEach(metric => {
      const queryType = metric.query_type || 'unknown';
      if (!queryGroups[queryType]) {
        queryGroups[queryType] = [];
      }
      queryGroups[queryType].push(metric);
    });

    // Check each query type
    for (const [queryType, metrics] of Object.entries(queryGroups)) {
      const avgQueryTime = metrics.reduce((sum, m) => sum + (m.execution_time_ms || 0), 0) / metrics.length;
      if (avgQueryTime > ALERT_THRESHOLDS.database_query_time) {
        alerts.push({
          metric: 'database_query_time',
          value: avgQueryTime,
          threshold: ALERT_THRESHOLDS.database_query_time,
          message: `Slow ${queryType} queries: ${formatDuration(avgQueryTime)}`,
          severity: avgQueryTime > ALERT_THRESHOLDS.database_query_time * 2 ? 'high' : 'medium',
          component: 'database'
        });
      }
    }
  }

  return alerts;
}

async function checkAPIPerformance(): Promise<MetricAlert[]> {
  const alerts: MetricAlert[] = [];
  
  // Get recent API request metrics
  const { data: apiMetrics, error } = await supabaseAdmin
    .from('api_request_logs')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes
    .order('timestamp', { ascending: false });

  if (error) throw error;

  if (apiMetrics && apiMetrics.length > 0) {
    // Group by endpoint
    const endpointGroups: Record<string, any[]> = {};
    apiMetrics.forEach(metric => {
      const endpoint = metric.endpoint || 'unknown';
      if (!endpointGroups[endpoint]) {
        endpointGroups[endpoint] = [];
      }
      endpointGroups[endpoint].push(metric);
    });

    // Check each endpoint
    for (const [endpoint, metrics] of Object.entries(endpointGroups)) {
      const avgResponseTime = metrics.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / metrics.length;
      if (avgResponseTime > ALERT_THRESHOLDS.api_response_time) {
        alerts.push({
          metric: 'api_response_time',
          value: avgResponseTime,
          threshold: ALERT_THRESHOLDS.api_response_time,
          message: `Slow response time for ${endpoint}: ${formatDuration(avgResponseTime)}`,
          severity: avgResponseTime > ALERT_THRESHOLDS.api_response_time * 2 ? 'high' : 'medium',
          component: 'api'
        });
      }

      // Check error rate per endpoint
      const errorRate = (metrics.filter(m => m.status_code >= 400).length / metrics.length) * 100;
      if (errorRate > ALERT_THRESHOLDS.error_rate) {
        alerts.push({
          metric: 'api_error_rate',
          value: errorRate,
          threshold: ALERT_THRESHOLDS.error_rate,
          message: `High error rate for ${endpoint}: ${errorRate.toFixed(2)}%`,
          severity: errorRate > ALERT_THRESHOLDS.error_rate * 2 ? 'high' : 'medium',
          component: 'api'
        });
      }
    }
  }

  return alerts;
}

async function checkSubscriptionHealth(): Promise<MetricAlert[]> {
  const alerts: MetricAlert[] = [];
  
  // Get recent subscription events
  const { data: subscriptionEvents, error } = await supabaseAdmin
    .from('subscription_events')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
    .order('timestamp', { ascending: false });

  if (error) throw error;

  if (subscriptionEvents && subscriptionEvents.length > 0) {
    // Calculate failure rate
    const totalEvents = subscriptionEvents.length;
    const failedEvents = subscriptionEvents.filter(e => e.event_type === 'invoice.payment_failed').length;
    const failureRate = (failedEvents / totalEvents) * 100;
    
    if (failureRate > ALERT_THRESHOLDS.subscription_failure_rate) {
      alerts.push({
        metric: 'subscription_failure_rate',
        value: failureRate,
        threshold: ALERT_THRESHOLDS.subscription_failure_rate,
        message: `High subscription payment failure rate: ${failureRate.toFixed(2)}%`,
        severity: failureRate > ALERT_THRESHOLDS.subscription_failure_rate * 2 ? 'high' : 'medium',
        component: 'billing'
      });
    }
    
    // Check for cancellations spike
    const cancellations = subscriptionEvents.filter(e => e.event_type === 'customer.subscription.deleted').length;
    const cancellationRate = (cancellations / totalEvents) * 100;
    
    if (cancellationRate > 10) { // 10% cancellation rate is concerning
      alerts.push({
        metric: 'subscription_cancellation_rate',
        value: cancellationRate,
        threshold: 10,
        message: `High subscription cancellation rate: ${cancellationRate.toFixed(2)}%`,
        severity: cancellationRate > 20 ? 'high' : 'medium',
        component: 'billing'
      });
    }
  }

  return alerts;
}

async function logSystemMetrics() {
  // Current timestamp
  const timestamp = new Date().toISOString();
  const metrics = [];

  // Get badge statistics
  const { data: stats, error: statsError } = await supabaseAdmin
    .from('badge_statistics')
    .select('*');

  if (!statsError && stats) {
    // Log total badges awarded
    metrics.push({
      metric_name: 'total_badges_awarded',
      metric_value: stats.reduce((sum, s) => sum + (s.total_awarded || 0), 0),
      metric_type: 'counter',
      timestamp
    });

    // Log average processing time
    metrics.push({
      metric_name: 'avg_badge_processing_time',
      metric_value: stats.reduce((sum, s) => sum + (s.avg_processing_time || 0), 0) / stats.length,
      metric_type: 'gauge',
      timestamp
    });
  }

  // Get recent performance logs
  const { data: logs, error: logsError } = await supabaseAdmin
    .from('performance_logs')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

  if (!logsError && logs && logs.length > 0) {
    // Calculate error rate
    const errorRate = (logs.filter(l => !l.success).length / logs.length) * 100;
    metrics.push({
      metric_name: 'error_rate',
      metric_value: errorRate,
      metric_type: 'gauge',
      timestamp
    });

    // Calculate average response time
    const avgResponseTime = logs.reduce((sum, l) => sum + (l.duration_ms || 0), 0) / logs.length;
    metrics.push({
      metric_name: 'avg_response_time',
      metric_value: avgResponseTime,
      metric_type: 'gauge',
      timestamp
    });
  }

  // Get active user count in the last 24 hours
  const { data: activeUsers, error: userError } = await supabaseAdmin.rpc('count_active_users_last_24h');
  
  if (!userError && activeUsers) {
    metrics.push({
      metric_name: 'active_users_24h',
      metric_value: activeUsers,
      metric_type: 'gauge',
      timestamp
    });
  }

  // Get submission statistics
  const { data: submissions, error: submissionError } = await supabaseAdmin.rpc('get_submission_stats_last_24h');
  
  if (!submissionError && submissions) {
    metrics.push({
      metric_name: 'submissions_24h',
      metric_value: submissions.total_submissions || 0,
      metric_type: 'counter',
      timestamp
    });
    
    metrics.push({
      metric_name: 'approved_submissions_24h',
      metric_value: submissions.approved_submissions || 0,
      metric_type: 'counter',
      timestamp
    });
    
    metrics.push({
      metric_name: 'rejected_submissions_24h',
      metric_value: submissions.rejected_submissions || 0,
      metric_type: 'counter',
      timestamp
    });
  }

  // Insert all metrics in a single batch
  if (metrics.length > 0) {
    await supabaseAdmin.from('system_metrics').insert(metrics);
  }
}

serve(async (req: Request) => {
  try {
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    // Verify admin role
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const { data: adminRole } = await supabaseAdmin
      .from('admin_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (!adminRole) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Process monitoring tasks
    await logSystemMetrics();
    
    // Gather alerts from all subsystems
    const badgeAlerts = await checkBadgePerformance();
    const databaseAlerts = await checkDatabasePerformance();
    const apiAlerts = await checkAPIPerformance();
    const subscriptionAlerts = await checkSubscriptionHealth();
    
    const allAlerts = [
      ...badgeAlerts,
      ...databaseAlerts,
      ...apiAlerts,
      ...subscriptionAlerts
    ];
    
    // Get system statistics summary
    const { data: systemStats } = await supabaseAdmin.rpc('get_system_stats_summary');

    return new Response(
      JSON.stringify({
        success: true,
        alerts: allAlerts,
        stats: systemStats || {},
        alertCount: {
          total: allAlerts.length,
          high: allAlerts.filter(a => a.severity === 'high').length,
          medium: allAlerts.filter(a => a.severity === 'medium').length,
          low: allAlerts.filter(a => a.severity === 'low').length,
        },
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('System monitor error:', error);
    
    // Log the error
    try {
      await supabaseAdmin.from('error_logs').insert({
        error_message: error.message,
        error_stack: error.stack,
        component: 'system-monitor',
        severity: 'high'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: error.message.includes('Unauthorized') ? 403 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}); 