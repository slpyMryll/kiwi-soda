# Changelog

All notable changes to the **OnTrack** project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

## [KS.010.001] - 2025-05-26
### Added
- Initial project foundation with Next.js and Supabase.
- Core Authentication system with VSU email validation.
- Basic Route Groups for `(auth)` and `(dashboard)`.
- Server Actions for centralized database logic.
