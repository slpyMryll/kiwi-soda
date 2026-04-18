"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_CONFIG } from "@/types/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "viewer" | "project-manager" | "admin";
}

const getShortName = (name?: string) => {
  if (!name) return "";
  const shortNames: Record<string, string> = {
    "Project Management": "Projects",
    "My Following": "Following",
    "System Settings": "Settings",
    "User Management": "Users",
    "Term Management": "Terms",
    "System Logs": "Logs",
    "Content Moderation": "Mod",
  };
  return shortNames[name] || name;
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const navItems = NAV_CONFIG[role] || NAV_CONFIG.viewer;

  return (
    <aside className="fixed bottom-0 left-0 z-40 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] flex md:hidden lg:flex lg:shadow-none lg:sticky lg:top-18 lg:w-64 lg:bg-bg-main lg:h-[calc(100vh-72px)] lg:border-t-0 lg:border-r lg:border-gray-200/60 lg:flex-col pb-[env(safe-area-inset-bottom)] lg:pb-0">
      <nav className="flex w-full justify-around items-center px-2 py-2 overflow-x-auto no-scrollbar md:flex-col md:justify-start md:flex-1 md:py-6 md:px-4 md:space-y-1.5 md:items-stretch md:overflow-visible">
        {navItems.map((item, index) => {
          if (item.divider) {
            return (
              <div
                key={`divider-${index}`}
                className="hidden md:block h-px bg-gray-200/80 my-4 ml-4 mr-4 shrink-0"
              />
            );
          }

          const Icon = item.icon;
          const isRootPath = item.href === `/${role}`;
          
          const isActive = isMounted && (isRootPath
            ? pathname === item.href
            : pathname.startsWith(item.href || ""));

          return (
            <Link
              key={item.name}
              href={item.href!}
              prefetch={true}
              className={cn(
                "flex items-center transition-all duration-300 ease-in-out shrink-0",
                "h-10 md:h-auto rounded-full md:rounded-xl",
                "md:flex-row md:justify-start md:py-3.5 md:flex-none",
                isActive
                  ? "bg-[#E6F4EA] text-[#1B4332] px-4 gap-2 md:bg-surface-accent md:shadow-sm md:px-4 md:w-full"
                  : "w-10 justify-center px-0 text-gray-500 hover:text-gray-900 md:w-full md:justify-start md:px-4 md:gap-3 md:hover:bg-white md:hover:shadow-sm"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors duration-300",
                  isActive ? "text-[#1B4332]" : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "font-bold whitespace-nowrap overflow-hidden transition-all duration-300",
                  isActive 
                    ? "max-w-[120px] opacity-100 text-xs md:text-sm" 
                    : "max-w-0 opacity-0 md:max-w-full md:opacity-100 md:text-sm"
                )}
              >
                <span className="md:hidden">{getShortName(item.name)}</span>
                <span className="hidden md:inline">{item.name}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}