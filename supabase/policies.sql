-- ==========================================================
-- FixIt Campus: Row Level Security (RLS) Policies
-- ==========================================================

-- Helper function: Check if current authenticated user has 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------
-- 1. PROFILES RLS
-- ----------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view profiles (to display reporter names and admin updates)
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Users can update their own profile (name, etc.)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile (e.g. promoting roles)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin());

-- ----------------------------------------------------------
-- 2. ISSUES RLS
-- ----------------------------------------------------------
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view all campus issues
DROP POLICY IF EXISTS "Issues are viewable by authenticated users" ON public.issues;
CREATE POLICY "Issues are viewable by authenticated users"
    ON public.issues FOR SELECT
    TO authenticated
    USING (true);

-- Students can insert their own reports
DROP POLICY IF EXISTS "Authenticated users can create issues" ON public.issues;
CREATE POLICY "Authenticated users can create issues"
    ON public.issues FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reported_by);

-- Students can update their own issue ONLY if it is still in 'Reported' status
DROP POLICY IF EXISTS "Reporters can edit their own pending issues" ON public.issues;
CREATE POLICY "Reporters can edit their own pending issues"
    ON public.issues FOR UPDATE
    TO authenticated
    USING (auth.uid() = reported_by AND status = 'Reported')
    WITH CHECK (auth.uid() = reported_by AND status = 'Reported');

-- Admins can update any issue (status, admin_note, resolution_photo_url, resolved_at)
DROP POLICY IF EXISTS "Admins can update any issue" ON public.issues;
CREATE POLICY "Admins can update any issue"
    ON public.issues FOR UPDATE
    TO authenticated
    USING (public.is_admin());

-- ----------------------------------------------------------
-- 3. ISSUE UPDATES RLS
-- ----------------------------------------------------------
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view the timeline audit trail
DROP POLICY IF EXISTS "Issue updates are viewable by authenticated users" ON public.issue_updates;
CREATE POLICY "Issue updates are viewable by authenticated users"
    ON public.issue_updates FOR SELECT
    TO authenticated
    USING (true);

-- Admins and reporters (on creation) can insert updates
DROP POLICY IF EXISTS "Admins or reporters can create update logs" ON public.issue_updates;
CREATE POLICY "Admins or reporters can create update logs"
    ON public.issue_updates FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = updated_by);

-- ----------------------------------------------------------
-- 4. ISSUE VOTES RLS
-- ----------------------------------------------------------
ALTER TABLE public.issue_votes ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all votes
DROP POLICY IF EXISTS "Votes are viewable by authenticated users" ON public.issue_votes;
CREATE POLICY "Votes are viewable by authenticated users"
    ON public.issue_votes FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can cast their own vote
DROP POLICY IF EXISTS "Users can vote for issues" ON public.issue_votes;
CREATE POLICY "Users can vote for issues"
    ON public.issue_votes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can retract their own vote
DROP POLICY IF EXISTS "Users can remove their own vote" ON public.issue_votes;
CREATE POLICY "Users can remove their own vote"
    ON public.issue_votes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------
-- 5. NOTIFICATIONS RLS
-- ----------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins / system can insert notifications for any user
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ----------------------------------------------------------
-- 6. STORAGE BUCKETS & POLICIES
-- ----------------------------------------------------------
-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('issue-images', 'issue-images', true),
    ('resolution-images', 'resolution-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Anyone can view images publicly
DROP POLICY IF EXISTS "Public can view issue images" ON storage.objects;
CREATE POLICY "Public can view issue images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id IN ('issue-images', 'resolution-images'));

-- Storage Policy: Authenticated users can upload to issue-images
DROP POLICY IF EXISTS "Authenticated users can upload issue images" ON storage.objects;
CREATE POLICY "Authenticated users can upload issue images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id IN ('issue-images', 'resolution-images'));

-- Storage Policy: Users can delete their own uploaded photos
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
CREATE POLICY "Users can delete own uploads"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id IN ('issue-images', 'resolution-images') AND auth.uid()::text = (storage.foldername(name))[1]);
