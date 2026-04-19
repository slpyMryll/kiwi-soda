# Changelog

All notable changes to the **OnTrack** project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [KS.010.006] - 2026-04-13

### Added

* Real-time comment editing and deletion with inline UI states
* AI FAQ chatbot with dual-LLM fallback, live context, and session persistence
* Native Web Share integration for project sharing on mobile apps
* Real-time notifications system for followed project updates
* Instant project creation and live dashboard synchronization
* Budget validation with automatic cost deduction and audit logging
* Profile, Settings, and Support pages with role-based routing

### Changed

* Standardized project status from “Active” to “Ongoing” for consistency
* Improved navigation with auto-scroll to feedback and clickable project cards
* Enhanced state management with real-time sync and optimistic UI updates
* Upgraded routing to middleware with faster, cached redirects
* Refined UI responsiveness, modals, sidebar behavior, and loading performance

### Fixed

* Comment sync issues to reflect edits and deletions across all views
* Next.js Supabase image host configuration error
* Project feed instability and filtering inconsistencies
* Dashboard publish/unpublish lag and real-time update delays
* Logout history loop and hydration (SSR/client) errors
* Modal overflow and sidebar z-index conflicts
* Timezone-related UI freezes and stale state issues

## [KS.010.005] - 2026-04-13

### Added

* Real-time project feed with infinite scrolling and live metrics
* Full project lifecycle system (tasks, feedback, budget tracking)
* Responsive Project Manager dashboard with filtering and timeline view
* Admin suite (activity logs, CMS for legal docs, user audit tracking)
* In-app notifications and automated email alerts via SendGrid
* Dedicated **My Following** page with followed-project filtering
* Centralized budget categories configuration

### Changed

* Migrated data fetching to TanStack Query for caching and instant UI updates
* Refactored filtering to use client-side state + pushstate (no reload)
* Improved timezone handling (UTC+8 / PHT) for accurate date filters
* Updated UI components for consistency and responsiveness
* Restricted visibility of detailed budget logs for guest users

### Fixed

* Fixed timezone bug causing incorrect “This Month” results
* Corrected dropdown/modal stacking (z-index issues)
* Fixed TypeScript build issues in Project Manager dashboard
* Ensured correct filtering of followed projects only
* Fixed loading experience with structured skeleton instead of blank/gradient screen

# [KS.010.004] - 2026-04-06

### Added

- **Real-Time Project Feed & Statistics:** Deployed a public-facing feed for Guests and Viewers with centralized, real-time project metrics and progress tracking.
- **Enhanced Project Manager Dashboard:** Added real-time project filtering and a responsive task timeline optimized for cross-device usage.
- **End-to-End Task & Feedback Management:** Implemented a complete task lifecycle with real-time state synchronization. Added role-based task approvals and threaded feedback modules within project details.
- **Budget Monitoring Systems:** Introduced a responsive budget tracking module with toggleable Grid and List views.
- **Notifications & Alerts System:** Integrated real-time in-app alerts and automated background workers for deadline email notifications.
- **User Management & Academic Structure:** Built a comprehensive administration suite for user management and academic term hierarchy (Terms/Officers) support.

### Changed

- **UI Responsiveness:** Ensured seamless experience between desktop and mobile views.
- **Project Detail Architecture:** Updated the project view to handle complex data relations for tasks, team members, and budget logs in a single unified interface.

### Fixed

- **Skeleton Hydration:** Fixed a `HeroBanner` property error in the dashboard loading state and refined skeleton UI to prevent layout shifts.
- **Navigation Logic:** Corrected sidebar "Active State" highlighting to ensure the root Dashboard link unsets when navigating to sub-modules like Tasks or Team.

## [KS.010.003] - 2026-03-15

### Added

- **Real-Time Synchronization Engine**: Integrated Supabase WebSockets across the Management Suite (Overview, Tasks, Team, Documents, and Timeline) for instant, cross-user updates.
- **Optimistic UI Implementation**: Replaced `router.refresh()` with local state management to eliminate "page jumping" and provide zero-latency visual feedback.
- **Financial Reversal Workflow**: New capability for Project Managers to "Reverse/Correct" approved expenses or total budget allocations.
- **Infinite Scroll Discovery**: Replaced static project lists with an Intersection Observer-based system for high-performance project discovery.
- **Advanced Project Analytics**: Interactive dashboard using Recharts to visualize team performance, budget vs. spending, and milestone distribution.
- **Drag-and-Drop Document Management**: Integrated Supabase Storage uploader with real-time file validation and secure storage mapping.
- **Public Preview Mode**: A read-only "Student View" toggle for PMs to verify project presentation, featuring a global "Preview Mode" visual banner.
- **Audit Trail v2**: Redesigned transparency log with "Voided" and "Correction" badges and prioritized action descriptions.

### Changed

- **Performance Optimization**: Migrated to parallel server-side queries and targeted column selection to minimize network payloads.
- **Navigation UX**: Relocated the "Back" button to the project detail header for better hierarchy and implemented URL state persistence for all project tabs.
- **UI Consistency**: Migrated native browser alerts to standardized React Dialog modals for all critical actions (approvals, deletions, reversals).
- **Automated Lifecycle**: Implemented automatic status transitions (Ongoing/Completed) driven by project progress percentages.

### Fixed

- **Budget Integrity**: Implemented zero-clamping logic in server actions to prevent negative `spent_budget` values during expense reversals.
- **Data Security**: Enforced strict database-level filtering to ensure "Draft" projects are invisible to viewers and guests.
- **Build Stability**: Fixed case-sensitivity import errors and type-mismatch overlaps that previously blocked Vercel deployments.

## [KS.010.002] - 2026-03-08

### Added

- Middleware-based RBAC enforcement for `/admin` and `/project-manager` routes.
- Dynamic navigation sidebar with active-route highlighting.
- Automatic dashboard redirection for authenticated users.

### Changed

- Refactored landing page fetching logic to be "Guest-Aware."
- Modularized navigation and authentication components for better scalability.

## [KS.010.001] - 2025-02-27

### Added

- Initial project foundation with Next.js and Supabase.
- Core Authentication system with VSU email validation.
- Basic Route Groups for `(auth)` and `(dashboard)`.
- Server Actions for centralized database logic.
