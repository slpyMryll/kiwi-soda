"use client";

import { Project } from "@/types/projects";
import { ProgressBar } from "../ui/ProgressBar";
import { ProjectTopBar } from "./ProjectTopBar";
import { ProjectTimeline } from "./ProjectTimeline";
import { ProjectBudget } from "./ProjectBudget";
import { ProjectBudgetHistory } from "./ProjectBudgetHistory";
import { ProjectFeedback } from "./ProjectFeedback";

interface ProjectDetailProps {
  project: Project;
  userRole: "guest" | "viewer" | "project-manager" | "admin";
  isModal?: boolean;
  onClose?: () => void;
}

export function ProjectDetailView({
  project,
  userRole,
  isModal = false,
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
        onClose={onClose}
      />

      <div className="w-full h-48 sm:h-64 bg-gray-200">
        <img
          src={project.imageUrl || "/project-card-place.webp"}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {project.title}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Posted on{" "}
            {new Date(project.postedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <ProgressBar progress={project.progress} />
        </div>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            About This Project
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {project.description}
          </p>
        </section>

        <ProjectTimeline milestones={project.milestones} />

        <ProjectBudget
          totalBudget={project.totalBudget}
          spentBudget={project.spentBudget}
        />

        <ProjectBudgetHistory updates={project.budgetUpdates} isGuest={isGuest} />

        <section>
          <h2 className="text-lg font-bold text-[#1B4332] mb-4">
            Project Leaders
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-sm">
                  JD
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none">
                    John Doe
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Project Lead
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <ProjectFeedback
          commentsCount={project.commentsCount}
          isGuest={isGuest}
        />
      </div>
    </div>
  );
}
