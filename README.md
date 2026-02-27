# OnTrack  
*OnTrack is a web-based platform specifically tailored for the VSU-SSC to manage task and track budget while providing students with real-time project updates.*

## Releases

| Initial Release Code | Date Released |
|----------------------|---------------|
| KS.010.001           | [2025-05-26]  |
|            |   |

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