import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-6">
        <Link
          href="/project-manager/projects"
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1B4332] w-fit transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6 animate-pulse w-full">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-2xl shrink-0" />
            <div className="w-full">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="h-8 w-48 sm:w-64 bg-gray-200 rounded-lg" />
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 animate-pulse">
            <div className="h-10 w-32 bg-gray-200 rounded-xl" />
            <div className="h-10 w-10 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 animate-pulse"
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0" />
            <div className="flex-1">
              <div className="h-6 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="w-full bg-gray-200/60 p-1.5 rounded-2xl flex overflow-hidden gap-1 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`flex-1 h-10 rounded-xl ${i === 1 ? "bg-white" : "bg-transparent"}`}
          />
        ))}
      </div>

      <div className="flex flex-col gap-5 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm border-t-4 border-t-gray-200 animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
          <div className="space-y-3 mb-8">
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div>
              <div className="h-3 w-24 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div>
              <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm animate-pulse">
            <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 w-32 bg-gray-100 rounded" />
                <div className="h-5 w-10 bg-gray-200 rounded" />
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-4 w-8 bg-gray-200 rounded" />
              </div>
              <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-4 w-8 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
            <div className="space-y-6 ml-3 border-l-2 border-gray-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-gray-200 border-4 border-white" />
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
