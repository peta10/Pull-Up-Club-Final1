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
};

interface MetricAlert {
  metric: string;
  value: number;
  threshold: number;
  message: string;
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
        message: `High badge processing time: ${avgProcessingTime.toFixed(2)}ms`
      });
    }

    // Check error rate
    const errorRate = (metrics.filter(m => !m.success).length / metrics.length) * 100;
    if (errorRate > ALERT_THRESHOLDS.error_rate) {
      alerts.push({
        metric: 'error_rate',
        value: errorRate,
        threshold: ALERT_THRESHOLDS.error_rate,
        message: `High badge assignment error rate: ${errorRate.toFixed(2)}%`
      });
    }

    // Check concurrent assignments
    const concurrentAssignments = metrics.reduce((sum, m) => sum + (m.assignments_count || 0), 0);
    if (concurrentAssignments > ALERT_THRESHOLDS.concurrent_assignments) {
      alerts.push({
        metric: 'concurrent_assignments',
        value: concurrentAssignments,
        threshold: ALERT_THRESHOLDS.concurrent_assignments,
        message: `High number of concurrent badge assignments: ${concurrentAssignments}`
      });
    }
  }

  return alerts;
}

async function logSystemMetrics() {
  // Get badge statistics
  const { data: stats, error: statsError } = await supabaseAdmin
    .from('badge_statistics')
    .select('*');

  if (statsError) throw statsError;

  if (stats) {
    // Log total badges awarded
    await supabaseAdmin.from('system_metrics').insert({
      metric_name: 'total_badges_awarded',
      metric_value: stats.reduce((sum, s) => sum + (s.total_awarded || 0), 0),
      metric_type: 'counter'
    });

    // Log average processing time
    await supabaseAdmin.from('system_metrics').insert({
      metric_name: 'avg_badge_processing_time',
      metric_value: stats.reduce((sum, s) => sum + (s.avg_processing_time || 0), 0) / stats.length,
      metric_type: 'gauge'
    });
  }

  // Get recent performance logs
  const { data: logs, error: logsError } = await supabaseAdmin
    .from('performance_logs')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

  if (logsError) throw logsError;

  if (logs) {
    // Calculate error rate
    const errorRate = (logs.filter(l => !l.success).length / logs.length) * 100;
    await supabaseAdmin.from('system_metrics').insert({
      metric_name: 'error_rate',
      metric_value: errorRate,
      metric_type: 'gauge'
    });
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
    const alerts = await checkBadgePerformance();

    return new Response(
      JSON.stringify({
        success: true,
        alerts,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: error.message.includes('Unauthorized') ? 403 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}); 