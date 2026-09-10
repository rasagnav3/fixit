# FixIt Campus — Database Schema & Security Specification

This document details the PostgreSQL schema, indexes, triggers, and Row Level Security (RLS) policies implemented in FixIt Campus.

---

## 1. Entity-Relationship Diagram

```
+------------------------------------+          +------------------------------------+
|          public.profiles           |          |           public.issues            |
+------------------------------------+          +------------------------------------+
| id (PK, UUID -> auth.users.id)     |1       * | id (PK, UUID)                      |
| name (TEXT)                        +----------+ issue_code (TEXT, UNIQUE, FIX-XXXX)|
| email (TEXT)                       |          | title (TEXT)                       |
| role (TEXT: 'student' | 'admin')   |          | description (TEXT)                 |
| created_at (TIMESTAMPTZ)           |          | category (TEXT)                    |
+-----------------+------------------+          | priority (TEXT)                    |
                  |                             | status (TEXT)                      |
                  | 1                           | photo_url (TEXT)                   |
                  |                             | resolution_photo_url (TEXT)        |
                  |                             | latitude (DOUBLE PRECISION)        |
                  |                             | longitude (DOUBLE PRECISION)       |
                  |                             | location_name (TEXT)               |
                  |                             | reported_by (FK -> profiles.id)    |
                  |                             | admin_note (TEXT)                  |
                  |                             | created_at (TIMESTAMPTZ)           |
                  |                             | updated_at (TIMESTAMPTZ)           |
                  |                             | resolved_at (TIMESTAMPTZ)          |
                  |                             +-----------------+------------------+
                  |                                               |
                  |                                               | 1
                  |          +------------------------------------+
                  |          |                     |
                  | *        | *                   | *
+-----------------v----------v-------+   +---------v--------------------------+
|       public.issue_updates         |   |         public.issue_votes         |
+------------------------------------+   +------------------------------------+
| id (PK, UUID)                      |   | id (PK, UUID)                      |
| issue_id (FK -> issues.id)         |   | issue_id (FK -> issues.id)         |
| old_status (TEXT)                  |   | user_id (FK -> profiles.id)        |
| new_status (TEXT)                  |   | created_at (TIMESTAMPTZ)           |
| updated_by (FK -> profiles.id)     |   +------------------------------------+
| note (TEXT)                        |   UNIQUE (issue_id, user_id)
| created_at (TIMESTAMPTZ)           |
+------------------------------------+
                  |
                  | 1
                  |
                  | *
+-----------------v------------------+
|       public.notifications         |
+------------------------------------+
| id (PK, UUID)                      |
| user_id (FK -> profiles.id)        |
| issue_id (FK -> issues.id)         |
| title (TEXT)                       |
| message (TEXT)                     |
| read (BOOLEAN DEFAULT FALSE)       |
| created_at (TIMESTAMPTZ)           |
+------------------------------------+
```

---

## 2. Table Dictionaries

### 2.1 `public.profiles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, References `auth.users(id)` ON DELETE CASCADE | Profile identifier linked with Auth user |
| `name` | `TEXT` | NOT NULL, DEFAULT `'Campus Member'` | User's full name |
| `email` | `TEXT` | NOT NULL | User's campus email |
| `role` | `TEXT` | NOT NULL, CHECK in `('student', 'admin')` | Application privilege level |
| `created_at` | `TIMESTAMPTZ`| NOT NULL, DEFAULT `NOW()` | Timestamp of account registration |

### 2.2 `public.issues`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `uuid_generate_v4()` | Unique report identifier |
| `issue_code` | `TEXT` | UNIQUE, NOT NULL | Human-readable identifier (e.g. `FIX-1042`) |
| `title` | `TEXT` | NOT NULL, min 5 chars | Concise summary of the problem |
| `description` | `TEXT` | NOT NULL, min 10 chars | Comprehensive details of the issue |
| `category` | `TEXT` | NOT NULL, CHECK in `('Water', 'Leakage', 'Tap', 'Sanitation', 'Drainage', 'Other')` | SDG 6 problem classification |
| `priority` | `TEXT` | NOT NULL, CHECK in `('Low', 'Medium', 'High', 'Urgent')` | Severity level |
| `status` | `TEXT` | NOT NULL, CHECK in `('Reported', 'In Progress', 'Resolved')` | Lifecycle stage |
| `photo_url` | `TEXT` | NULLABLE | Supabase Storage public URL of initial photo |
| `resolution_photo_url` | `TEXT` | NULLABLE | Supabase Storage public URL of resolution proof |
| `latitude` | `DOUBLE PRECISION`| NULLABLE | GPS latitude |
| `longitude` | `DOUBLE PRECISION`| NULLABLE | GPS longitude |
| `location_name` | `TEXT` | NOT NULL | Campus landmark zone name |
| `reported_by` | `UUID` | NOT NULL, FK -> `profiles.id` | User who created the report |
| `admin_note` | `TEXT` | NULLABLE | Latest administrative comment or resolution details |
| `created_at` | `TIMESTAMPTZ`| NOT NULL, DEFAULT `NOW()` | Report creation timestamp |
| `updated_at` | `TIMESTAMPTZ`| NOT NULL, DEFAULT `NOW()` | Last modification timestamp |
| `resolved_at` | `TIMESTAMPTZ`| NULLABLE | Timestamp when issue was marked Resolved |

### 2.3 `public.issue_updates`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `uuid_generate_v4()` | Audit record primary key |
| `issue_id` | `UUID` | NOT NULL, FK -> `issues.id` | Target issue |
| `old_status` | `TEXT` | NULLABLE | Previous status |
| `new_status` | `TEXT` | NOT NULL, CHECK in `('Reported', 'In Progress', 'Resolved')` | New status |
| `updated_by` | `UUID` | NOT NULL, FK -> `profiles.id` | User or admin who performed the update |
| `note` | `TEXT` | NULLABLE | Update comment or reason |
| `created_at` | `TIMESTAMPTZ`| NOT NULL, DEFAULT `NOW()` | Timestamp of the event |

### 2.4 `public.issue_votes`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `uuid_generate_v4()` | Vote record key |
| `issue_id` | `UUID` | NOT NULL, FK -> `issues.id` | Upvoted issue |
| `user_id` | `UUID` | NOT NULL, FK -> `profiles.id` | Voter |
| `created_at` | `TIMESTAMPTZ`| NOT NULL, DEFAULT `NOW()` | Vote timestamp |
| *Constraint* | `UNIQUE` | `(issue_id, user_id)` | Prevents duplicate voting |

### 2.5 `public.notifications`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `uuid_generate_v4()` | Notification record key |
| `user_id` | `UUID` | NOT NULL, FK -> `profiles.id` | Recipient user |
| `issue_id` | `UUID` | NULLABLE, FK -> `issues.id` | Associated issue |
| `title` | `TEXT` | NOT NULL | Alert title |
| `message` | `TEXT` | NOT NULL | Notification body |
| `read` | `BOOLEAN` | NOT NULL, DEFAULT `FALSE` | Read / unread status |
| `created_at` | `TIMESTAMPTZ`| NOT NULL, DEFAULT `NOW()` | Timestamp dispatched |

---

## 3. Row Level Security (RLS) Matrix

| Table | Operation | Target Role | Permitted If |
|---|---|---|---|
| `profiles` | SELECT | Authenticated | `true` (any authenticated user) |
| `profiles` | UPDATE | User | `auth.uid() = id` (own profile) |
| `profiles` | UPDATE | Admin | `is_admin() = true` |
| `issues` | SELECT | Authenticated | `true` (public transparency) |
| `issues` | INSERT | Student/Admin | `auth.uid() = reported_by` |
| `issues` | UPDATE | Student | `auth.uid() = reported_by AND status = 'Reported'` |
| `issues` | UPDATE | Admin | `is_admin() = true` |
| `issue_updates` | SELECT | Authenticated | `true` |
| `issue_updates` | INSERT | Authenticated | `auth.uid() = updated_by` |
| `issue_votes` | SELECT | Authenticated | `true` |
| `issue_votes` | INSERT | Authenticated | `auth.uid() = user_id` |
| `issue_votes` | DELETE | Authenticated | `auth.uid() = user_id` |
| `notifications` | SELECT | Authenticated | `auth.uid() = user_id` |
| `notifications` | UPDATE | Authenticated | `auth.uid() = user_id` |
| `notifications` | INSERT | Authenticated | `true` |
| `storage.objects` | SELECT | Public | In `('issue-images', 'resolution-images')` |
| `storage.objects` | INSERT | Authenticated | In `('issue-images', 'resolution-images')` |
