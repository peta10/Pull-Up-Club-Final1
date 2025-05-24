-- Create materialized view for leaderboard (internal)
CREATE MATERIALIZED VIEW public.leaderboard_internal AS
WITH ranked_submissions AS (
    SELECT 
        s.user_id,
        s.actual_pull_up_count,
        s.approved_at,
        p.full_name,
        p.gender,
        p.organisation,
        ROW_NUMBER() OVER (
            PARTITION BY s.user_id 
            ORDER BY s.actual_pull_up_count DESC, s.approved_at ASC
        ) as submission_rank
    FROM public.submissions s
    JOIN public.profiles p ON s.user_id = p.id
    WHERE s.status = 'approved'
)
SELECT 
    user_id,
    full_name,
    gender,
    organisation,
    actual_pull_up_count as best_pull_up_count,
    approved_at as achieved_at,
    RANK() OVER (ORDER BY actual_pull_up_count DESC, approved_at ASC) as overall_rank,
    RANK() OVER (PARTITION BY gender ORDER BY actual_pull_up_count DESC, approved_at ASC) as gender_rank,
    RANK() OVER (PARTITION BY organisation ORDER BY actual_pull_up_count DESC, approved_at ASC) as organisation_rank
FROM ranked_submissions
WHERE submission_rank = 1;

-- Create index for better query performance
CREATE INDEX idx_leaderboard_overall_rank ON public.leaderboard_internal (overall_rank);
CREATE INDEX idx_leaderboard_gender_rank ON public.leaderboard_internal (gender, gender_rank);
CREATE INDEX idx_leaderboard_org_rank ON public.leaderboard_internal (organisation, organisation_rank);

-- Create type for leaderboard entry
CREATE TYPE public.leaderboard_entry AS (
    user_id uuid,
    full_name text,
    gender text,
    organisation text,
    best_pull_up_count integer,
    achieved_at timestamptz,
    overall_rank bigint,
    gender_rank bigint,
    organisation_rank bigint
);

-- Create secure function to access leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(
    p_gender text DEFAULT NULL,
    p_organisation text DEFAULT NULL,
    p_limit integer DEFAULT 100,
    p_offset integer DEFAULT 0
)
RETURNS SETOF public.leaderboard_entry
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only allow authenticated users
    IF auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    RETURN QUERY
    SELECT *
    FROM public.leaderboard_internal
    WHERE (p_gender IS NULL OR gender = p_gender)
    AND (p_organisation IS NULL OR organisation = p_organisation)
    ORDER BY overall_rank ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Function to refresh leaderboard
CREATE OR REPLACE FUNCTION public.refresh_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_internal;
END;
$$;

-- Trigger to refresh leaderboard when submissions are approved
CREATE OR REPLACE FUNCTION public.refresh_leaderboard_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND NEW.status = 'approved' AND OLD.status != 'approved') OR
       (TG_OP = 'UPDATE' AND NEW.actual_pull_up_count != OLD.actual_pull_up_count) THEN
        PERFORM public.refresh_leaderboard();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_refresh_leaderboard
    AFTER UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.refresh_leaderboard_on_approval(); 