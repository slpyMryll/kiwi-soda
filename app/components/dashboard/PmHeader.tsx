"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export function PmHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-[#153B44]">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome to Ontrack</p>
      </div>

      <div className="relative w-full md:w-100">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/10 transition-all shadow-sm"
        />
        <button 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B4332] transition-colors"
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}