"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_CONFIG } from "@/types/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "viewer" | "project-manager" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.viewer;

  return (
    <aside className="w-64 bg-bg-main flex-col h-[calc(100vh-72px)] sticky top-18 hidden lg:flex border-r border-gray-200/60">
      <nav className="flex-1 py-6 px-4 space-y-1.5">
        {navItems.map((item, index) => {
          if (item.divider) {
            return <div key={`divider-${index}`} className="h-px bg-gray-200/80 my-4 ml-4 mr-4" />;
          }

          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm",
                isActive
                  ? "bg-surface-accent text-green-dark shadow-sm"
                  : "text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-[#1B4332]" : "text-gray-400")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}