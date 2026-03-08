"use client";

import { useState } from "react";
import { ProjectCard } from "../dashboard/ProjectCard";
import { ProjectDetailView } from "../projects/ProjectDetailView";
import { Project } from "@/types/projects";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface GuestProjectFeedProps {
  projects: Project[];
}

export function GuestProjectFeed({ projects }: GuestProjectFeedProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
        <p className="text-sm text-gray-500 font-medium">No projects matched your search or filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 mt-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            userRole="guest"
            project={project}
            onReadMore={() => setSelectedProject(project)} 
          />
        ))}
        
        <div className="text-center py-10">
          <p className="text-xs text-gray-400 font-medium">No more projects to<br />show</p>
        </div>
      </div>

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="w-[95vw] sm:w-[90vw] lg:max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
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
    </>
  );
}