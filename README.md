# 🚰 FixIt Campus — SDG 6: Clean Water & Sanitation Platform

FixIt Campus is a full-stack, production-grade civic-reporting web application built for college and university campuses. It addresses **UN Sustainable Development Goal 6 (Clean Water & Sanitation)** by empowering students to report water leakages, broken taps, drinking fountain malfunctions, and sanitation/drainage hazards directly to campus facilities.

Administrators receive real-time triaged reports, execute status transitions with proof-of-work evidence, maintain an immutable timeline audit trail, and track resolution metrics with live database analytics.

---

## 🌟 Key Features

### 🎓 Student Experience
* **Secure Authentication**: Sign up and sign in with campus email.
* **Quick Civic Reporting**:
  * Dual-mode Geolocation: Hardware GPS location capture + indoor campus building/zone selector fallback.
  * Photo Evidence: Mobile camera direct capture (`capture="environment"`) or gallery upload with size/type validation.
  * Categorization: Water, Leakage, Tap, Sanitation, Drainage, Other.
  * Priority Levels: Low, Medium, High, Urgent.
* **Unique Issue Identification**: Automatic human-readable ticket codes (e.g. `FIX-1042`).
* **Transparency & Community Upvoting**: Prevent duplicate reports by upvoting existing issues to raise campus maintenance urgency (enforced 1 vote per user).
* **My Reports Tracking**: Filter and view personal report history.
* **In-App Notifications**: Real-time alert bell when facility admins change an issue's status.
* **Interactive Map**: OpenStreetMap Leaflet map displaying colored status pins across campus.

### 🛡️ Admin Experience
* **Operations Command Center**: High-level KPIs (Total Reports, Reported, In Progress, Resolved, Urgent Queue).
* **Urgent Triage Feed**: Immediate action queue for high-risk leaks.
* **Status Workflow Engine**:
  ```
  REPORTED ──► IN PROGRESS ──► RESOLVED
  ```
  * Every status transition mandates an audit log entry in `issue_updates`.
  * Status changes automatically send an in-app notification to the student reporter.
* **Proof-of-Resolution**: Upload repair evidence photos and maintenance notes before marking an issue resolved.
* **Live Facility Analytics**: Real-time resolution rate %, average turnaround hours, and category/status distributions.
* **Role-Based Access Control**: Strict route protection shielding `/admin/*` routes from unauthorized access.

---

## 🛠️ Tech Stack

* **Frontend Framework**: React 18
* **Build Tooling**: Vite
* **Routing**: React Router DOM (v6)
* **Backend-as-a-Service**: Supabase
  * **Database**: PostgreSQL with UUIDs, Sequences & Triggers
  * **Authentication**: GoTrue Auth with Profile Synchronization
  * **Storage**: S3-compatible Buckets (`issue-images`, `resolution-images`)
  * **Security**: Granular Row Level Security (RLS)
* **Mapping**: Leaflet + OpenStreetMap + React-Leaflet
* **Icons**: Lucide React
* **Styling**: Water-inspired civic design system with mobile-first bottom navigation

---

## 📂 Project Structure

```text
FixIt-Campus/
├── public/
│   └── logo.svg                     # High-res SVG droplet brand icon
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Header with brand, nav links, notifications, profile
│   │   ├── BottomNav.jsx            # Mobile bottom navigation bar
│   │   ├── IssueCard.jsx            # Interactive issue card with voting & thumbnail
│   │   ├── StatusBadge.jsx          # Color-coded status chip (Reported, In Progress, Resolved)
│   │   ├── PriorityBadge.jsx        # Priority chip (Low, Medium, High, Urgent)
│   │   ├── PhotoUploader.jsx        # Mobile camera/file intake with validation & preview
│   │   ├── LocationPicker.jsx       # Browser GPS + campus landmark indoor fallback
│   │   ├── MapView.jsx              # Leaflet OSM map with custom status pins
│   │   ├── IssueTimeline.jsx        # Vertical audit trail of status transitions
│   │   ├── StatCard.jsx             # Clean KPI metric card
│   │   ├── FilterBar.jsx            # Search, category, status, priority, sort controls
│   │   ├── NotificationBell.jsx     # In-app notification bell with unread badge
│   │   ├── LoadingState.jsx         # Accessible loading spinner
│   │   ├── EmptyState.jsx           # Friendly empty list placeholders
│   │   ├── ConfigBanner.jsx         # Setup guide if Supabase credentials are missing
│   │   └── ProtectedRoute.jsx       # Student & Admin route security guard
│   │
│   ├── pages/
│   │   ├── Home.jsx                 # SDG 6 Hero, urgent alerts, KPI counters, recent issues
│   │   ├── Login.jsx                # Tabbed Sign In / Sign Up with student/admin role selection
│   │   ├── ReportIssue.jsx          # Multi-step validated issue submission form
│   │   ├── MyReports.jsx            # Student's submitted reports with status filters
│   │   ├── AllIssues.jsx            # Public campus transparency directory
│   │   ├── IssueDetails.jsx         # Single issue view with mini-map, timeline, resolution proof
│   │   ├── CampusMap.jsx            # Full-screen interactive campus map with filters
│   │   └── admin/
│   │       ├── AdminDashboard.jsx   # Operations hub, urgent queue, recent activity
│   │       ├── AdminIssues.jsx      # Management table with bulk filters
│   │       ├── AdminIssueDetails.jsx# Status transition workflow, note, resolution photo upload
│   │       └── Analytics.jsx        # Real DB resolution rate, turnaround, and SDG 6 impact
│   │
│   ├── services/
│   │   ├── authService.js           # Supabase Auth, profiles, session management
│   │   ├── issueService.js          # Issue CRUD, status transitions, metrics, analytics
│   │   ├── uploadService.js         # Image validation and Supabase Storage uploads
│   │   ├── locationService.js       # Browser geolocation and campus landmark coords
│   │   ├── voteService.js           # Single-vote toggle and count tracking
│   │   └── notificationService.js   # In-app notification fetch, mark read, dispatch
│   │
│   ├── lib/
│   │   └── supabase.js              # Supabase client initialization & credential check
│   │
│   ├── App.jsx                      # Router root, session state, and global layout
│   ├── main.jsx                     # Vite React entrypoint
│   └── index.css                    # Modern civic tech design system & responsive rules
│
├── supabase/
│   ├── schema.sql                   # Full PostgreSQL schema, sequences, triggers, indexes
│   ├── policies.sql                 # Row Level Security (RLS) & Storage bucket rules
│   └── seed.sql                     # Realistic campus water & sanitation seed dataset
│
├── docs/
│   ├── architecture.md              # System design, subsystem interaction, data flow
│   └── database.md                  # Entity-Relationship diagram & schema dictionary
│
├── .env.example                     # Environment template
├── .gitignore                       # Standard git ignore configuration
├── package.json                     # NPM dependencies and scripts
├── vite.config.js                   # Vite configuration
└── README.md                        # Documentation & deployment guide
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (version 18.0 or higher)
* [npm](https://www.npmjs.com/) (version 9.0 or higher)
* A free [Supabase](https://supabase.com/) account

### 2. Installation
Clone or navigate into the project directory:

```bash
cd FixIt-Campus
npm install
```

### 3. Setting Up Supabase

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and create a **New Project**.
2. Note your **Project URL** and **anon public API Key** from **Project Settings ➔ API**.
3. Open the **SQL Editor** in your Supabase dashboard and run the following files in sequence:
   * **Step A**: Paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql)
   * **Step B**: Paste and run the contents of [`supabase/policies.sql`](supabase/policies.sql)
   * **Step C** (Optional demo data): Paste and run [`supabase/seed.sql`](supabase/seed.sql)

### 4. Setting Up Supabase Storage Buckets
The `supabase/policies.sql` script creates these automatically, but ensure in **Storage ➔ Buckets** that both exist and are set to **Public**:
* `issue-images`
* `resolution-images`

### 5. Configure Environment Variables
Create a `.env` file in the root of `FixIt-Campus`:

```bash
cp .env.example .env
```

Fill in your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Run the Local Development Server
Start the Vite development server:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 👥 Creating Accounts & Roles

### Student Account:
1. Click **Log In** in the top navbar.
2. Select the **Sign Up** tab.
3. Enter your Name, Email, and Password. Select **Student** as the role.
4. Click **Create Account**.

### Admin Account:
There are two ways to set up an Admin account:

**Option 1: In the UI during Sign Up**
* In the **Sign Up** tab, select the **Admin** role chip before submitting.

**Option 2: Direct Database Role Promotion**
* If an account is already registered, promote it using the Supabase SQL Editor:
  ```sql
  UPDATE public.profiles
  SET role = 'admin'
  WHERE email = 'your-email@campus.edu';
  ```

---

## 🧪 Complete End-to-End Testing Flow

To test the entire civic lifecycle:

1. **Student Flow**:
   * Sign in as a student.
   * Click **Report an Issue** on the home page or navbar.
   * Select category **Tap** or **Leakage**.
   * Title: `Leaking faucet in Chemistry Lab Ground Floor`.
   * Description: `The water tap under the fume hood will not close fully and drips constantly.`
   * Select priority **High**.
   * Attach a photo or click **Use My Location**.
   * Click **Submit Campus Report**.
   * Receive unique `FIX-XXXX` code (e.g. `FIX-1043`).
   * Verify it appears on **My Reports**, **All Issues**, and the **Campus Map**.

2. **Admin Flow**:
   * Sign in with your admin account.
   * Go to **Admin Hub** (`/admin`).
   * View the student's report in the triage list. Click **Manage**.
   * In **Maintenance Workflow**, choose **In Progress**. Add note: `Plumbing staff dispatched`.
   * Click **Commit Status**.
   * Verify the timeline updates with a timestamp and the student gets an in-app notification.
   * Later, switch status to **Resolved**, add note: `Replaced rubber washer, tested valve - no leak`, and optionally attach a resolution photo.
   * Click **Commit Status**.
   * Visit **Analytics** (`/admin/analytics`) and verify that resolution rate % and average turnaround reflect the updated report.

3. **Student Verification**:
   * Switch back to the student account.
   * Notice the red badge on the **Notification Bell** in the navbar.
   * Click the notification to open the issue.
   * Verify status is now **Resolved**, and observe the resolution note, resolution photo, and full visual timeline.

---

## 🚢 Production Build & Deployment

### Build for Production
To create an optimized production bundle:

```bash
npm run build
```

To preview the production bundle locally:

```bash
npm run preview
```

### Deploy to Vercel
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your FixIt Campus repository.
4. Set the **Framework Preset** to **Vite**.
5. Add the Environment Variables:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**.

---

## ❓ Troubleshooting

| Issue | Solution |
|---|---|
| **"Backend not configured" banner appears** | Ensure `.env` exists in the project root with valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Restart Vite (`npm run dev`). |
| **"Row level security policy violated"** | Run `supabase/policies.sql` in your Supabase SQL editor to install all necessary permissive and role-based policies. |
| **Images fail to upload** | Verify that `issue-images` and `resolution-images` buckets exist under Supabase **Storage ➔ Buckets** and are set to **Public**. |
| **Location button gives permission denied** | Browser security blocks geolocation on non-secure origins. Use `localhost` or HTTPS. Alternatively, choose a campus building from the dropdown. |
| **Map markers do not appear** | Ensure issues have valid `latitude` and `longitude` fields in the database. |

---

## 📜 License
FixIt Campus is distributed under the MIT License. Aligned with UN Sustainable Development Goal 6 (Clean Water & Sanitation).
