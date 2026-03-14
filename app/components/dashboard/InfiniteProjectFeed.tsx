"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectDetailView } from "../projects/ProjectDetailView";
import { Project } from "@/types/projects";
import { getInfiniteProjects } from "@/lib/actions/project-feed";
import { Loader2, Inbox } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface InfiniteProjectFeedProps {
  initialProjects: Project[];
  userRole: "guest" | "viewer";
  searchParams: { q?: string; status?: string; sort?: string };
}

export function InfiniteProjectFeed({
  initialProjects,
  userRole,
  searchParams,
}: InfiniteProjectFeedProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProjects.length >= 5);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setProjects(initialProjects);
    setPage(1);
    setHasMore(initialProjects.length >= 5);
  }, [initialProjects, searchParams]);

  const lastProjectElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMoreProjects();
          }
        },
        { rootMargin: "300px" },
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore],
  );

  const loadMoreProjects = async () => {
    setIsLoading(true);
    const nextPage = page + 1;

    try {
      const res = await getInfiniteProjects({
        page: nextPage,
        q: searchParams.q,
        status: searchParams.status,
        sort: searchParams.sort,
      });

      setProjects((prev) => [...prev, ...res.projects]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to fetch more projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm mt-6">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          No active projects found
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          We couldn't find any projects matching your search or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 mt-6 mx-auto w-full">
        {projects.map((project, index) => {
          const isLastElement = projects.length === index + 1;
          return (
            <div
              key={`${project.id}-${index}`}
              ref={isLastElement ? lastProjectElementRef : null}
            >
              <ProjectCard
                userRole={userRole}
                project={project}
                onReadMore={
                  userRole === "guest"
                    ? () => setSelectedProject(project)
                    : undefined
                }
              />
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B4332]" />
          </div>
        )}

        {!hasMore && projects.length > 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-gray-400 font-medium">
              You've reached the end of the feed.
            </p>
          </div>
        )}
      </div>

      {userRole === "guest" && (
        <Dialog
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
        >
          <DialogContent className="w-[95vw] sm:w-[90vw] lg:max-w-4xl xl:max-w-5xl p-0 overflow-hidden bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">Project Details</DialogTitle>
            {selectedProject && (
              <ProjectDetailView
                project={selectedProject}
                userRole="guest"
                isModal={true}
                onClose={() => setSelectedProject(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
