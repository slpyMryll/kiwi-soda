"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, User as UserIcon, Settings, LogOut, X } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { ContentRail } from "../landing/ContentRail";
import { NAV_CONFIG } from "@/types/navigation";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { toast } from "sonner";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose,
} from "@/components/ui/sheet";

interface HeaderProps {
  user?: any;
  role?: "viewer" | "project-manager" | "admin";
  profile?: { full_name?: string; avatar_url?: string; } | null;
}

export function Header({ user, profile, role = "viewer" }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.viewer;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    
    try {
      const result = await logout();
      if (result.success) {
        toast.success("Logged out successfully", { id: toastId });
        router.push("/login");
        router.refresh();
      } else {
        toast.error("Logout failed", { id: toastId });
      }
    } catch (err: any) {
      // Check if it's a redirect error (though we removed redirect from server action, 
      // it's good for robustness)
      if (err?.message?.includes('NEXT_REDIRECT')) {
        toast.success("Logged out successfully", { id: toastId });
        return;
      }
      toast.error("An unexpected error occurred", { id: toastId });
    }
  };

  return (
    <header className="w-full bg-surface-brand text-white h-18 sticky top-0 z-50 border-b border-white/10 shadow-md">
      <div className="h-full mx-auto px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Open navigation menu" className="flex lg:hidden p-2 -ml-2 rounded-md hover:bg-white/10 transition-colors">
                <Menu className="w-6 h-6 text-white" />
              </button>
            </SheetTrigger>

            <SheetContent side="left" className="w-75 sm:w-87.5 bg-white p-0 overflow-y-auto border-r-0 [&>button]:hidden flex flex-col">
              <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>

              <div className="p-6 bg-surface-brand text-white flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-0.5 shrink-0">
                    <Image src="/logov3.png" alt="OnTrack Logo" width={32} height={32} className="rounded-full" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">OnTrack</span>
                </div>
                <SheetClose asChild>
                  <button aria-label="Close navigation menu" className="p-1 rounded-md text-white opacity-80 hover:opacity-100 hover:bg-white/10 transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </SheetClose>
              </div>

              {user ? (
                <nav className="flex-1 py-6 px-4 space-y-1.5 bg-bg-main h-full">
                  {navItems.map((item, index) => {
                    if (item.divider) return <div key={`divider-${index}`} className="h-px bg-gray-200/80 my-4 ml-4 mr-4" />;

                    const Icon = item.icon;
                    const isActive = isMounted && (item.href === `/${role}` ? pathname === item.href : pathname.startsWith(item.href || ""));

                    return (
                      <SheetClose asChild key={item.name}>
                        <Link
                          href={item.href!}
                          className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm",
                            isActive ? "bg-linear-to-r from-[#e1f0c2] to-transparent text-[#1B4332]" : "text-gray-500 hover:bg-white hover:text-gray-900"
                          )}
                        >
                          <Icon className={cn("w-5 h-5", isActive ? "text-[#1B4332]" : "text-gray-400")} />
                          <span>{item.name}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>
              ) : (
                <div className="flex-1">
                  <div className="p-6 border-b border-gray-100">
                    <Button asChild className="w-full bg-[#1B4332] hover:bg-green-900 text-white shadow-md rounded-xl py-6 text-base">
                      <Link href="/login">Sign In / Login</Link>
                    </Button>
                  </div>
                  <ContentRail isMobile={true} trendingTopics={["#Budget Transparency", "#Student Projects", "#SSC"]} />
                </div>
              )}
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-white rounded-full p-0.5 shrink-0 transition-transform group-hover:scale-105 hidden sm:block">
              <Image src="/logov3.png" alt="OnTrack Logo" width={32} height={32} className="rounded-full" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">OnTrack</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <NotificationBell userId={user.id} />

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger 
                  aria-label={`User menu for ${profile?.full_name || "Account"}`}
                  className="flex items-center gap-2 hover:bg-white/10 p-1 md:pr-3 rounded-full transition-all border border-transparent hover:border-white/20 focus:outline-none"
                >
                  {profile?.full_name && <span className="hidden md:block text-sm font-medium text-white/90 pl-2">{profile.full_name}</span>}

                  <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden shrink-0 border border-white/10">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={`${profile.full_name}'s profile picture`} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-[#1B4332]">
                        {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/70" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-72 p-2 bg-white rounded-xl shadow-lg border border-gray-200 mt-2">
                  <DropdownMenuLabel className="flex items-center justify-between p-3 font-normal">
                    <div className="flex flex-col space-y-1 overflow-hidden">
                      <p className="text-base font-bold text-gray-900 truncate">{profile?.full_name || "User"}</p>
                      <p className="text-sm text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-[#2C5243] overflow-hidden shrink-0 ml-4">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={`${profile?.full_name || "User"}'s large profile picture`} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white bg-[#1B4332]">
                          {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 my-1" />
                  
                  {role !== "admin" && (
                    <DropdownMenuItem asChild className="py-3 px-3 cursor-pointer text-gray-700 focus:bg-gray-50 rounded-lg transition-colors">
                      <Link href={`/${role}/profile`}>
                        <UserIcon className="mr-3 w-5 h-5 text-gray-400" strokeWidth={2.5} />
                        <span className="text-[15px] font-medium">View Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild className="py-3 px-3 cursor-pointer text-gray-700 focus:bg-gray-50 rounded-lg transition-colors">
                    <Link href={`/${role}/settings`}>
                      <Settings className="mr-3 w-5 h-5 text-gray-400" strokeWidth={2.5} />
                      <span className="text-[15px] font-medium">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-gray-200 my-1" />
                  <DropdownMenuItem 
                    aria-label="Log out of your account"
                    onClick={handleLogout} 
                    className="py-3 px-3 cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600 rounded-lg transition-colors"
                  >
                    <LogOut className="mr-3 w-5 h-5" strokeWidth={2.5} />
                    <span className="text-[15px] font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login" className="hidden lg:flex bg-white/90 hover:bg-white text-[#1B4332] px-6 py-2 rounded-full text-sm font-bold transition-all shadow-sm hover:scale-105">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
