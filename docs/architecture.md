# FixIt Campus — System Architecture Document

FixIt Campus is an enterprise-grade civic reporting platform tailored for campus infrastructure monitoring, aligned with **United Nations Sustainable Development Goal 6 (Clean Water & Sanitation)**.

---

## 1. High-Level Architectural Overview

FixIt Campus follows a modern Single-Page Application (SPA) architecture combined with Backend-as-a-Service (BaaS) powered by Supabase (PostgreSQL, GoTrue Auth, and S3-compatible Object Storage).

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|                                                                                   |
|  +---------------------+   +---------------------+   +-------------------------+  |
|  |   Student View      |   |   Operations Hub    |   |  Public Transparency    |  |
|  | - Quick Report      |   | - Admin Triage      |   | - Live Interactive Map  |  |
|  | - Photo & GPS       |   | - Status Workflow   |   | - Campus Issue Catalog  |  |
|  | - Upvoting & Alerts |   | - Resolution Proof  |   | - Real-time Analytics   |  |
|  +---------------------+   +---------------------+   +-------------------------+  |
|                                                                                   |
|               React 18 + Vite + React Router + Leaflet (OSM)                      |
+----------------------------------------+------------------------------------------+
                                         | HTTPS / REST / WebSockets
+----------------------------------------v------------------------------------------+
|                            SUPABASE PLATFORM TIER                                 |
|                                                                                   |
|  +--------------------+   +---------------------+   +--------------------------+  |
|  |  GoTrue Auth       |   |   PostgreSQL 15     |   |   Supabase Storage       |  |
|  | - JWT Tokens       |   | - Row Level Security|   | - issue-images           |  |
|  | - Role Profiles    |   | - Audit Trail Log   |   | - resolution-images      |  |
|  | - Student / Admin  |   | - Sequential Codes  |   | - CDN & Image Previews   |  |
|  +--------------------+   +---------------------+   +--------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Subsystems

### 2.1 Authentication & Role-Based Access Control (RBAC)
* **Identity Management**: Uses Supabase GoTrue authentication. Upon sign-up, a database trigger automatically populates the `public.profiles` table with user metadata and default role (`student`).
* **Roles**:
  * `student`: Can submit issues, view public issues, upvote, comment, and view their own reports.
  * `admin`: Accesses `/admin/*` routes, changes issue statuses, enters official administrative resolution notes, uploads proof-of-resolution photos, and views operational analytics.
* **Route Protection**: The React application uses `ProtectedRoute.jsx` to intercept unauthenticated requests and prevent unauthorized student access to `/admin` routes.

### 2.2 Reporting & Geolocation Engine
* **Multimodal Intake**:
  * Camera intake: Direct mobile access using `<input type="file" accept="image/*" capture="environment" />`.
  * Gallery intake: Allows uploading existing photos with client-side mime-type and payload size validation (< 5MB).
* **Dual-Mode Geolocation**:
  * Hardware GPS: Uses browser `navigator.geolocation.getCurrentPosition` with high accuracy.
  * Campus Landmark Fallback: Provides high-precision manual selection for multi-floor indoor reporting (e.g. *Main Block, Library, Canteen, Hostel, Parking Area, Sports Ground, Engineering Block, Washrooms*).

### 2.3 Status Transition & Audit Trail Subsystem
Issues strictly follow a deterministic state machine:

```
[ REPORTED ]  ────────►  [ IN PROGRESS ]  ────────►  [ RESOLVED ]
```

* **No Silent Overwrites**: Every status modification requires an atomic write to both `public.issues` and `public.issue_updates`.
* **Accountability**: `issue_updates` stores who authorized the transition (`updated_by`), previous status (`old_status`), new status (`new_status`), notes, and timestamp.
* **Resolution Verification**: Moving to `Resolved` requires an admin resolution note and allows uploading an optional resolution evidence photo. It automatically stamps `resolved_at`.

### 2.4 Notifications & Real-Time Feedback
* Status transitions trigger an entry into `public.notifications` for the issue reporter.
* The frontend navbar provides a live `NotificationBell.jsx` component displaying unread notification badges, timestamps, and direct deep links to the affected issue.

### 2.5 Mapping Subsystem
* Powered by Leaflet and OpenStreetMap.
* Custom status-colored marker pins:
  * **Reported**: Amber (`#F59E0B`)
  * **In Progress**: Blue (`#0284C7`)
  * **Resolved**: Emerald (`#10B981`)
* Interactive popup cards display thumbnail preview, category badge, priority badge, and navigation to full issue details.

---

## 3. Storage Pipeline

```
User File (JPEG/PNG/WebP)
   │
   ▼
Client-Side Validation (Type & < 5MB)
   │
   ▼
UUID-Salted Filename Generation (userId/timestamp-uuid.ext)
   │
   ▼
Supabase Storage Bucket ('issue-images' or 'resolution-images')
   │
   ▼
CDN Public URL Retrieved
   │
   ▼
Inserted into issues.photo_url or issues.resolution_photo_url
```
