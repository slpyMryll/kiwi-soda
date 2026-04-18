# Chatbot Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the chatbot (FaqFab) is visible on all viewer-related pages, including project detail pages, by moving it to a shared viewer layout.

**Architecture:** Create a nested layout `app/(dashboard)/viewer/layout.tsx` to host common components for all viewer routes.

**Tech Stack:** Next.js (App Router), React, Lucide React

---

### Task 1: Create Viewer Layout

**Files:**
- Create: `app/(dashboard)/viewer/layout.tsx`

- [ ] **Step 1: Write minimal implementation for ViewerLayout**

```tsx
import { FaqFab } from "@/app/components/ui/FaqFab";

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <FaqFab />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/viewer/layout.tsx
git commit -m "feat: add viewer layout with FaqFab for global visibility"
```

---

### Task 2: Remove Individual FaqFab Usages

**Files:**
- Modify: `app/(dashboard)/viewer/page.tsx`
- Modify: `app/(dashboard)/viewer/following/page.tsx`

- [ ] **Step 1: Remove FaqFab from viewer page**

File: `app/(dashboard)/viewer/page.tsx`
Action: Remove `import { FaqFab } from "@/app/components/ui/FaqFab";` and `<FaqFab />`.

- [ ] **Step 2: Remove FaqFab from following page**

File: `app/(dashboard)/viewer/following/page.tsx`
Action: Remove `import { FaqFab } from "@/app/components/ui/FaqFab";` and `<FaqFab />`.

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/viewer/page.tsx app/\(dashboard\)/viewer/following/page.tsx
git commit -m "refactor: remove redundant FaqFab instances in viewer pages"
```

---

### Task 3: Verification

- [ ] **Step 1: Verify on Viewer Dashboard**
- [ ] **Step 2: Verify on My Following Page**
- [ ] **Step 3: Verify on Transparency Hub**
- [ ] **Step 4: Verify on Project Detail Page**

Run locally and confirm the chatbot button is visible on all these pages.
Since I'm in a CLI, I'll rely on checking the file structure and imports.
Actually, I can run a build check to ensure no imports are broken.

Run: `npm run build` or `npx tsc --noEmit`
Expected: Success

- [ ] **Step 5: Final Commit**

```bash
git commit --allow-empty -m "docs: chatbot visibility task complete"
```
