"use client";

import { useState } from "react";
import Link from "next/link";
import { Project } from "@/types/projects";
import {
  ArrowRight,
  MoreVertical,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toggleProjectLiveStatus, deleteProject } from "@/lib/actions/project";
import { ProgressBar } from "../ui/ProgressBar";

export function PmProjectCard(project: Project) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    id,
    title,
    status,
    liveStatus,
    progress,
    totalBudget,
    spentBudget,
    deadline,
    membersCount,
  } = project;

  const remainingBudget = totalBudget - (spentBudget || 0);
  const deadlineDate = new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleToggleStatus = async () => {
    setIsPending(true);
    const res = await toggleProjectLiveStatus(id, liveStatus);
    setIsPending(false);
    if (res.error) alert(`Error: ${res.error}`);
    else setIsToggleModalOpen(false);
  };

  const handleDelete = async () => {
    setIsPending(true);
    const res = await deleteProject(id);
    setIsPending(false);

    if (res.error) {
      alert(`Delete Error: ${res.error}`);
    } else {
      setIsDeleteDialogOpen(false);
    }
  };

  const statsMapping = [
    { label: "TOTAL BUDGET", value: `₱${totalBudget.toLocaleString()}` },
    { label: "MEMBERS", value: `${membersCount || 0} Assigned` },
    { label: "DEADLINE", value: deadlineDate },
    { label: "REMAINING", value: `₱${remainingBudget.toLocaleString()}` },
  ];

  return (
    <>
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-300 flex flex-col justify-between gap-4 hover:shadow-lg transition-shadow relative">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col gap-1.5 min-w-0">
              <h3 className="text-lg font-bold text-[#153B44] leading-tight truncate">
                {title}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${status === "Active" ? "bg-[#153B44] text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  {status}
                </span>
                {liveStatus === "Live" && (
                  <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-[#BFFFE3] text-[#00603B] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00603B] shrink-0 animate-pulse" />{" "}
                    Live
                  </span>
                )}
              </div>
            </div>

            <div className="relative shrink-0">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-[#153B44] p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsToggleModalOpen(true);
                    }}
                    disabled={isPending}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    {liveStatus === "Live" ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {liveStatus === "Live" ? "Unpublish" : "Publish to Live"}
                  </button>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Project
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-3">
            {statsMapping.map((item, index) => (
              <div key={index} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {item.label}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#153B44] truncate">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-3 sm:pt-4 border-t border-gray-100 mt-1">
          <div className="flex-1 min-w-0">
            <ProgressBar progress={progress} />
          </div>
          <Link
            href={`/project-manager/projects/${id}`}
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-full bg-gray-50 hover:bg-[#BFFFE3] text-gray-400 hover:text-[#153B44] transition-colors shrink-0"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>

      {isToggleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto ${liveStatus === "Live" ? "bg-orange-100" : "bg-[#E6F4EA]"}`}
            >
              {liveStatus === "Live" ? (
                <EyeOff className="w-6 h-6 text-orange-600" />
              ) : (
                <Eye className="w-6 h-6 text-[#1B4332]" />
              )}
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              {liveStatus === "Live"
                ? "Unpublish Project?"
                : "Publish Project?"}
            </h3>
            <p className="text-sm text-center text-gray-500 mb-6">
              {liveStatus === "Live"
                ? "This will hide the project from the public feed."
                : "This will make the project visible to all VSU students."}
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
                className={`flex-1 py-2.5 text-white font-semibold rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 ${liveStatus === "Live" ? "bg-orange-600 hover:bg-orange-700" : "bg-[#1B4332] hover:bg-green-900"}`}
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

      {isDeleteDialogOpen && (
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
              <span className="font-bold text-gray-700">"{title}"</span>? This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isPending}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
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
