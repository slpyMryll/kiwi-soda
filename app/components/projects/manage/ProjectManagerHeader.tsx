"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Edit2,
  Globe,
  Trash2,
  Loader2,
  AlertTriangle,
  EyeOff,
  Eye,
} from "lucide-react";
import { Project } from "@/types/projects";
import { toggleProjectLiveStatus, deleteProject } from "@/lib/actions/project";

export function ProjectManageHeader({ project }: { project: Project }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleToggleStatus = async () => {
    setIsPending(true);
    await toggleProjectLiveStatus(project.id, project.liveStatus);
    setIsPending(false);
    setIsToggleModalOpen(false); 
  };

  const handleDelete = async () => {
    setIsPending(true);
    await deleteProject(project.id);
    setIsPending(false);
    setIsDeleteModalOpen(false); 
    router.push("/project-manager/projects"); 
  };

  const isLive = project.liveStatus === "Live";

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 w-full">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Projects
          </button>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#153B44]">
              {project.title}
            </h1>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${
                isLive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
              />
              {project.liveStatus}
            </span>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
            <span>
              Project Lead: <span className="text-gray-900">Assigned PM</span>
            </span>
            <span>
              Location: <span className="text-gray-900">VSU Campus</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsToggleModalOpen(true)}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Globe className="w-4 h-4 text-gray-500" />
            )}
            {isLive ? "Unpublish Project" : "Publish Project"}
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors bg-white shadow-sm disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>
      </div>

      {isToggleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto ${isLive ? "bg-orange-100" : "bg-[#E6F4EA]"}`}
            >
              {isLive ? (
                <EyeOff className="w-6 h-6 text-orange-600" />
              ) : (
                <Eye className="w-6 h-6 text-[#1B4332]" />
              )}
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              {isLive ? "Unpublish Project?" : "Publish Project?"}
            </h3>
            <p className="text-sm text-center text-gray-500 mb-6">
              {isLive
                ? "This will hide the project from the public feed. Only council members will be able to see it."
                : "This will make the project visible on the public dashboard for all VSU students to track."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsToggleModalOpen(false)}
                disabled={isPending}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={isPending}
                className={`flex-1 py-2.5 text-white font-semibold rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 ${
                  isLive
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-[#1B4332] hover:bg-green-900"
                }`}
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              Delete Project?
            </h3>
            <p className="text-sm text-center text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold text-gray-700">"{project.title}"</span>
              ? This action cannot be undone and will permanently remove all
              associated budget logs and milestones.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isPending}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
