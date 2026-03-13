"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Inbox } from "lucide-react";
import { PmProjectCard } from "@/app/components/dashboard/PmProjectCard";
import { CreateProjectModal } from "@/app/components/projects/CreateProjectModal";
import { ProjectStats } from "@/app/components/dashboard/ProjectStats";
import { Project } from "@/types/projects";

interface Props {
  projects: Project[];
}

export default function PmProjectsClient({ projects }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter((p) => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const total = projects.length;
  const live = projects.filter(p => p.liveStatus === "Live").length;
  const draft = projects.filter(p => p.liveStatus === "Draft").length;
  const avgProgress = total > 0 
    ? projects.reduce((acc, p) => acc + (p.progress || 0), 0) / total 
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#153B44] tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all your council projects</p>
        </div>
        <CreateProjectModal />
      </div>

      <div className="relative w-full bg-white rounded-xl border border-gray-200 shadow-sm flex items-center px-4 py-3">
        <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-sm focus:outline-none"
        />
        <button className="text-gray-400 hover:text-[#1B4332] transition-colors shrink-0 ml-3">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <ProjectStats total={total} live={live} draft={draft} avgProgress={avgProgress} />

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <PmProjectCard key={project.id} {...project} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No projects found</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            {searchQuery ? "We couldn't find any projects matching your search." : "You haven't created any projects yet. Click 'New Project' to get started."}
          </p>
        </div>
      )}
    </div>
  );
}