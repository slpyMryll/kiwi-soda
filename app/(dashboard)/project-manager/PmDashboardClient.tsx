"use client";

import { useState, useEffect, useMemo } from "react";
import { Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/types/projects";
import { SidebarTask } from "@/types/pm";

import { PmHeader, SortOption } from "@/app/components/dashboard/PmHeader";
import { ProjectsWorkedCard } from "@/app/components/ui/ProjectsWorkedCard";
import { StatCard } from "@/app/components/ui/StatCard";
import { PmProjectCard } from "@/app/components/dashboard/PmProjectCard";
import { TaskSidebar } from "@/app/components/dashboard/TaskSidebar";

interface PmDashboardClientProps {
  initialProjects: Project[];
  initialTasks: any[];
  councilMembersCount: number;
  userId: string;
}

export function PmDashboardClient({
  initialProjects,
  initialTasks,
  councilMembersCount,
  userId,
}: PmDashboardClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [onlineUsers, setOnlineUsers] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const dataChannel = supabase
      .channel("pm-dashboard-data")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: `manager_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            setProjects((prev) => prev.filter((p) => p.id !== payload.old.id));
            return;
          }

          const record = payload.new;
          const { count: membersCount } = await supabase
            .from("project_members")
            .select("*", { count: "exact", head: true })
            .eq("project_id", record.id);
          const { count: commentsCount } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("project_id", record.id);

          const updatedProject: Project = {
            id: record.id,
            title: record.title,
            description: record.description,
            location: record.location || "VSU Campus",
            imageUrl: record.image_url,
            tags: record.tags || [],
            status: record.status,
            liveStatus: record.live_status,
            totalBudget: Number(record.total_budget || 0),
            spentBudget: Number(record.spent_budget || 0),
            progress: record.progress || 0,
            deadline: record.deadline ? new Date(record.deadline) : new Date(),
            postedAt: record.posted_at || record.created_at,
            created_at: record.created_at,
            updated_at: record.updated_at,
            membersCount: membersCount || 0,
            commentsCount: commentsCount || 0,
            isFollowing: false,
          };

          setProjects((prev) => {
            const exists = prev.some((p) => p.id === updatedProject.id);
            if (exists) {
              return prev.map((p) =>
                p.id === updatedProject.id ? updatedProject : p,
              );
            } else {
              return [updatedProject, ...prev];
            }
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `assigned_to=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT")
            setTasks((prev) => [...prev, payload.new]);
          else if (payload.eventType === "UPDATE")
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t)),
            );
          else if (payload.eventType === "DELETE")
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
        },
      )
      .subscribe();

    const presenceChannel = supabase
      .channel("online-council")
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const uniqueUsers = new Set(
          Object.values(state)
            .flat()
            .map((p: any) => p.user),
        );
        setOnlineUsers(Math.max(1, uniqueUsers.size));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ user: userId });
        }
      });

    return () => {
      supabase.removeChannel(dataChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [userId]);

  const activeProjectsCount = projects.filter((p) => p.progress < 100).length;
  const completedProjectsCount = projects.filter(
    (p) => p.progress === 100,
  ).length;

  const projectsWorkedStats = useMemo(() => {
    const active = projects.filter((p) => p.progress > 0);

    if (active.length === 0) {
      return {
        data: [{ name: "No Active Progress", value: 100, color: "#E5E7EB" }],
        totalCount: 0,
      };
    }

    const COLORS = ["#8B5CF6", "#FCA5A5", "#67E8F9", "#FDBA74"];
    const LIMIT = 4;

    const sortedActive = [...active].sort((a, b) => b.progress - a.progress);

    const displayData = sortedActive.slice(0, LIMIT).map((p, index) => ({
      name: p.title,
      value: p.progress,
      color: COLORS[index],
    }));

    if (active.length > LIMIT) {
      const others = sortedActive.slice(LIMIT);
      const avgProgress = Math.round(
        others.reduce((acc, curr) => acc + curr.progress, 0) / others.length,
      );

      displayData.push({
        name: `${others.length} Others`,
        value: avgProgress,
        color: "#94A3B8",
      });
    }

    return {
      data: displayData,
      totalCount: active.length,
    };
  }, [projects]);

  const combinedSidebarTasks = useMemo(() => {
    const formattedTasks: SidebarTask[] = tasks.map((t: any) => ({
      id: t.id,
      name: t.title,
      status: t.status,
      dueDate: t.due_date,
    }));

    const projectDeadlines: SidebarTask[] = projects
      .filter((p) => p.deadline)
      .map((p) => ({
        id: `deadline-${p.id}`,
        name: `Deadline: ${p.title}`,
        status: p.progress === 100 ? "Completed" : "Pending",
        dueDate: p.deadline!.toISOString(),
      }));

    return [...formattedTasks, ...projectDeadlines];
  }, [tasks, projects]);

  const displayedProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const safeTitle = (p.title || "").toLowerCase();
        const safeDesc = (p.description || "").toLowerCase();
        const safeTags = p.tags ? p.tags.join(" ").toLowerCase() : "";

        return (
          safeTitle.includes(query) ||
          safeDesc.includes(query) ||
          safeTags.includes(query)
        );
      });
    }

    const getSafeTime = (dateValue: any) => {
      if (!dateValue) return 0;
      const time = new Date(dateValue).getTime();
      return isNaN(time) ? 0 : time;
    };

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            getSafeTime(b.postedAt || b.created_at) -
            getSafeTime(a.postedAt || a.created_at)
          );
        case "oldest":
          return (
            getSafeTime(a.postedAt || a.created_at) -
            getSafeTime(b.postedAt || b.created_at)
          );
        case "progress-high":
          return (b.progress || 0) - (a.progress || 0);
        case "progress-low":
          return (a.progress || 0) - (b.progress || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchQuery, sortBy]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-4 sm:gap-5 lg:gap-6 w-full">
      <PmHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="col-span-2 md:col-span-6 lg:col-span-2">
          <ProjectsWorkedCard
            data={projectsWorkedStats.data}
            totalCount={projectsWorkedStats.totalCount}
          />
        </div>
        <div className="col-span-2 md:col-span-2 lg:col-span-1">
          <StatCard
            label="Completed Projects"
            value={completedProjectsCount}
            badge={`${activeProjectsCount} ongoing`}
            badgeClassName="bg-gray-100 text-gray-500"
          />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <StatCard
            label="Live Projects"
            value={projects.filter((p) => p.liveStatus === "Live").length}
            subtext="Publicly visible"
          />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <StatCard
            label="Council Members"
            value={councilMembersCount}
            subtext={`${onlineUsers} online`}
          />
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6 lg:h-[850px]">
        <div className="lg:col-span-3 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px] sm:h-[500px] lg:h-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 shrink-0 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-[#153B44] tracking-tight">
                Recent Projects
              </h2>
              <p className="text-xs sm:text-sm lg:text-[15px] text-gray-500 mt-1">
                Manage and track your latest council projects
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 sm:space-y-4 pb-2 custom-scrollbar">
            {displayedProjects.length > 0 ? (
              displayedProjects.map((project) => (
                <div
                  key={project.id}
                  className="animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <PmProjectCard {...project} />
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center mt-4 h-full justify-center">
                <Inbox className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mb-2 sm:mb-3" />
                <p className="text-sm sm:text-base text-gray-500 font-medium">
                  {searchQuery
                    ? "No projects match your search."
                    : "No active projects found."}
                </p>
                {!searchQuery && (
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Head over to the Projects tab to create one.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 min-h-[550px] sm:min-h-[650px] lg:min-h-0 lg:h-full overflow-hidden">
          <TaskSidebar tasks={combinedSidebarTasks} />
        </div>
      </div>
    </div>
  );
}
