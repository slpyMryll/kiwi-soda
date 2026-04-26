import { 
  Compass, 
  Heart, 
  LifeBuoy, 
  Settings, 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Wallet,
  ShieldCheck,
  ShieldAlert,
  Users,
  CalendarDays,
  LucideIcon
} from "lucide-react";

export type NavItem = {
  name?: string;
  href?: string;
  icon?: LucideIcon;
  divider?: boolean;
};

export type UserRole = "admin" | "project-manager" | "viewer";

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: "/admin",
  "project-manager": "/project-manager",
  viewer: "/viewer",
};

export const NAV_CONFIG: Record<UserRole, NavItem[]> = {
  viewer: [
    { name: "Explore Feed", href: "/viewer", icon: Compass },
    { name: "My Following", href: "/viewer/following", icon: Heart },
    { name: "Transparency", href: "/viewer/transparency", icon: ShieldCheck },
    { divider: true },
    { name: "Support", href: "/viewer/support", icon: LifeBuoy },
    { name: "Settings", href: "/viewer/settings", icon: Settings },
  ],
  "project-manager": [
    { name: "Dashboard", href: "/project-manager", icon: LayoutDashboard },
    { name: "Projects", href: "/project-manager/projects", icon: FolderKanban },
    { name: "Tasks", href: "/project-manager/tasks", icon: CheckSquare },
    { name: "Budget", href: "/project-manager/budget", icon: Wallet },
    { divider: true },
    { name: "Support", href: "/project-manager/support", icon: LifeBuoy },
    { name: "Settings", href: "/project-manager/settings", icon: Settings },
  ],
  admin: [
    { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Term Management", href: "/admin/terms", icon: CalendarDays },
    { name: "Content Moderation", href: "/admin/moderation", icon: ShieldAlert },
    { divider: true },
    { name: "Activity Logs", href: "/admin/logs", icon: LifeBuoy },
    { name: "Platform Settings", href: "/admin/settings", icon: Settings },
  ],
};