"use client";

import { Project } from "@/types/projects";
import { ProgressBar } from "../ui/ProgressBar";
import { ProjectTopBar } from "./ProjectTopBar";
import { ProjectTimeline } from "./ProjectTimeline";
import { ProjectBudget } from "./ProjectBudget";
import { ProjectBudgetHistory } from "./ProjectBudgetHistory";
import { ProjectFeedback } from "./ProjectFeedback";
import { Eye } from "lucide-react";

interface ProjectDetailProps {
  project: Project;
  userRole: "guest" | "viewer" | "project-manager" | "admin";
  isModal?: boolean;
  isPreview?: boolean;
  onClose?: () => void;
}

export function ProjectDetailView({
  project,
  userRole,
  isModal = false,
  isPreview = false,
  onClose,
}: ProjectDetailProps) {
  const isGuest = userRole === "guest";

  return (
    <div className={`flex flex-col bg-white ${isModal ? "" : "min-h-screen"}`}>
      <ProjectTopBar
        projectId={project.id}
        tags={project.tags}
        isGuest={isGuest}
        isModal={isModal}
        isPreview={isPreview}
        onClose={onClose}
      />

      {isPreview && (
        <div className="w-full bg-[#1B4332] text-white text-[11px] sm:text-[13px] py-2 px-4 flex items-center justify-center gap-2 font-medium shadow-sm z-10 text-center">
          <Eye className="w-4 h-4 text-[#e1f0c2] shrink-0" />
          This is a preview of the public view. Interactions are disabled.
        </div>
      )}

      <div className={isPreview ? "pointer-events-none select-none" : ""}>
        <div className="w-full h-32 sm:h-48 md:h-64 bg-gray-200">
          <img
            src={project.imageUrl || "/project-card-place.webp"}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 sm:space-y-10 overflow-x-hidden">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6">
              Posted on{" "}
              {new Date(project.postedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <ProgressBar progress={project.progress} />
          </div>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
              About This Project
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {project.description}
            </p>
          </section>

          <ProjectTimeline milestones={project.milestones} />

          <ProjectBudget
            totalBudget={project.totalBudget}
            spentBudget={project.spentBudget}
          />

          <ProjectBudgetHistory
            updates={project.budgetUpdates ?? []}
            isGuest={isGuest}
          />

          <section>
            <h2 className="text-base sm:text-lg font-bold text-[#1B4332] mb-3 sm:mb-4">
              Project Team
            </h2>
            {project.members && project.members.length > 0 ? (
              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {project.members.map((member: any, i: number) => {
                  const initials = member.name
                    ? member.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "??";

                  return (
                    <div
                      key={member.id || i}
                      className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl border border-gray-100 min-w-0"
                    >
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="overflow-hidden min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 leading-none truncate">
                          {member.name}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-[#1B4332] font-semibold truncate mt-1 sm:mt-1.5">
                          {member.display_role || member.role}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 sm:p-6 text-center">
                <p className="text-xs sm:text-sm text-gray-500">
                  No team members have been assigned to this project yet.
                </p>
              </div>
            )}
          </section>

          <ProjectFeedback
            comments={project.comments || []}
            projectId={project.id}
            isGuest={isGuest}
          />
        </div>
      </div>
    </div>
  );
}