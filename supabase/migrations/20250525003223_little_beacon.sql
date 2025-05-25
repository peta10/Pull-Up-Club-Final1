-- Migration to fix RLS performance issues
-- 1. Fix auth_rls_initplan warnings by wrapping auth functions in SELECT statements
-- 2. Fix multiple_permissive_policies warnings by combining policies for the same role and action

-- ============================================
-- FIX SUBMISSIONS TABLE POLICIES
-- ============================================

-- First, drop the existing policies that we'll replace
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can update their rejected submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admin users can view all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admin users can update all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admin users can delete submissions" ON public.submissions; -- For idempotency
DROP POLICY IF EXISTS "Combined submissions select policy" ON public.submissions; -- In case we need to rerun
DROP POLICY IF EXISTS "Combined submissions update policy" ON public.submissions; -- In case we need to rerun
DROP POLICY IF EXISTS "Users can insert their own submissions with validation" ON public.submissions; -- In case we need to rerun

-- Create optimized policies for submissions table
-- Combined SELECT policy for all roles
CREATE POLICY "Combined submissions select policy" ON public.submissions
    FOR SELECT
    TO public
    USING (
        ((SELECT auth.uid()) = user_id) OR
        (EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        ))
    );

-- Combined UPDATE policy for all roles
CREATE POLICY "Combined submissions update policy" ON public.submissions
    FOR UPDATE
    TO public
    USING (
        ((SELECT auth.uid()) = user_id AND status = 'rejected') OR
        (EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        ))
    );

-- Optimized INSERT policy
CREATE POLICY "Users can insert their own submissions" ON public.submissions
    FOR INSERT
    TO public
    WITH CHECK (
        (SELECT auth.uid()) = user_id AND
        (
            -- Users can submit if they have a rejected submission or meet the cooldown criteria
            EXISTS (
                SELECT 1 FROM public.submissions
                WHERE user_id = (SELECT auth.uid()) AND status = 'rejected'
            ) OR
            public.check_submission_eligibility((SELECT auth.uid()))
        )
    );

CREATE POLICY "Admin users can delete submissions" ON public.submissions
    FOR DELETE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX PROFILES TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can delete profiles" ON public.profiles; -- For idempotency
DROP POLICY IF EXISTS "Combined profiles select policy" ON public.profiles; -- In case we need to rerun
DROP POLICY IF EXISTS "Combined profiles update policy" ON public.profiles; -- In case we need to rerun

-- Create optimized policies for profiles table
-- Combined SELECT policy for all roles
CREATE POLICY "Combined profiles select policy" ON public.profiles
    FOR SELECT
    TO public
    USING (
        ((SELECT auth.uid()) = id) OR
        (EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        ))
    );

-- Combined UPDATE policy for all roles
CREATE POLICY "Combined profiles update policy" ON public.profiles
    FOR UPDATE
    TO public
    USING (
        ((SELECT auth.uid()) = id) OR
        (EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        ))
    );

CREATE POLICY "Admin users can delete profiles" ON public.profiles
    FOR DELETE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX SUBSCRIPTIONS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admin users can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admin users can update all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admin users can delete subscriptions" ON public.subscriptions; -- For idempotency
DROP POLICY IF EXISTS "Combined subscriptions select policy" ON public.subscriptions; -- In case we need to rerun

-- Create optimized policies for subscriptions table
-- Combined SELECT policy for all roles
CREATE POLICY "Combined subscriptions select policy" ON public.subscriptions
    FOR SELECT
    TO public
    USING (
        ((SELECT auth.uid()) = user_id) OR
        (EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        ))
    );

-- Admin UPDATE policy
CREATE POLICY "Admin users can update all subscriptions" ON public.subscriptions
    FOR UPDATE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Admin users can delete subscriptions" ON public.subscriptions
    FOR DELETE
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX MESSAGES_LOG TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages_log;
DROP POLICY IF EXISTS "Admin users can view all messages" ON public.messages_log;
DROP POLICY IF EXISTS "Admin users can insert messages" ON public.messages_log;
DROP POLICY IF EXISTS "Combined messages_log select policy" ON public.messages_log; -- In case we need to rerun

-- Create optimized policies for messages_log table
-- Combined SELECT policy for all roles
CREATE POLICY "Combined messages_log select policy" ON public.messages_log
    FOR SELECT
    TO public
    USING (
        ((SELECT auth.uid()) = user_id) OR
        (EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        ))
    );

-- Admin INSERT policy
CREATE POLICY "Admin users can insert messages" ON public.messages_log
    FOR INSERT
    TO public
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX BADGES TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can view badges" ON public.badges;
DROP POLICY IF EXISTS "Only admins can modify badges" ON public.badges;

-- Create optimized policies for badges table
-- Everyone can view badges
CREATE POLICY "Everyone can view badges" ON public.badges
    FOR SELECT
    TO public
    USING (true);

-- Only admins can modify badges (INSERT, UPDATE, DELETE)
CREATE POLICY "Only admins can modify badges" ON public.badges
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX USER_BADGES TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own badges" ON public.user_badges;
DROP POLICY IF EXISTS "Only admins can modify user badges" ON public.user_badges;
DROP POLICY IF EXISTS "Anyone can view all user badges" ON public.user_badges;

-- Create optimized policies for user_badges table
-- Combined SELECT policy (anyone can view all badges)
CREATE POLICY "Anyone can view all user badges" ON public.user_badges
    FOR SELECT
    TO public
    USING (true);

-- Only admins can modify badges
CREATE POLICY "Only admins can modify user badges" ON public.user_badges
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX ADMIN_ROLES TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own admin status" ON public.admin_roles;
DROP POLICY IF EXISTS "Admins can manage admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Combined admin_roles select policy" ON public.admin_roles; -- In case we need to rerun

-- Create optimized policies for admin_roles table
-- Combined SELECT policy
CREATE POLICY "Combined admin_roles select policy" ON public.admin_roles
    FOR SELECT
    TO public
    USING (
        ((SELECT auth.uid()) = user_id) OR
        (EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        ))
    );

-- Admin management policy (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage admin roles" ON public.admin_roles
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX NOTIFICATION_TEMPLATES TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage notification templates" ON public.notification_templates;

-- Create optimized policies for notification_templates table
CREATE POLICY "Admin can manage notification templates" ON public.notification_templates
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX NOTIFICATION_QUEUE TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notification_queue;
DROP POLICY IF EXISTS "Admin can manage all notifications" ON public.notification_queue;
DROP POLICY IF EXISTS "Combined notification_queue select policy" ON public.notification_queue; -- In case we need to rerun

-- Create optimized policies for notification_queue table
-- Combined SELECT policy
CREATE POLICY "Combined notification_queue select policy" ON public.notification_queue
    FOR SELECT
    TO public
    USING (
        ((SELECT auth.uid()) = user_id) OR
        (EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        ))
    );

-- Admin management policy
CREATE POLICY "Admin can manage all notifications" ON public.notification_queue
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX EMAIL_EVENTS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own email events" ON public.email_events;
DROP POLICY IF EXISTS "Admin can view all email events" ON public.email_events;
DROP POLICY IF EXISTS "Combined email_events select policy" ON public.email_events; -- In case we need to rerun

-- Create optimized policies for email_events table
-- Fixed policy using email field instead of user_id
CREATE POLICY "Users can view their own email events" ON public.email_events
    FOR SELECT
    TO public
    USING (
        email IN (
            SELECT email FROM auth.users
            WHERE id = (SELECT auth.uid())
        )
    );

-- Admin policy
CREATE POLICY "Admin can view all email events" ON public.email_events
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX EMAIL_ENGAGEMENT TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own email engagement" ON public.email_engagement;
DROP POLICY IF EXISTS "Admin can view all email engagement" ON public.email_engagement;
DROP POLICY IF EXISTS "Combined email_engagement select policy" ON public.email_engagement; -- In case we need to rerun

-- Create optimized policies for email_engagement table
-- Fixed policy using email field instead of user_id
CREATE POLICY "Users can view their own email engagement" ON public.email_engagement
    FOR SELECT
    TO public
    USING (
        email IN (
            SELECT email FROM auth.users
            WHERE id = (SELECT auth.uid())
        )
    );

-- Admin policy
CREATE POLICY "Admin can view all email engagement" ON public.email_engagement
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX EMAIL_SUPPRESSION TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own suppression status" ON public.email_suppression;
DROP POLICY IF EXISTS "Admin can manage suppression list" ON public.email_suppression;
DROP POLICY IF EXISTS "Combined email_suppression select policy" ON public.email_suppression; -- In case we need to rerun

-- Create optimized policies for email_suppression table
-- Fixed policy using email field instead of user_id
CREATE POLICY "Users can view their own suppression status" ON public.email_suppression
    FOR SELECT
    TO public
    USING (
        email IN (
            SELECT email FROM auth.users
            WHERE id = (SELECT auth.uid())
        )
    );

-- Admin management policy
CREATE POLICY "Admin can manage suppression list" ON public.email_suppression
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX SYSTEM_METRICS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view system metrics" ON public.system_metrics;

-- Create optimized policies for system_metrics table
CREATE POLICY "Admin can view system metrics" ON public.system_metrics
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX PERFORMANCE_LOGS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view performance logs" ON public.performance_logs;

-- Create optimized policies for performance_logs table
CREATE POLICY "Admin can view performance logs" ON public.performance_logs
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX BADGE_ASSIGNMENT_METRICS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view badge assignment metrics" ON public.badge_assignment_metrics;

-- Create optimized policies for badge_assignment_metrics table
CREATE POLICY "Admin can view badge assignment metrics" ON public.badge_assignment_metrics
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX CRON_JOBS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage CRON jobs" ON public.cron_jobs;

-- Create optimized policies for cron_jobs table
CREATE POLICY "Admin can manage CRON jobs" ON public.cron_jobs
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================
-- FIX CRON_EXECUTION_HISTORY TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view CRON execution history" ON public.cron_execution_history;

-- Create optimized policies for cron_execution_history table
CREATE POLICY "Admin can view CRON execution history" ON public.cron_execution_history
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- Conditionally create dependencies policies if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dependencies') THEN
        -- Drop existing policies if any
        DROP POLICY IF EXISTS "Admin can manage dependencies" ON public.dependencies;
        
        -- Create new policy
        CREATE POLICY "Admin can manage dependencies" ON public.dependencies
            FOR ALL
            TO public
            USING (
                EXISTS (
                    SELECT 1 FROM admin_roles
                    WHERE user_id = (SELECT auth.uid())
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM admin_roles
                    WHERE user_id = (SELECT auth.uid())
                )
            );
    END IF;
END
$$;

-- Conditionally create dependency_updates policies if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dependency_updates') THEN
        -- Drop existing policies if any
        DROP POLICY IF EXISTS "Admin can view dependency updates" ON public.dependency_updates;
        
        -- Create new policy
        CREATE POLICY "Admin can view dependency updates" ON public.dependency_updates
            FOR SELECT
            TO public
            USING (
                EXISTS (
                    SELECT 1 FROM admin_roles
                    WHERE user_id = (SELECT auth.uid())
                )
            );
    END IF;
END
$$;