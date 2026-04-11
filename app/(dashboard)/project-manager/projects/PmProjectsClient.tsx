"use client";

import { useEffect } from "react";
import { Inbox, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PmProjectCard } from "@/app/components/dashboard/PmProjectCard";
import { CreateProjectModal } from "@/app/components/projects/CreateProjectModal";
import { ProjectStats } from "@/app/components/dashboard/ProjectStats";
import { ProjectFilters } from "@/app/components/dashboard/ProjectFilters";
import { getProjectsByManager } from "@/lib/actions/project";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/types/projects";

interface ProjectManagerResponse {
  success: boolean;
  projects: Project[];
  totalPages: number;
  totalFiltered: number;
  stats: {
    total: number;
    live: number;
    draft: number;
    avgProgress: number;
  };
}

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
  currentUserId: string; 
}

export default function PmProjectsClient({ 
  projects: initialProjects, 
  currentPage, 
  totalPages: initialTotalPages, 
  totalFiltered: initialFiltered, 
  stats: initialStats, 
  currentUserId 
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  const queryKey = ["pm-projects", currentUserId, q, status, sort, page];

  const { data, isFetching } = useQuery<ProjectManagerResponse>({
    queryKey,
    queryFn: async () => {
      const res = await getProjectsByManager(currentUserId, { q, status, sort, page });

      return {
        success: res.success,
        projects: res.projects as Project[],
        totalPages: res.totalPages,
        totalFiltered: res.totalFiltered,
        stats: res.stats
      };
    },
    placeholderData: (previousData) => previousData,
    initialData: (page === currentPage && q === "" && status === "all") ? {
      success: true, 
      projects: initialProjects, 
      totalPages: initialTotalPages, 
      totalFiltered: initialFiltered, 
      stats: initialStats
    } : undefined,
  });

  const localProjects = data?.projects || [];
  const displayTotalPages = data?.totalPages || 1;
  const displayTotalFiltered = data?.totalFiltered || 0;
  const displayStats = data?.stats || initialStats;

  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createClient();
    const projectChannel = supabase.channel("pm-projects-sync")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "projects" }, (payload) => {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData || !oldData.projects) return oldData;
          return {
            ...oldData,
            projects: oldData.projects.map((p: Project) => p.id === payload.new.id ? { ...p, ...payload.new } : p)
          };
        });
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "projects" }, () => {
         queryClient.invalidateQueries({ queryKey: ["pm-projects"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(projectChannel); };
  }, [currentUserId, queryClient, queryKey]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > displayTotalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const isSearchActive = searchParams.get("q") || searchParams.get("status") !== "all";

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#153B44] tracking-tight">Projects</h1>
        </div>
        <CreateProjectModal />
      </div>

      <ProjectStats {...(data?.stats || initialStats)} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <ProjectFilters />
      </div>

      {localProjects.length > 0 ? (
        <div className={`relative transition-all duration-300 ${isFetching ? "opacity-60" : "opacity-100"}`}>
          {isFetching && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white shadow-lg rounded-full p-2 animate-in fade-in">
               <Loader2 className="w-5 h-5 animate-spin text-[#1B4332]" />
            </div>
          )}
          
          <p className="text-sm font-bold text-gray-500 mb-4">Showing {localProjects.length} of {displayTotalFiltered} projects</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {localProjects.map((project: any) => (
              <PmProjectCard key={project.id} {...project} />
            ))}
          </div>

          {displayTotalPages > 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="p-2 border rounded-xl disabled:opacity-50"><ChevronLeft /></button>
              <span className="flex items-center font-bold text-gray-600">Page {page} of {displayTotalPages}</span>
              <button onClick={() => handlePageChange(page + 1)} disabled={page === displayTotalPages} className="p-2 border rounded-xl disabled:opacity-50"><ChevronRight /></button>
            </div>
          )}
        </div>
      ) : (
         <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">
           <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
           <p className="text-gray-500">No projects found.</p>
         </div>
      )}
    </div>
  );
}