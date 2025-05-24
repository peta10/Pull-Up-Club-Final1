-- Drop existing leaderboard view and type
DROP MATERIALIZED VIEW IF EXISTS public.leaderboard_internal CASCADE;
DROP TYPE IF EXISTS public.leaderboard_entry CASCADE;

-- Create updated leaderboard entry type with badge info
CREATE TYPE public.leaderboard_entry AS (
    user_id uuid,
    full_name text,
    gender text,
    organisation text,
    best_pull_up_count integer,
    achieved_at timestamptz,
    overall_rank bigint,
    gender_rank bigint,
    organisation_rank bigint,
    badge_name text,
    badge_image_url text,
    badge_description text
);

-- Recreate materialized view with badge information
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
),
user_badges AS (
    SELECT 
        ub.user_id,
        b.name as badge_name,
        b.image_url as badge_image_url,
        b.description as badge_description,
        ROW_NUMBER() OVER (
            PARTITION BY ub.user_id 
            ORDER BY b.min_pull_ups DESC
        ) as badge_rank
    FROM public.user_badges ub
    JOIN public.badges b ON ub.badge_id = b.id
)
SELECT 
    rs.user_id,
    rs.full_name,
    rs.gender,
    rs.organisation,
    rs.actual_pull_up_count as best_pull_up_count,
    rs.approved_at as achieved_at,
    RANK() OVER (ORDER BY rs.actual_pull_up_count DESC, rs.approved_at ASC) as overall_rank,
    RANK() OVER (PARTITION BY rs.gender ORDER BY rs.actual_pull_up_count DESC, rs.approved_at ASC) as gender_rank,
    RANK() OVER (PARTITION BY rs.organisation ORDER BY rs.actual_pull_up_count DESC, rs.approved_at ASC) as organisation_rank,
    ub.badge_name,
    ub.badge_image_url,
    ub.badge_description
FROM ranked_submissions rs
LEFT JOIN user_badges ub ON rs.user_id = ub.user_id AND ub.badge_rank = 1
WHERE rs.submission_rank = 1;

-- Recreate indexes
CREATE INDEX idx_leaderboard_overall_rank ON public.leaderboard_internal (overall_rank);
CREATE INDEX idx_leaderboard_gender_rank ON public.leaderboard_internal (gender, gender_rank);
CREATE INDEX idx_leaderboard_org_rank ON public.leaderboard_internal (organisation, organisation_rank);

-- Update the get_leaderboard function to include badge information
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