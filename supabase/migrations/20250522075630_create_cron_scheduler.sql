-- Create CRON scheduler tables and functions

-- CRON jobs table
CREATE TABLE public.cron_jobs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_name text NOT NULL UNIQUE,
    schedule_expression text NOT NULL,
    last_run timestamptz,
    next_run timestamptz,
    priority integer DEFAULT 1,
    concurrent_allowed boolean DEFAULT false,
    is_running boolean DEFAULT false,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- CRON execution history
CREATE TABLE public.cron_execution_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id uuid REFERENCES public.cron_jobs(id),
    start_time timestamptz NOT NULL,
    end_time timestamptz,
    success boolean,
    error_message text,
    metadata jsonb DEFAULT '{}'
);

-- Create indexes
CREATE INDEX idx_cron_jobs_next_run ON public.cron_jobs (next_run);
CREATE INDEX idx_cron_jobs_running ON public.cron_jobs (is_running);
CREATE INDEX idx_cron_execution_job_id ON public.cron_execution_history (job_id);

-- Function to calculate next run time
CREATE OR REPLACE FUNCTION public.calculate_next_run(
    p_schedule text,
    p_last_run timestamptz DEFAULT NULL
)
RETURNS timestamptz
LANGUAGE plpgsql
AS $$
DECLARE
    v_next timestamptz;
BEGIN
    -- Simple implementation for common intervals
    -- In production, you'd want a more robust CRON expression parser
    CASE
        WHEN p_schedule = '@hourly' THEN
            v_next := COALESCE(p_last_run, now()) + interval '1 hour';
        WHEN p_schedule = '@daily' THEN
            v_next := COALESCE(p_last_run, now()) + interval '1 day';
        WHEN p_schedule = '@weekly' THEN
            v_next := COALESCE(p_last_run, now()) + interval '1 week';
        WHEN p_schedule = '@monthly' THEN
            v_next := COALESCE(p_last_run, now()) + interval '1 month';
        ELSE
            -- Default to hourly if schedule not recognized
            v_next := COALESCE(p_last_run, now()) + interval '1 hour';
    END CASE;

    RETURN v_next;
END;
$$;

-- Function to acquire job lock
CREATE OR REPLACE FUNCTION public.acquire_cron_job_lock(
    p_job_name text,
    p_max_concurrent integer DEFAULT 3
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_job_id uuid;
    v_running_count integer;
BEGIN
    -- Check how many jobs are currently running
    SELECT COUNT(*) INTO v_running_count
    FROM public.cron_jobs
    WHERE is_running = true;

    -- Get the job if it's ready to run and we haven't hit concurrency limits
    SELECT id INTO v_job_id
    FROM public.cron_jobs
    WHERE job_name = p_job_name
    AND (next_run IS NULL OR next_run <= now())
    AND (concurrent_allowed OR NOT is_running)
    AND (v_running_count < p_max_concurrent)
    FOR UPDATE SKIP LOCKED;

    IF v_job_id IS NOT NULL THEN
        -- Update job status and create execution record
        UPDATE public.cron_jobs
        SET is_running = true,
            updated_at = now()
        WHERE id = v_job_id;

        INSERT INTO public.cron_execution_history (job_id, start_time)
        VALUES (v_job_id, now());
    END IF;

    RETURN v_job_id;
END;
$$;

-- Function to release job lock
CREATE OR REPLACE FUNCTION public.release_cron_job_lock(
    p_job_id uuid,
    p_success boolean DEFAULT true,
    p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_schedule text;
BEGIN
    -- Get job schedule
    SELECT schedule_expression INTO v_schedule
    FROM public.cron_jobs
    WHERE id = p_job_id;

    -- Update job status and history
    UPDATE public.cron_jobs
    SET is_running = false,
        last_run = now(),
        next_run = public.calculate_next_run(v_schedule, now()),
        updated_at = now()
    WHERE id = p_job_id;

    UPDATE public.cron_execution_history
    SET end_time = now(),
        success = p_success,
        error_message = p_error_message
    WHERE job_id = p_job_id
    AND end_time IS NULL;
END;
$$;

-- Insert default CRON jobs
INSERT INTO public.cron_jobs (job_name, schedule_expression, priority, concurrent_allowed) VALUES
('process_emails', '@hourly', 1, true),
('refresh_leaderboard', '@hourly', 2, false),
('refresh_badge_statistics', '@hourly', 2, false),
('system_monitoring', '@hourly', 1, true),
('billing_reminders', '@daily', 3, false),
('welcome_flow', '@hourly', 2, true);

-- Add RLS policies
ALTER TABLE public.cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_execution_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage CRON jobs"
    ON public.cron_jobs
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admin can view CRON execution history"
    ON public.cron_execution_history
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    )); 