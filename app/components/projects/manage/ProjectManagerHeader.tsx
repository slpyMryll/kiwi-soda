"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Globe, Trash2, Loader2, AlertTriangle, EyeOff, Eye } from "lucide-react";
import { Project } from "@/types/projects";
import { toggleProjectLiveStatus, deleteProject } from "@/lib/actions/project";
import { updateProjectDetails } from "@/lib/actions/project-details";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ProjectManageHeader({ project }: { project: Project }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleToggleStatus = async () => {
    setIsPending(true);
    const res = await toggleProjectLiveStatus(project.id, project.liveStatus);
    setIsPending(false);
    if (res.error) alert(`Error: ${res.error}`);
    else setIsToggleModalOpen(false);
  };

  const handleDelete = async () => {
    setIsPending(true);
    const res = await deleteProject(project.id);
    setIsPending(false);
    
    if (res.error) {
      alert(`Delete Error: ${res.error}`);
    } else {
      setIsDeleteModalOpen(false);
      router.push("/project-manager/projects");
    }
  };

  const handleUpdateDetails = async (formData: FormData) => {
    setIsPending(true);
    const res = await updateProjectDetails(project.id, formData);
    setIsPending(false);
    if (res.error) alert(res.error);
    else setIsEditModalOpen(false);
  };

  const isLive = project.liveStatus === "Live";
  const projectLead = project.members?.find(m => m.role === 'Project Lead')?.name || 'Assigned PM';

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 w-full">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#153B44]">{project.title}</h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${isLive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              {project.liveStatus}
            </span>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Edit Project Details</DialogTitle></DialogHeader>
                <form action={handleUpdateDetails} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Project Title</label>
                    <input name="title" defaultValue={project.title} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Location</label>
                    <input name="location" defaultValue={project.location || 'VSU Campus'} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" />
                  </div>
                  <button type="submit" disabled={isPending} className="w-full bg-[#1B4332] text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors">
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
            <span>Project Lead: <span className="text-gray-900">{projectLead}</span></span>
            <span>Location: <span className="text-gray-900">{project.location || 'VSU Campus'}</span></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button onClick={() => setIsToggleModalOpen(true)} disabled={isPending} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 text-gray-500" />}
            {isLive ? "Unpublish" : "Publish"}
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)} disabled={isPending} className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors bg-white shadow-sm disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>

      {isToggleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto ${isLive ? "bg-orange-100" : "bg-[#E6F4EA]"}`}>
              {isLive ? <EyeOff className="w-6 h-6 text-orange-600" /> : <Eye className="w-6 h-6 text-[#1B4332]" />}
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{isLive ? "Unpublish Project?" : "Publish Project?"}</h3>
            <p className="text-sm text-center text-gray-500 mb-6">{isLive ? "This will hide the project from the public feed." : "This will make the project visible to all students."}</p>
            <div className="flex gap-3">
              <button onClick={() => setIsToggleModalOpen(false)} disabled={isPending} className="flex-1 py-2.5 bg-gray-100 font-semibold rounded-xl disabled:opacity-50 transition-colors">Cancel</button>
              <button onClick={handleToggleStatus} disabled={isPending} className={`flex-1 py-2.5 text-white font-semibold rounded-xl ${isLive ? "bg-orange-600" : "bg-[#1B4332]"} disabled:opacity-70 transition-colors flex items-center justify-center`}>{isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-sm text-center text-gray-500 mb-6">Are you sure you want to delete <span className="font-bold text-gray-700">"{project.title}"</span>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} disabled={isPending} className="flex-1 py-2.5 bg-gray-100 font-semibold rounded-xl transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={isPending} className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center">{isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}