-- ==========================================================
-- FixIt Campus: SDG 6 Clean Water & Sanitation Platform
-- Database Schema Definition (PostgreSQL / Supabase)
-- ==========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Campus Member',
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SEQUENCE & FUNCTION FOR HUMAN-READABLE ISSUE CODE (e.g. FIX-1001)
CREATE SEQUENCE IF NOT EXISTS issue_code_seq START WITH 1001;

CREATE OR REPLACE FUNCTION generate_issue_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.issue_code IS NULL OR NEW.issue_code = '' THEN
        NEW.issue_code := 'FIX-' || nextval('issue_code_seq')::TEXT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. ISSUES TABLE
CREATE TABLE IF NOT EXISTS public.issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL CHECK (char_length(title) >= 5),
    description TEXT NOT NULL CHECK (char_length(description) >= 10),
    category TEXT NOT NULL CHECK (category IN ('Water', 'Leakage', 'Tap', 'Sanitation', 'Drainage', 'Other')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    status TEXT NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported', 'In Progress', 'Resolved')),
    photo_url TEXT,
    resolution_photo_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_name TEXT NOT NULL,
    reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Attach trigger for automatic issue_code generation
DROP TRIGGER IF EXISTS trg_generate_issue_code ON public.issues;
CREATE TRIGGER trg_generate_issue_code
    BEFORE INSERT ON public.issues
    FOR EACH ROW
    EXECUTE FUNCTION generate_issue_code();

-- Function & Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_issues_updated_at ON public.issues;
CREATE TRIGGER trg_issues_updated_at
    BEFORE UPDATE ON public.issues
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- 4. ISSUE UPDATES TABLE (Audit trail of all status changes)
CREATE TABLE IF NOT EXISTS public.issue_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL CHECK (new_status IN ('Reported', 'In Progress', 'Resolved')),
    updated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ISSUE VOTES TABLE (Upvoting with single vote guarantee)
CREATE TABLE IF NOT EXISTS public.issue_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_issue_vote UNIQUE (issue_id, user_id)
);

-- 6. NOTIFICATIONS TABLE (In-app alerts for students)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. AUTO PROFILE CREATION ON SUPABASE AUTH SIGN-UP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
    user_name TEXT;
BEGIN
    -- Check if metadata specifies role, otherwise default to 'student'
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    IF assigned_role NOT IN ('student', 'admin') THEN
        assigned_role := 'student';
    END IF;

    user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

    INSERT INTO public.profiles (id, name, email, role, created_at)
    VALUES (NEW.id, user_name, NEW.email, assigned_role, NOW())
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON public.issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON public.issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_reported_by ON public.issues(reported_by);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON public.issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issue_updates_issue_id ON public.issue_updates(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_votes_issue_id ON public.issue_votes(issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
