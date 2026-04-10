# OnTrack

*OnTrack is a web-based platform specifically tailored for the VSU-SSC to manage task and track budget while providing students with real-time project updates.*

## Releases

| Initial Release Code | Date Released |
| -------------------- | ------------- |
| KS.010.004           | [2026-04-06]  |
| KS.010.003           | [2026-03-15]  |
| KS.010.002           | [2026-03-08]  |
| KS.010.001           | [2025-02-27]  |

## KS.010.004 Release Notes

**What's New**

* **Core Features:**
  * Real-Time Project Feed & Statistics: Public project feed for viewers and guests combined with centralized, real-time project  metrics.
  * Responsive Project Manager Dashboard: Real-time project filtering, enhanced task timeline, and cross device responsiveness.
  * End-to-End  Task & Feedback Management: Task lifecycle management with real-time sync, role-based approvals, threaded feedback, and PM notifications.
  * Budget Monitoring Systems: Responsive budget tracking with grid/list views and real-time updates.
  * Notifications & Alerts System: Real-time in-app alerts and automated deadline  email notifications.
  * Admin & Moderation  Tools: Real-time in-app alerts and automated deadline email notifiations.
  * User Management & Academic Structure: Comprehensive user administration with academic term hierarchy support.

## KS.010.003 Release Notes

**What's New**

* **Core Features**:

  * Public Project Feeds: Introduced a public feed to enable browsing of available projects.
  * Project Manager Management: Implemented comprehensive management functionalities for Project Managers.
  * Unified Project Details: Consolidated project detail views into a single, cohesive structure.
  * Mock Data Type Correction: Resolved inconsistencies related to mock date data types.
  * Project Manager Workflow: Resolved inconsistencies related to mock date data types.

## KS.010.002 Release Notes

**What's New**

* **Core Features:**
  * Role-Based Access Control (RBAC): Middleware-based access control that restricts route (/admin, /project-manager, /viewer) based on authenticated roles.
  * Multi-Role Dashboards: Dedicated dashboards for Admin, Project Manager, and Viewer, each with role-specific navigation and permissions.
  * Dynamic Navigation System: Sidebar automatically highlights the active page with a lime-to-gradient and maintains clear visual feedback for users.
  * Guest-Aware Landing Page: Landing page intelligently handles guest users and authenticated sessions, preventing unnecessary data loading.
  * Automatic Dashboard Redirect: Authenticated users visiting / are instantly redirected to their respective dashboards for faster navigation.
* **Technical Setup:**
  * Middleware RBAC Implementation: Route protection handled through middleware to precent unauthorized access to restricted pages.
  * Optimized Data Fetching: Landing page refactored to avoid over-fetching and unnecessary API calls.
  * Navigation Configuration Update: Improved sidebar logic to correctly detect active routes and maintain consistent UI behavior.
  * UI Styling Enhancements: Added bachground opacity supports for active sidebar states while preserving readble dark green text.
  * Component-Based Structure: Navigation, authentication, and dashboard elements modularized for maintainability and scalabality.

## KS.010.001 Release Notes

**What's New**

- **Core Features:**
  - Server-Side RBAC: Automated routing for Admin, Project Manager, and Viewer roles.
  - Enhanced Auth UI: Fully responsive login and onboarding with real-time VSU email validation.
  - Advanced UI Controls: Integrated "Show Password" visibility toggles and contextual "Back" button navigation for improved accessibility.
  - Session Management: Integrated global logout and onboarding synchronization.
- **Technical Setup:**
  - Supabase Integration: Initialized Supabase client and server-side configurations for database connectivity.
  - Architecture Refactor: Implemented Next.js Route Groups (auth) and (dashboard) for scalable layout management.
  - Centralized Logic: Consolidated authentication and database interactions into centralized Server Actions.
  - Performance Optimization: Leveraged server-side redirects to eliminate "flickering" and ensure compact, viewport-fit layouts.

## KS.010.000 Release Notes

**What's New**

- **Technical Setup:**
  - Project Foundation: Established the directory structure following Next.js App Router conventions.
  - Global Styling: Configured Tailwind CSS with custom branding colors (Green-Dark, Surface-Brand) and typography (Plus Jakarta Sans, Inter).
  - Base Layout: Implemented the Root Layout with font optimization and global metadata.
  - Asset Management: Added initial brand assets including the project favicon and logo.

### Important Links

[Design Specs](https://github.com/slpyMryll/Kiwi-Soda-docportal)
