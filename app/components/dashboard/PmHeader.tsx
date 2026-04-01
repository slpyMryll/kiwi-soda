"use client";

import { Search, SlidersHorizontal, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export type SortOption = "newest" | "oldest" | "progress-high" | "progress-low";

interface PmHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function PmHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: PmHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Highest Progress", value: "progress-high" },
    { label: "Lowest Progress", value: "progress-low" },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-[#153B44]">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome to Ontrack</p>
      </div>

      <div className="relative w-full md:w-100 flex items-center">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search className="w-5 h-5 text-gray-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search projects..."
          className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 transition-all shadow-sm"
        />

        <div
          className="absolute right-2 top-1/2 -translate-y-1/2"
          ref={dropdownRef}
        >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "p-2 rounded-lg transition-colors flex items-center justify-center",
              isDropdownOpen
                ? "bg-gray-100 text-[#153B44]"
                : "text-gray-400 hover:text-[#153B44] hover:bg-gray-50",
            )}
            aria-label="Sort options"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Sort By
              </div>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#153B44] hover:bg-gray-50 flex items-center justify-between group transition-colors"
                >
                  <span
                    className={cn(sortBy === option.value ? "font-medium" : "")}
                  >
                    {option.label}
                  </span>
                  {sortBy === option.value && (
                    <Check className="w-4 h-4 text-[#3B82F6]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
