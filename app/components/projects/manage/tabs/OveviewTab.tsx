"use client";

import { useState } from "react";
import { Edit2, Globe, Loader2 } from "lucide-react";
import { Project } from "@/types/projects";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateProjectDescription } from "@/lib/actions/project-details";

export function OverviewTab({ project }: { project: Project }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    setIsPending(true);
    const res = await updateProjectDescription(project.id, formData);
    setIsPending(false);
    if (res.error) alert(res.error);
    else setIsEditOpen(false);
  };

  const startDate = new Date(project.created_at).toLocaleDateString();
  const endDate = new Date(project.deadline).toLocaleDateString();

  return (
    <div className="flex flex-col gap-6">
      
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#153B44]">Project Description</h2>
          
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader><DialogTitle>Edit Project Description</DialogTitle></DialogHeader>
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
                <button type="submit" disabled={isPending} className="w-full bg-[#1B4332] text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors">
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Description"}
                </button>
              </form>
            </DialogContent>
          </Dialog>

        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">{project.description}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-100">
          <div>
            <span className="text-gray-500 font-medium">Start Date: </span>
            <span className="font-bold text-gray-900">{startDate}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Target End Date: </span>
            <span className="font-bold text-gray-900">{endDate}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Total Budget: </span>
            <span className="font-bold text-gray-900">₱{project.totalBudget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-[#153B44] mb-6">Progress Overview</h2>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-gray-500">Overall Progress</span>
              <span className="text-[#1B4332]">{project.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#52B788] rounded-full transition-all" style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Active Tasks:</span>
              <span className="font-bold text-gray-900">{project.tasks?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Pending Tasks:</span>
              <span className="font-bold text-gray-900">{project.tasks?.filter(t => t.status !== 'Completed').length || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-[#153B44] mb-6">Recent Activity</h2>
          
          <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
            {project.budgetUpdates?.slice(0, 3).map((log: any, idx: number) => (
              <div key={idx} className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white" />
                <p className="text-sm font-bold text-gray-900">Budget Updated</p>
                <p className="text-xs text-gray-500">{log.description}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{log.date}</p>
              </div>
            ))}
            {(!project.budgetUpdates || project.budgetUpdates.length === 0) && (
              <p className="text-sm text-gray-500">No recent activity.</p>
            )}
          </div>
        </div>
      </div>

      {project.liveStatus === 'Live' ? (
        <div className="bg-[#E6F4EA] border border-[#BFFFE3] p-4 sm:p-5 rounded-2xl flex items-start gap-3">
          <Globe className="w-5 h-5 text-[#1B4332] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[#1B4332]">Project is Live</h4>
            <p className="text-xs sm:text-sm text-[#1B4332]/80 mt-1">
              This project is currently visible on the public dashboard. All VSU students can view project details, progress, and updates.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#E2E8F0]/50 border border-gray-200 p-4 sm:p-5 rounded-2xl flex items-start gap-3">
          <Globe className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-gray-900">Project Visibility</h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              This project is in draft mode and only visible to council members. Publish when you're ready to share with the VSU community.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}