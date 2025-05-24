-- Create badge analytics functions

-- 1. Badge Distribution Statistics
CREATE OR REPLACE FUNCTION public.get_badge_distribution()
RETURNS TABLE (
    badge_id uuid,
    badge_name text,
    total_awarded bigint,
    percentage_of_users numeric,
    average_time_to_achieve interval
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH total_users AS (
        SELECT COUNT(DISTINCT id) as count FROM public.profiles WHERE role = 'user'
    )
    SELECT 
        b.id as badge_id,
        b.name as badge_name,
        COUNT(ub.id) as total_awarded,
        ROUND((COUNT(ub.id)::numeric / (SELECT count FROM total_users) * 100), 2) as percentage_of_users,
        AVG(ub.awarded_at - p.created_at) as average_time_to_achieve
    FROM public.badges b
    LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
    LEFT JOIN public.profiles p ON ub.user_id = p.id
    GROUP BY b.id, b.name
    ORDER BY b.min_pull_ups ASC;
END;
$$;

-- 2. Achievement Rate Analysis
CREATE OR REPLACE FUNCTION public.get_achievement_rates(
    p_time_window interval DEFAULT interval '30 days'
)
RETURNS TABLE (
    badge_id uuid,
    badge_name text,
    achievements_in_period bigint,
    daily_rate numeric,
    weekly_rate numeric,
    monthly_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as badge_id,
        b.name as badge_name,
        COUNT(ub.id) as achievements_in_period,
        ROUND(COUNT(ub.id)::numeric / EXTRACT(DAYS FROM p_time_window), 2) as daily_rate,
        ROUND(COUNT(ub.id)::numeric / (EXTRACT(DAYS FROM p_time_window) / 7), 2) as weekly_rate,
        ROUND(COUNT(ub.id)::numeric / (EXTRACT(DAYS FROM p_time_window) / 30), 2) as monthly_rate
    FROM public.badges b
    LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
    WHERE ub.awarded_at >= NOW() - p_time_window
    GROUP BY b.id, b.name
    ORDER BY b.min_pull_ups ASC;
END;
$$;

-- 3. Time-to-Achievement Metrics
CREATE OR REPLACE FUNCTION public.get_time_to_achievement_metrics()
RETURNS TABLE (
    badge_id uuid,
    badge_name text,
    min_time interval,
    max_time interval,
    avg_time interval,
    median_time interval
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as badge_id,
        b.name as badge_name,
        MIN(ub.awarded_at - p.created_at) as min_time,
        MAX(ub.awarded_at - p.created_at) as max_time,
        AVG(ub.awarded_at - p.created_at) as avg_time,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (ub.awarded_at - p.created_at)))::interval as median_time
    FROM public.badges b
    LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
    LEFT JOIN public.profiles p ON ub.user_id = p.id
    GROUP BY b.id, b.name
    ORDER BY b.min_pull_ups ASC;
END;
$$;

-- 4. Gender-based Badge Analysis
CREATE OR REPLACE FUNCTION public.get_gender_badge_analysis()
RETURNS TABLE (
    badge_id uuid,
    badge_name text,
    gender text,
    total_awarded bigint,
    percentage_of_gender numeric,
    avg_pull_ups numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH gender_totals AS (
        SELECT gender, COUNT(*) as count
        FROM public.profiles
        WHERE gender IS NOT NULL
        GROUP BY gender
    )
    SELECT 
        b.id as badge_id,
        b.name as badge_name,
        p.gender,
        COUNT(ub.id) as total_awarded,
        ROUND((COUNT(ub.id)::numeric / gt.count * 100), 2) as percentage_of_gender,
        ROUND(AVG(s.actual_pull_up_count), 2) as avg_pull_ups
    FROM public.badges b
    LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
    LEFT JOIN public.profiles p ON ub.user_id = p.id
    LEFT JOIN public.submissions s ON ub.submission_id = s.id
    LEFT JOIN gender_totals gt ON p.gender = gt.gender
    WHERE p.gender IS NOT NULL
    GROUP BY b.id, b.name, p.gender, gt.count
    ORDER BY b.min_pull_ups ASC, p.gender;
END;
$$;

-- 5. Organization Badge Performance
CREATE OR REPLACE FUNCTION public.get_organization_badge_performance()
RETURNS TABLE (
    organization text,
    total_members bigint,
    total_badges bigint,
    badges_per_member numeric,
    most_common_badge text,
    highest_achievement text,
    avg_time_to_first_badge interval
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH org_stats AS (
        SELECT 
            p.organisation,
            COUNT(DISTINCT p.id) as member_count,
            COUNT(DISTINCT ub.id) as badge_count,
            MODE() WITHIN GROUP (ORDER BY b.name) as common_badge,
            MAX(b.min_pull_ups) as max_pull_ups,
            MIN(ub.awarded_at - p.created_at) as time_to_first
        FROM public.profiles p
        LEFT JOIN public.user_badges ub ON p.id = ub.user_id
        LEFT JOIN public.badges b ON ub.badge_id = b.id
        WHERE p.organisation IS NOT NULL
        GROUP BY p.organisation
    )
    SELECT 
        os.organisation,
        os.member_count as total_members,
        os.badge_count as total_badges,
        ROUND(os.badge_count::numeric / os.member_count, 2) as badges_per_member,
        os.common_badge as most_common_badge,
        b.name as highest_achievement,
        os.time_to_first as avg_time_to_first_badge
    FROM org_stats os
    LEFT JOIN public.badges b ON b.min_pull_ups = os.max_pull_ups
    ORDER BY badges_per_member DESC;
END;
$$;

-- Create materialized view for badge analytics dashboard
CREATE MATERIALIZED VIEW public.badge_analytics_summary AS
WITH badge_stats AS (
    SELECT 
        b.id as badge_id,
        b.name as badge_name,
        COUNT(ub.id) as total_awarded,
        COUNT(DISTINCT ub.user_id) as unique_users,
        AVG(s.actual_pull_up_count) as avg_pull_ups,
        MIN(ub.awarded_at - p.created_at) as fastest_achievement,
        AVG(ub.awarded_at - p.created_at) as avg_achievement_time
    FROM public.badges b
    LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
    LEFT JOIN public.profiles p ON ub.user_id = p.id
    LEFT JOIN public.submissions s ON ub.submission_id = s.id
    GROUP BY b.id, b.name
)
SELECT 
    bs.*,
    ROUND((bs.total_awarded::numeric / NULLIF(SUM(bs.total_awarded) OVER (), 0) * 100), 2) as percentage_of_total_badges,
    ROUND((bs.unique_users::numeric / (SELECT COUNT(*) FROM public.profiles WHERE role = 'user') * 100), 2) as percentage_of_users
FROM badge_stats bs
ORDER BY bs.avg_pull_ups ASC;

-- Create index for better query performance
CREATE INDEX idx_badge_analytics_badge_id ON public.badge_analytics_summary (badge_id);

-- Create function to refresh analytics
CREATE OR REPLACE FUNCTION public.refresh_badge_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.badge_analytics_summary;
END;
$$;

-- Create trigger to refresh analytics when badges are awarded
CREATE OR REPLACE FUNCTION public.refresh_badge_analytics_on_award()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM public.refresh_badge_analytics();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_refresh_badge_analytics
    AFTER INSERT OR UPDATE ON public.user_badges
    FOR EACH ROW
    EXECUTE FUNCTION public.refresh_badge_analytics_on_award();

-- Add RLS policies
ALTER MATERIALIZED VIEW public.badge_analytics_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view badge analytics"
    ON public.badge_analytics_summary
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    )); 