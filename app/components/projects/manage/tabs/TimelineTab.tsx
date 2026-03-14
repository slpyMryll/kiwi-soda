"use client";

import { useState } from "react";
import {
  Plus,
  Check,
  Clock,
  Loader2,
  PlayCircle,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  addMilestone,
  updateMilestone,
  deleteMilestone,
} from "@/lib/actions/project-details";

export function TimelineTab({
  projectId,
  milestones = [],
}: {
  projectId: string;
  milestones: any[];
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<any>(null);

  const handleAddMilestone = async (formData: FormData) => {
    setIsLoading(true);
    const res = await addMilestone(projectId, formData);
    setIsLoading(false);
    if (res?.error) alert(`Database Error: ${res.error}`);
    else setOpen(false);
  };

  const handleEditMilestone = async (formData: FormData) => {
    if (!editingMilestone?.id) return;

    setIsLoading(true);
    const res = await updateMilestone(projectId, editingMilestone.id, formData);
    setIsLoading(false);
    if (res?.error) alert(`Database Error: ${res.error}`);
    else setEditingMilestone(null);
  };

  const handleDeleteMilestone = async () => {
    if (!deletingMilestone?.id) return;

    setIsLoading(true);
    const res = await deleteMilestone(projectId, deletingMilestone.id);
    setIsLoading(false);
    if (res?.error) alert(`Database Error: ${res.error}`);
    else setDeletingMilestone(null);
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr || dateStr === "No deadline") return "";
    try {
      const d = new Date(dateStr);
      return d.toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <Check className="w-5 h-5" strokeWidth={3} />;
      case "In Execution":
        return <PlayCircle className="w-5 h-5" strokeWidth={2.5} />;
      default:
        return <Clock className="w-5 h-5" strokeWidth={2.5} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-[#52B788] text-white";
      case "In Execution":
        return "bg-blue-500 text-white";
      case "Approved":
        return "bg-[#FFB703] text-white";
      default:
        return "bg-gray-100 text-gray-400";
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Execution":
        return "bg-blue-100 text-blue-700";
      case "Approved":
        return "bg-orange-100 text-orange-700";
      case "Proposed":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const safeMilestonesList = Array.isArray(milestones) ? milestones : [];

  return (
    <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">Project Milestones</h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" /> Add Milestone
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Milestone</DialogTitle>
            </DialogHeader>
            <form action={handleAddMilestone} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  Milestone Title
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g., Phase 1 Completed"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    name="progress"
                    required
                    min="0"
                    max="100"
                    defaultValue="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  Status
                </label>
                <select
                  name="status"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Proposed">Proposed</option>
                  <option value="Approved">Approved</option>
                  <option value="In Execution">In Execution</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Add Milestone"
                )}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative border-l-2 border-gray-100 ml-4 sm:ml-5 space-y-8 sm:space-y-10 pb-4">
        {safeMilestonesList.length === 0 && (
          <p className="text-sm text-gray-500 pl-6 sm:pl-8">No milestones added yet.</p>
        )}

        {safeMilestonesList.map((m: any, idx: number) => {
          if (!m) return null;

          return (
            <div
              key={m?.id || `fallback-${idx}`}
              className="relative pl-6 sm:pl-8 group"
            >
              <div
                className={`absolute -left-5.25 top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors ${getStatusColor(m?.status)}`}
              >
                {getStatusIcon(m?.status)}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 sm:gap-4 mb-3 sm:mb-2 w-full">
                <div className="w-full sm:w-auto pr-2">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#1B4332] transition-colors leading-tight">
                    {m?.title || "Untitled"}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" /> Target Date:{" "}
                    {m?.deadline || "No deadline"}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <span
                    className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap ${getBadgeColor(m?.status)}`}
                  >
                    {m?.status || "Pending"}
                  </span>

                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingMilestone(m)}
                      className="p-1.5 text-gray-400 hover:text-[#1B4332] hover:bg-green-50 rounded-lg transition-colors border border-gray-100 sm:border-transparent"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMilestone(m)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-100 sm:border-transparent"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <div className="flex justify-between text-xs text-gray-400 font-bold mb-1.5">
                  <span>Progress</span>
                  <span>{m?.progress || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${m?.status === "Pending" || m?.status === "Proposed" ? "bg-transparent" : "bg-[#52B788]"}`}
                    style={{ width: `${m?.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={!!editingMilestone}
        onOpenChange={(open) => !open && setEditingMilestone(null)}
      >
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
          </DialogHeader>
          <form action={handleEditMilestone} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">
                Milestone Title
              </label>
              <input
                name="title"
                defaultValue={editingMilestone?.title || ""}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  Target End Date
                </label>
                <input
                  type="date"
                  name="deadline"
                  defaultValue={formatDateForInput(editingMilestone?.deadline)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  Progress (%)
                </label>
                <input
                  type="number"
                  name="progress"
                  defaultValue={editingMilestone?.progress || 0}
                  required
                  min="0"
                  max="100"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue={editingMilestone?.status || "Pending"}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
              >
                <option value="Pending">Pending</option>
                <option value="Proposed">Proposed</option>
                <option value="Approved">Approved</option>
                <option value="In Execution">In Execution</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingMilestone}
        onOpenChange={(open) => !open && setDeletingMilestone(null)}
      >
        <DialogContent className="sm:max-w-md w-[95vw]">
          <div className="flex flex-col items-center text-center p-2">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
              Delete Milestone?
            </DialogTitle>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold text-gray-700">
                "{deletingMilestone?.title || "this milestone"}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => setDeletingMilestone(null)}
                disabled={isLoading}
                className="flex-1 py-3 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMilestone}
                disabled={isLoading}
                className="flex-1 py-3 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}