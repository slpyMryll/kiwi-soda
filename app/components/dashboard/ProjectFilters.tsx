"use client";

import {
  Search,
  SlidersHorizontal,
  ArrowDownAZ,
  ArrowUpZA,
  Calendar,
  Clock,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getInfiniteProjects } from "@/lib/actions/project-feed";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectFiltersProps {
  termId: string;
  followingOnly?: boolean;
}

export function ProjectFilters({ termId, followingOnly = false }: ProjectFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const currentStatus = searchParams.get("status") || "all";
  const currentSort = searchParams.get("sort") || "newest";
  const currentDate = searchParams.get("date") || "all";
  const currentQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(currentQuery);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== currentQuery) {
        updateQueryParams({ q: searchQuery });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentQuery]);

  const updateQueryParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(updates).forEach((key) => {
      if (updates[key]) {
        params.set(key, updates[key]);
      } else {
        params.delete(key);
      }
    });
    
    const newUrl = `${pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
  };

  const prefetchTab = (targetStatus: string) => {
    if (currentStatus === targetStatus) return;

    queryClient.prefetchInfiniteQuery({
      queryKey: ["projects", "public", searchQuery, targetStatus, currentSort, currentDate, termId, followingOnly],
      queryFn: async ({ pageParam = 1 }) => {
        return getInfiniteProjects({
          page: pageParam,
          q: searchQuery,
          status: targetStatus,
          sort: currentSort,
          date: currentDate,
          termId,
          followingOnly,
        });
      },
      initialPageParam: 1,
    });
  };

  const getTabClass = (isActive: boolean) =>
    `px-4 py-3 text-sm transition-colors border-b-2 ${
      isActive
        ? "font-bold text-[#1B4332] border-[#1B4332]"
        : "font-semibold text-gray-500 hover:text-gray-900 border-transparent"
    }`;

  return (
    <div className="w-full space-y-6 my-8">
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or keywords..."
            className="w-full bg-gray-200/50 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 transition-all"
          />
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="bg-gray-200/50 hover:bg-gray-200 p-3.5 rounded-xl text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center shrink-0 focus:outline-none">
            <SlidersHorizontal className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 bg-white rounded-xl shadow-lg border border-gray-200">
            <DropdownMenuLabel className="font-bold text-gray-900">Sort By Date</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => updateQueryParams({ sort: "newest" })} className={`py-2.5 px-3 cursor-pointer rounded-lg transition-colors ${currentSort === "newest" ? "bg-gray-100 text-[#1B4332] font-semibold" : "text-gray-700"}`}>
              <Clock className="mr-2 w-4 h-4" /> Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateQueryParams({ sort: "oldest" })} className={`py-2.5 px-3 cursor-pointer rounded-lg transition-colors ${currentSort === "oldest" ? "bg-gray-100 text-[#1B4332] font-semibold" : "text-gray-700"}`}>
              <Clock className="mr-2 w-4 h-4" /> Oldest First
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 my-1" />

            <DropdownMenuLabel className="font-bold text-gray-900">Sort Alphabetically</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => updateQueryParams({ sort: "a-z" })} className={`py-2.5 px-3 cursor-pointer rounded-lg transition-colors ${currentSort === "a-z" ? "bg-gray-100 text-[#1B4332] font-semibold" : "text-gray-700"}`}>
              <ArrowDownAZ className="mr-2 w-4 h-4" /> Title (A to Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateQueryParams({ sort: "z-a" })} className={`py-2.5 px-3 cursor-pointer rounded-lg transition-colors ${currentSort === "z-a" ? "bg-gray-100 text-[#1B4332] font-semibold" : "text-gray-700"}`}>
              <ArrowUpZA className="mr-2 w-4 h-4" /> Title (Z to A)
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 my-1" />

            <DropdownMenuLabel className="font-bold text-gray-900">Filter By Time</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => updateQueryParams({ date: "all" })} className={`py-2.5 px-3 cursor-pointer rounded-lg transition-colors ${currentDate === "all" ? "bg-gray-100 text-[#1B4332] font-semibold" : "text-gray-700"}`}>
              <Calendar className="mr-2 w-4 h-4" /> All Time
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateQueryParams({ date: "month" })} className={`py-2.5 px-3 cursor-pointer rounded-lg transition-colors ${currentDate === "month" ? "bg-gray-100 text-[#1B4332] font-semibold" : "text-gray-700"}`}>
              <Calendar className="mr-2 w-4 h-4" /> This Month
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-center gap-8 border-b border-gray-200 px-4">
        <button
          onClick={() => updateQueryParams({ status: "all" })}
          onMouseEnter={() => prefetchTab("all")}
          className={getTabClass(currentStatus === "all")}
        >
          All
        </button>
        <button
          onClick={() => updateQueryParams({ status: "ongoing" })}
          onMouseEnter={() => prefetchTab("ongoing")}
          className={getTabClass(currentStatus === "ongoing")}
        >
          Ongoing
        </button>
        <button
          onClick={() => updateQueryParams({ status: "completed" })}
          onMouseEnter={() => prefetchTab("completed")}
          className={getTabClass(currentStatus === "completed")}
        >
          Completed
        </button>
      </div>
    </div>
  );
}