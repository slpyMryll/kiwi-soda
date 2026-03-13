import { useState } from "react";
import { Plus, Check, Clock, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addMilestone } from "@/lib/actions/project-details";

export function TimelineTab({ projectId, milestones = [] }: any) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMilestone = async (formData: FormData) => {
    setIsLoading(true);
    await addMilestone(projectId, formData);
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm border-t-4 border-t-blue-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">Project Milestones</h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" /> Add Milestone
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
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
              <div className="grid grid-cols-2 gap-4">
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
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1B4332] text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70"
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

      <div className="relative border-l-2 border-gray-100 ml-5 space-y-10 pb-4">
        {milestones.length === 0 && (
          <p className="text-sm text-gray-500 pl-8">No milestones added yet.</p>
        )}
        {milestones.map((m: any) => (
          <div key={m.id} className="relative pl-8">
            <div
              className={`absolute -left-5 top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${
                m.status === "Completed"
                  ? "bg-[#52B788] text-white"
                  : m.status === "In Progress"
                    ? "bg-[#FFB703] text-white"
                    : "bg-gray-100"
              }`}
            >
              {m.status === "Completed" && (
                <Check className="w-5 h-5" strokeWidth={3} />
              )}
              {m.status === "In Progress" && (
                <Clock className="w-5 h-5" strokeWidth={2.5} />
              )}
            </div>

            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-sm font-bold text-gray-900">{m.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  End Date: {m.deadline}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-[10px] font-bold rounded-full capitalize ${
                  m.status === "Completed"
                    ? "bg-green-100 text-green-600"
                    : m.status === "In Progress"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {m.status}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 font-bold mb-1.5">
                <span>Progress</span>
                <span>{m.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${m.status === "Pending" ? "bg-transparent" : "bg-[#52B788]"}`}
                  style={{ width: `${m.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
