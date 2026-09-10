-- ==========================================================
-- FixIt Campus: Realistic Seed Data (SDG 6 Focus)
-- ==========================================================

-- NOTE FOR DEVELOPERS:
-- Since public.profiles requires existing auth.users rows,
-- this seed script uses a DO block to safely insert demo profiles
-- or reference the first existing profile in your Supabase project.

DO $$
DECLARE
    demo_user_id UUID;
    demo_admin_id UUID;
    issue_1_id UUID := 'a1b2c3d4-e5f6-4a5b-8c9d-012345678901'::UUID;
    issue_2_id UUID := 'a1b2c3d4-e5f6-4a5b-8c9d-012345678902'::UUID;
    issue_3_id UUID := 'a1b2c3d4-e5f6-4a5b-8c9d-012345678903'::UUID;
    issue_4_id UUID := 'a1b2c3d4-e5f6-4a5b-8c9d-012345678904'::UUID;
    issue_5_id UUID := 'a1b2c3d4-e5f6-4a5b-8c9d-012345678905'::UUID;
    issue_6_id UUID := 'a1b2c3d4-e5f6-4a5b-8c9d-012345678906'::UUID;
BEGIN
    -- Check if there is already an existing user in auth.users
    SELECT id INTO demo_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    -- If no user exists yet in auth.users, inform the administrator
    IF demo_user_id IS NULL THEN
        RAISE NOTICE 'No auth.users found in Supabase Auth. Please sign up at least one user via the FixIt Campus app, then rerun this seed script or execute the INSERT statements below with your profile ID.';
        RETURN;
    END IF;

    -- Pick or assign an admin
    SELECT id INTO demo_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    IF demo_admin_id IS NULL THEN
        demo_admin_id := demo_user_id;
        -- Promote the first user to admin for testing
        UPDATE public.profiles SET role = 'admin' WHERE id = demo_admin_id;
    END IF;

    -- 1. SEED ISSUES (Water & Sanitation)
    
    -- Issue 1: High Priority Tap Leakage (Reported)
    INSERT INTO public.issues (
        id, issue_code, title, description, category, priority, status,
        latitude, longitude, location_name, reported_by, created_at, updated_at
    ) VALUES (
        issue_1_id,
        'FIX-1001',
        'Continuous high-pressure tap leak on 2nd floor washroom',
        'The cold water tap in the second stall is loose and continuously spraying water across the floor, wasting clean water and creating a slip hazard.',
        'Tap',
        'Urgent',
        'Reported',
        12.971598,
        77.594562,
        'Washrooms',
        demo_user_id,
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- Issue 2: Water Cooler Waste in Library (In Progress)
    INSERT INTO public.issues (
        id, issue_code, title, description, category, priority, status,
        latitude, longitude, location_name, reported_by, admin_note, created_at, updated_at
    ) VALUES (
        issue_2_id,
        'FIX-1002',
        'Library RO drinking water dispenser drip tray overflowing',
        'Drain line beneath the main drinking water unit in the library reading room is disconnected. Water is pooling under the carpet and damaging books.',
        'Water',
        'High',
        'In Progress',
        12.972300,
        77.595100,
        'Library',
        demo_user_id,
        'Campus Facilities Team dispatched plumbing technician to reconnect drainage pipe.',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '3 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- Issue 3: Clogged Stormwater Drain at Canteen (Reported)
    INSERT INTO public.issues (
        id, issue_code, title, description, category, priority, status,
        latitude, longitude, location_name, reported_by, created_at, updated_at
    ) VALUES (
        issue_3_id,
        'FIX-1003',
        'Severe grease and leaf blockage in cafeteria back drain',
        'The perimeter drainage trench behind the student mess is overflowing with foul-smelling stagnant runoff. Needs urgent clearance to prevent pest infestation.',
        'Drainage',
        'High',
        'Reported',
        12.970800,
        77.593900,
        'Canteen',
        demo_user_id,
        NOW() - INTERVAL '5 hours',
        NOW() - INTERVAL '5 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- Issue 4: Main Hostel Sanitation Pressure Drop (In Progress)
    INSERT INTO public.issues (
        id, issue_code, title, description, category, priority, status,
        latitude, longitude, location_name, reported_by, admin_note, created_at, updated_at
    ) VALUES (
        issue_4_id,
        'FIX-1004',
        'Hostel Block 3 1st floor overhead tank feeder valve malfunctioning',
        'No water flow in morning hours for hostel showers and toilets. Students have to carry water buckets from ground floor.',
        'Sanitation',
        'Urgent',
        'In Progress',
        12.973100,
        77.596200,
        'Hostel',
        demo_user_id,
        'Maintenance team inspected the roof float valve. Replacement valve ordered and scheduled for installation this afternoon.',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '6 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- Issue 5: Broken sprinkler line on Sports Ground (Resolved)
    INSERT INTO public.issues (
        id, issue_code, title, description, category, priority, status,
        latitude, longitude, location_name, reported_by, admin_note, resolved_at, created_at, updated_at
    ) VALUES (
        issue_5_id,
        'FIX-1005',
        'Subsurface irrigation line ruptured near football pitch',
        'Large geyser of water noticed near east boundary line during evening practice. Grass area is completely waterlogged.',
        'Leakage',
        'Medium',
        'Resolved',
        12.969900,
        77.592500,
        'Sports Ground',
        demo_user_id,
        'Excavated section, spliced cracked 32mm PVC line, and tested pressure. Ground regraded.',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '1 day'
    ) ON CONFLICT (id) DO NOTHING;

    -- Issue 6: Engineering Block lab washbasin drain pipe loose (Reported)
    INSERT INTO public.issues (
        id, issue_code, title, description, category, priority, status,
        latitude, longitude, location_name, reported_by, created_at, updated_at
    ) VALUES (
        issue_6_id,
        'FIX-1006',
        'Chemistry Lab 4 sink waste siphon leaking onto chemical storage cabinet',
        'The PVC P-trap under the third sink has separated. Water drains straight onto the floor underneath.',
        'Leakage',
        'Urgent',
        'Reported',
        12.971900,
        77.593200,
        'Engineering Block',
        demo_user_id,
        NOW() - INTERVAL '40 minutes',
        NOW() - INTERVAL '40 minutes'
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. SEED TIMELINE AUDIT UPDATES for In Progress & Resolved issues
    
    -- Updates for FIX-1002
    INSERT INTO public.issue_updates (issue_id, old_status, new_status, updated_by, note, created_at)
    VALUES 
        (issue_2_id, 'Reported', 'In Progress', demo_admin_id, 'Technician assigned. Parts requested.', NOW() - INTERVAL '12 hours')
    ON CONFLICT DO NOTHING;

    -- Updates for FIX-1004
    INSERT INTO public.issue_updates (issue_id, old_status, new_status, updated_by, note, created_at)
    VALUES 
        (issue_4_id, 'Reported', 'In Progress', demo_admin_id, 'Site inspection completed. Tank float valve being replaced.', NOW() - INTERVAL '1 day')
    ON CONFLICT DO NOTHING;

    -- Updates for FIX-1005 (Resolved)
    INSERT INTO public.issue_updates (issue_id, old_status, new_status, updated_by, note, created_at)
    VALUES 
        (issue_5_id, 'Reported', 'In Progress', demo_admin_id, 'Irrigation main shut off. Digging initiated.', NOW() - INTERVAL '2 days'),
        (issue_5_id, 'In Progress', 'Resolved', demo_admin_id, 'Ruptured pipe replaced and verified leak-free.', NOW() - INTERVAL '1 day')
    ON CONFLICT DO NOTHING;

    -- 3. SEED ISSUE VOTES (Community upvotes)
    INSERT INTO public.issue_votes (issue_id, user_id, created_at)
    VALUES 
        (issue_1_id, demo_user_id, NOW() - INTERVAL '1 hour'),
        (issue_4_id, demo_user_id, NOW() - INTERVAL '18 hours')
    ON CONFLICT DO NOTHING;

    -- 4. SEED NOTIFICATIONS
    INSERT INTO public.notifications (user_id, issue_id, title, message, read, created_at)
    VALUES 
        (demo_user_id, issue_5_id, 'Issue Resolved', 'Your report FIX-1005 has been resolved.', false, NOW() - INTERVAL '1 day'),
        (demo_user_id, issue_2_id, 'Status Update', 'Your report FIX-1002 is now being worked on.', false, NOW() - INTERVAL '12 hours')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'FixIt Campus demo data seeded successfully!';
END $$;

-- ----------------------------------------------------------
-- HOW TO PROMOTE A USER TO ADMIN:
-- Replace with the email address of your registered campus administrator:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@campus.edu';
-- ----------------------------------------------------------
