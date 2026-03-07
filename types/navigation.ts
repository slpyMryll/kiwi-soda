import { 
  Compass, 
  Heart, 
  Map, 
  LifeBuoy, 
  Settings, 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Wallet,
  PhilippinePeso, 
} from "lucide-react";

export type NavItem = {
  name?: string;
  href?: string;
  icon?: any;
  divider?: boolean;
};

export const NAV_CONFIG: Record<string, NavItem[]> = {
  viewer: [
    { name: "Explore Feed", href: "/viewer/explore", icon: Compass },
    { name: "My Following", href: "/viewer/following", icon: Heart },
    { name: "Project Map", href: "/viewer/project-map", icon: Map },
    { divider: true },
    { name: "Support", href: "/viewer/support", icon: LifeBuoy },
    { name: "Settings", href: "/viewer/settings", icon: Settings },
  ],
  "project-manager": [
    { name: "Dashboard", href: "/project-manager/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/project-manager/projects", icon: FolderKanban },
    { name: "Tasks", href: "/project-manager/tasks", icon: CheckSquare },
    { name: "Budget", href: "/project-manager/budget", icon: Wallet },
    { divider: true },
    { name: "Support", href: "/project-manager/support", icon: LifeBuoy },
    { name: "Settings", href: "/project-manager/settings", icon: Settings },
  ],
  admin: [
    { name: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User", href: "/admin/users", icon: FolderKanban },
    { name: "Reports & Reviews", href: "/admin/reports", icon: PhilippinePeso },
    { name: "System Settings", href: "admin/settings", icon: Settings},
  ],
};