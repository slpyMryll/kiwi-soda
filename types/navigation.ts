import { 
  Compass, 
  Heart, 
  LifeBuoy, 
  Settings, 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Wallet,
  PhilippinePeso, 
  ShieldAlert,
  Users,
  CalendarDays
} from "lucide-react";

export type NavItem = {
  name?: string;
  href?: string;
  icon?: any;
  divider?: boolean;
};

export const NAV_CONFIG: Record<string, NavItem[]> = {
  viewer: [
    { name: "Explore Feed", href: "/viewer", icon: Compass },
    { name: "My Following", href: "/viewer/following", icon: Heart },
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
    { name: "Reports & Reviews", href: "/admin/reports", icon: PhilippinePeso },
    { divider: true },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ],
};