"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { ProjectCard } from "./ProjectCard";
import { Project } from "@/types/projects";
import { getInfiniteProjects, getSingleProjectForFeed } from "@/lib/actions/project-feed";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Inbox } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const ProjectDetailView = dynamic(() => import("../projects/ProjectDetailView").then(mod => mod.ProjectDetailView), {
  ssr: false,
  loading: () => <div className="p-8 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#1B4332]" /></div>
});

interface InfiniteProjectFeedProps {
  userRole: "guest" | "viewer";
  termId: string;
  followingOnly?: boolean;
}

export function InfiniteProjectFeed({ 
  userRole, 
  termId, 
  followingOnly = false 
}: InfiniteProjectFeedProps) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { ref, inView } = useInView();

  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "newest";
  const date = searchParams.get("date") || "all";

  const queryKey = useMemo(() => ["projects", "public", q, status, sort, date, termId, followingOnly], [q, status, sort, date, termId, followingOnly]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      return getInfiniteProjects({
        page: pageParam,
        q,
        status,
        sort,
        date,
        termId,
        followingOnly,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length + 1 : undefined,
    placeholderData: (previousData) => previousData, 
  });

  const projects = useMemo(() => data?.pages.flatMap((page) => page.projects) || [], [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("public-project-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-[#1B4332]" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm mt-6 mb-6">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {date === "month" ? "No projects this month" : "No active projects found"}
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          {date === "month" 
            ? "There are no projects created this month matching your current filters." 
            : "We couldn't find any projects matching your search or filters."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`relative flex flex-col gap-6 mt-6 mx-auto w-full transition-opacity duration-300 ${isFetching && !isFetchingNextPage ? 'opacity-50' : 'opacity-100'}`}>
        
        {isFetching && !isFetchingNextPage && (
          <div className="absolute inset-0 z-50 flex justify-center pointer-events-none">
            <div className="sticky top-24 h-fit inline-flex items-center gap-2 bg-white/95 px-4 py-2 rounded-full shadow-lg border border-gray-100 animate-in fade-in pointer-events-auto mt-2">
               <Loader2 className="w-4 h-4 animate-spin text-[#1B4332]" />
               <span className="text-xs font-bold text-[#1B4332]">Updating...</span>
            </div>
          </div>
        )}

        {projects.map((project, index) => (
           <div key={`${project.id}-${index}`} className="animate-in fade-in slide-in-from-top-4 duration-500">
             <ProjectCard 
               userRole={userRole} 
               project={project}
               isPriority={index < 2}
               onReadMore={userRole === "guest" ? () => setSelectedProject({
                 ...project,
                 comments: project.comments || [],
                 milestones: project.milestones || [],
                 budgetUpdates: project.budgetUpdates || [],
                 members: project.members || [],
                 tags: project.tags || []
               }) : undefined} 
             />
           </div>
        ))}
        
        <div ref={ref} className="h-10 w-full flex justify-center items-center">
          {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-[#1B4332]" />}
        </div>
      </div>
      
      {!hasNextPage && projects.length > 0 && (
         <div className="text-center py-10">
           <p className="text-sm text-gray-400 font-medium">
             {followingOnly
               ? "You’re all caught up with your followed projects."
               : "You've reached the end of the feed."}
           </p>
         </div>
      )}

      {userRole === "guest" && (
        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent className="w-[95vw] sm:w-[90vw] lg:max-w-4xl xl:max-w-5xl p-0 overflow-hidden bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogTitle className="sr-only">Project Details</DialogTitle>
            {selectedProject && <ProjectDetailView project={selectedProject} userRole="guest" isModal={true} onClose={() => setSelectedProject(null)} />}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}