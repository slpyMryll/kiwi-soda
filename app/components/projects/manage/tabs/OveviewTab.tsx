"use client";

import { useState } from "react";
import {
  Edit2,
  Globe,
  Loader2,
  Wallet,
  FileText,
  CheckCircle2,
  Target,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  updateProjectDescription,
  updateProjectProgress,
} from "@/lib/actions/project-details";

export function OverviewTab({ project }: { project: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [isProgressEditOpen, setIsProgressEditOpen] = useState(false);
  const [isProgressPending, setIsProgressPending] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    setIsPending(true);
    const res = await updateProjectDescription(project.id, formData);
    setIsPending(false);
    if (res.error) alert(res.error);
    else setIsEditOpen(false);
  };

  const handleProgressUpdate = async (formData: FormData) => {
    setIsProgressPending(true);
    const res = await updateProjectProgress(project.id, formData);
    setIsProgressPending(false);
    if (res?.error) alert(res.error);
    else setIsProgressEditOpen(false);
  };

  const startDate = new Date(
    project.created_at || project.postedAt,
  ).toLocaleDateString();
  const endDate = project.deadline
    ? new Date(project.deadline).toLocaleDateString()
    : "No deadline";

  const activities: any[] = [];

  if (project.budgetUpdates && Array.isArray(project.budgetUpdates)) {
    project.budgetUpdates.forEach((b: any) => {
      activities.push({
        id: `budget-${b.id}`,
        icon: Wallet,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        title: "Budget Adjusted",
        desc: `${b.updatedBy} logged an expense of ₱${Math.abs(b.amountChange).toLocaleString()}`,
        time: b.date,
        timestamp: new Date(b.date).getTime(),
      });
    });
  }

  if (project.documents && Array.isArray(project.documents)) {
    project.documents.forEach((d: any) => {
      activities.push({
        id: `doc-${d.id}`,
        icon: FileText,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        title: "Document Uploaded",
        desc: `${d.uploadedBy} uploaded "${d.name}"`,
        time: d.date,
        timestamp: new Date(d.date).getTime(),
      });
    });
  }

  if (project.milestones && Array.isArray(project.milestones)) {
    project.milestones.forEach((m: any) => {
      const isCompleted = m.status === "Completed";
      activities.push({
        id: `milestone-${m.id}`,
        icon: isCompleted ? CheckCircle2 : Target,
        iconBg: isCompleted ? "bg-[#E6F4EA]" : "bg-purple-100",
        iconColor: isCompleted ? "text-[#1B4332]" : "text-purple-600",
        title: "Timeline Update",
        desc: `Milestone "${m.title}" is ${m.status}`,
        time:
          m.deadline !== "No deadline"
            ? m.deadline
            : new Date().toLocaleDateString(),
        timestamp:
          m.deadline !== "No deadline"
            ? new Date(m.deadline).getTime()
            : new Date().getTime(),
      });
    });
  }

  const recentActivity = activities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#153B44]">
            Project Description
          </h2>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#1B4332] transition-colors p-1">
                <Edit2 className="w-4 h-4" />{" "}
                <span className="hidden sm:inline">Edit</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Project Description</DialogTitle>
              </DialogHeader>
              <form action={handleUpdate} className="space-y-4 mt-4">
                <div>
                  <textarea
                    name="description"
                    defaultValue={project.description}
                    required
                    rows={6}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332] resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Save Description"
                  )}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap wrap-break-word">
          {project.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm pt-4 border-t border-gray-100">
          <div className="flex justify-between sm:block">
            <span className="text-gray-500 font-medium sm:block sm:mb-1">
              Start Date
            </span>
            <span className="font-bold text-gray-900 text-right sm:text-left">
              {startDate}
            </span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-gray-500 font-medium sm:block sm:mb-1">
              Target End Date
            </span>
            <span className="font-bold text-gray-900 text-right sm:text-left">
              {endDate}
            </span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-gray-500 font-medium sm:block sm:mb-1">
              Total Budget
            </span>
            <span className="font-bold text-gray-900 text-right sm:text-left break-all">
              ₱{project.totalBudget?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-[#153B44] mb-6">
            Progress Overview
          </h2>

          <div className="mb-6">
            <div className="flex justify-between items-center text-sm font-bold mb-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Overall Progress</span>

                <Dialog
                  open={isProgressEditOpen}
                  onOpenChange={setIsProgressEditOpen}
                >
                  <DialogTrigger asChild>
                    <button
                      className="text-gray-400 hover:text-[#1B4332] hover:bg-green-50 p-1 rounded-md transition-colors"
                      title="Update Progress"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xs w-[90vw]">
                    <DialogHeader>
                      <DialogTitle>Update Progress</DialogTitle>
                    </DialogHeader>
                    <form
                      action={handleProgressUpdate}
                      className="space-y-4 mt-4"
                    >
                      <div>
                        <label className="text-sm font-bold text-gray-700 block mb-1">
                          Completion Percentage (%)
                        </label>
                        <input
                          type="number"
                          name="progress"
                          defaultValue={project.progress || 0}
                          required
                          min="0"
                          max="100"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isProgressPending}
                        className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors"
                      >
                        {isProgressPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Save Progress"
                        )}
                      </button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <span className="text-[#1B4332] text-lg">
                {project.progress || 0}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#52B788] rounded-full transition-all duration-500"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Active Tasks:</span>
              <span className="font-bold text-gray-900">
                {project.tasks?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-4">
              <span className="text-gray-600 font-medium">Pending Tasks:</span>
              <span className="font-bold text-gray-900">
                {project.tasks?.filter((t: any) => t.status !== "Completed")
                  .length || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-[#153B44] mb-6">
            Recent Activity
          </h2>

          <div className="relative border-l-2 border-gray-100 ml-2 sm:ml-3 space-y-6 sm:space-y-6">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 pl-4 sm:pl-6">
                No recent activity logged yet.
              </p>
            ) : (
              recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="relative pl-5 sm:pl-6">
                    <div
                      className={`absolute -left-3.75 sm:-left-3.5 top-0 w-7 h-7 rounded-full flex items-center justify-center border-4 border-white ${activity.iconBg} shadow-sm`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${activity.iconColor}`} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {activity.title}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {activity.time.split(",")[0]}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed pr-2">
                      {activity.desc}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {project.liveStatus === "Live" ? (
        <div className="bg-[#E6F4EA] border border-[#BFFFE3] p-4 sm:p-5 rounded-2xl flex items-start gap-3">
          <Globe className="w-5 h-5 text-[#1B4332] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[#1B4332]">
              Project is Live
            </h4>
            <p className="text-xs sm:text-sm text-[#1B4332]/80 mt-1">
              This project is currently visible on the public dashboard. All VSU
              students can view project details, progress, and updates.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#E2E8F0]/50 border border-gray-200 p-4 sm:p-5 rounded-2xl flex items-start gap-3">
          <Globe className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              Project Visibility
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              This project is in draft mode and only visible to council members.
              Publish when you're ready to share with the VSU community.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
