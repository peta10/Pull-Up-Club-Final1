-- Create performance monitoring tables

-- System metrics table
CREATE TABLE public.system_metrics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    metric_type text NOT NULL,
    timestamp timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'
);

-- Performance logs table
CREATE TABLE public.performance_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    operation text NOT NULL,
    duration_ms integer NOT NULL,
    success boolean DEFAULT true,
    error_message text,
    metadata jsonb DEFAULT '{}',
    timestamp timestamptz DEFAULT now()
);

-- Badge assignment metrics table
CREATE TABLE public.badge_assignment_metrics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    badge_id uuid REFERENCES public.badges(id),
    assignments_count integer DEFAULT 0,
    processing_time_ms integer,
    success boolean DEFAULT true,
    error_count integer DEFAULT 0,
    batch_id uuid,
    timestamp timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_system_metrics_name_timestamp ON public.system_metrics (metric_name, timestamp);
CREATE INDEX idx_performance_logs_operation_timestamp ON public.performance_logs (operation, timestamp);
CREATE INDEX idx_badge_metrics_timestamp ON public.badge_assignment_metrics (timestamp);

-- Create materialized view for badge statistics
CREATE MATERIALIZED VIEW public.badge_statistics AS
WITH badge_stats AS (
    SELECT 
        b.id as badge_id,
        b.name as badge_name,
        COUNT(ub.id) as total_awarded,
        COUNT(DISTINCT ub.user_id) as unique_users,
        AVG(bam.processing_time_ms) as avg_processing_time,
        SUM(CASE WHEN bam.success = false THEN 1 ELSE 0 END) as error_count
    FROM public.badges b
    LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
    LEFT JOIN public.badge_assignment_metrics bam ON b.id = bam.badge_id
    GROUP BY b.id, b.name
)
SELECT 
    *,
    ROUND((total_awarded::numeric / NULLIF(SUM(total_awarded) OVER (), 0) * 100), 2) as percentage_of_total,
    ROUND((unique_users::numeric / (SELECT COUNT(*) FROM public.profiles WHERE role = 'user') * 100), 2) as user_percentage
FROM badge_stats;

-- Create function to log performance metrics
CREATE OR REPLACE FUNCTION public.log_performance(
    p_operation text,
    p_duration_ms integer,
    p_success boolean DEFAULT true,
    p_error_message text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id uuid;
BEGIN
    INSERT INTO public.performance_logs
        (operation, duration_ms, success, error_message, metadata)
    VALUES
        (p_operation, p_duration_ms, p_success, p_error_message, p_metadata)
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

-- Create function to log badge assignment metrics
CREATE OR REPLACE FUNCTION public.log_badge_assignment(
    p_badge_id uuid,
    p_count integer,
    p_processing_time_ms integer,
    p_success boolean DEFAULT true,
    p_error_count integer DEFAULT 0,
    p_batch_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_metric_id uuid;
BEGIN
    INSERT INTO public.badge_assignment_metrics
        (badge_id, assignments_count, processing_time_ms, success, error_count, batch_id)
    VALUES
        (p_badge_id, p_count, p_processing_time_ms, p_success, p_error_count, p_batch_id)
    RETURNING id INTO v_metric_id;

    RETURN v_metric_id;
END;
$$;

-- Create function to refresh badge statistics
CREATE OR REPLACE FUNCTION public.refresh_badge_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.badge_statistics;
END;
$$;

-- Create trigger to automatically refresh badge statistics
CREATE OR REPLACE FUNCTION public.refresh_badge_stats_on_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM public.refresh_badge_statistics();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_refresh_badge_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.user_badges
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.refresh_badge_stats_on_change();

-- Add RLS policies
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_assignment_metrics ENABLE ROW LEVEL SECURITY;
ALTER MATERIALIZED VIEW public.badge_statistics ENABLE ROW LEVEL SECURITY;

-- Only admins can view performance metrics
CREATE POLICY "Admin can view system metrics"
    ON public.system_metrics
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admin can view performance logs"
    ON public.performance_logs
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admin can view badge assignment metrics"
    ON public.badge_assignment_metrics
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admin can view badge statistics"
    ON public.badge_statistics
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    )); 