"use client";

import { Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PmProjectCard } from "@/app/components/dashboard/PmProjectCard";
import { CreateProjectModal } from "@/app/components/projects/CreateProjectModal";
import { ProjectStats } from "@/app/components/dashboard/ProjectStats";
import { ProjectFilters } from "@/app/components/dashboard/ProjectFilters";
import { Project } from "@/types/projects";

interface Props {
  projects: Project[];
  currentPage: number;
  totalPages: number;
  totalFiltered: number;
  stats: {
    total: number;
    live: number;
    draft: number;
    avgProgress: number;
  };
}

export default function PmProjectsClient({
  projects,
  currentPage,
  totalPages,
  totalFiltered,
  stats,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const isSearchActive =
    searchParams.get("q") || searchParams.get("status") !== "all";

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#153B44] tracking-tight">
            Projects
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your council projects
          </p>
        </div>
        <CreateProjectModal />
      </div>

      <ProjectStats
        total={stats.total}
        live={stats.live}
        draft={stats.draft}
        avgProgress={stats.avgProgress}
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <ProjectFilters />
      </div>

      {projects.length > 0 ? (
        <div className="flex flex-col gap-6">
          <p className="text-sm font-bold text-gray-500">
            Showing {projects.length} of {totalFiltered} projects
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <PmProjectCard key={project.id} {...project} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#1B4332] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                        currentPage === pageNumber
                          ? "bg-[#1B4332] text-white border border-[#1B4332]"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-[#1B4332]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#1B4332] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            {isSearchActive
              ? "We couldn't find any projects matching your search or filters. Try adjusting them."
              : "You haven't created any projects yet. Click 'New Project' to get started."}
          </p>
        </div>
      )}
    </div>
  );
}
