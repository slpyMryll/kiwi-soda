"use client";

import { useState, useEffect } from "react";
import { Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PmProjectCard } from "@/app/components/dashboard/PmProjectCard";
import { CreateProjectModal } from "@/app/components/projects/CreateProjectModal";
import { ProjectStats } from "@/app/components/dashboard/ProjectStats";
import { ProjectFilters } from "@/app/components/dashboard/ProjectFilters";
import { Project } from "@/types/projects";
import { createClient } from "@/lib/supabase/client";

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

  const [localProjects, setLocalProjects] = useState<Project[]>(projects);

  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  useEffect(() => {
    const supabase = createClient();
    let currentUserId = "";

    supabase.auth.getUser().then(({ data }) => {
      currentUserId = data.user?.id || "";
    });

    const fetchAndAddProject = async (projectId: string) => {
      const { data } = await supabase
        .from("projects")
        .select(
          `
        *,
        project_members (count),
        comments (count)
      `,
        )
        .eq("id", projectId)
        .single();

      if (data) {
        const newProject: Project = {
          id: data.id,
          title: data.title,
          description: data.description,
          location: data.location || "VSU Campus",
          imageUrl: data.image_url,
          tags: data.tags || [],
          status:
            data.status && data.status.toLowerCase() === "completed"
              ? "Completed"
              : "Ongoing",
          liveStatus: data.live_status,
          totalBudget: Number(data.total_budget),
          spentBudget: Number(data.spent_budget),
          progress: data.progress,
          deadline: data.deadline,
          postedAt: data.posted_at || data.created_at,
          created_at: data.created_at,
          updated_at: data.updated_at,
          membersCount: data.project_members?.[0]?.count || 0,
          commentsCount: data.comments?.[0]?.count || 0,
          isFollowing: false,
        };

        setLocalProjects((prev) => {
          if (prev.some((p) => p.id === newProject.id)) return prev;
          return [newProject, ...prev];
        });
      }
    };

    const projectChannel = supabase
      .channel("feed-projects-sync")
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "projects" },
        (payload) => {
          setLocalProjects((prev) =>
            prev.filter((p) => p.id !== payload.old.id),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects" },
        (payload) => {
          setLocalProjects((prev) =>
            prev.map((p) =>
              p.id === payload.new.id
                ? {
                    ...p,
                    progress: payload.new.progress ?? p.progress,
                    status:
                      payload.new.status === "Completed"
                        ? "Completed"
                        : "Ongoing",
                    liveStatus: payload.new.live_status ?? p.liveStatus,
                    totalBudget: payload.new.total_budget ?? p.totalBudget,
                    spentBudget: payload.new.spent_budget ?? p.spentBudget,
                    title: payload.new.title ?? p.title,
                    imageUrl: payload.new.image_url ?? p.imageUrl,
                  }
                : p,
            ),
          );
        },
      )
      .subscribe();

    const memberChannel = supabase
      .channel("feed-members-sync")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "project_members" },
        (payload) => {
          if (payload.new.profile_id === currentUserId) {
            fetchAndAddProject(payload.new.project_id);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "project_members" },
        (payload) => {
          if (payload.old.profile_id === currentUserId) {
            setLocalProjects((prev) =>
              prev.filter((p) => p.id !== payload.old.project_id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(memberChannel);
    };
  }, []);

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

      {localProjects.length > 0 ? (
        <div className="flex flex-col gap-6">
          <p className="text-sm font-bold text-gray-500">
            Showing {localProjects.length} of {totalFiltered} projects
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {localProjects.map((project) => (
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
