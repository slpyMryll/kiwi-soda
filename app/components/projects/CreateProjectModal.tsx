"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { createProject } from "@/lib/actions/project";

export function CreateProjectModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    setError("");
    
    const result = await createProject(formData);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setOpen(false); 
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </DialogTrigger>
      
      {/* 🔥 FIX: Added max-h-[90vh] and overflow-y-auto to prevent stretching */}
      <DialogContent className="sm:max-w-125 bg-white rounded-2xl p-6 border-none shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1B4332]">Create New Project</DialogTitle>
        </DialogHeader>
        
        <form action={onSubmit} className="space-y-4 mt-4">
          {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg font-medium">{error}</div>}
          
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Project Title</label>
            <input name="title" required placeholder="e.g., Campus Eco-Drive" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332] transition-colors" />
          </div>
          
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Description</label>
            <textarea name="description" required rows={3} placeholder="Briefly describe the project goals..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332] transition-colors resize-none" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Total Budget (₱)</label>
              <input name="totalBudget" type="number" required min="0" placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332] transition-colors" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Deadline</label>
              <input name="deadline" type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332] transition-colors text-gray-700" />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">
              Cover Photo <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input 
              name="imageFile" 
              type="file" 
              accept="image/png, image/jpeg, image/webp"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1B4332] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1B4332]/10 file:text-[#1B4332] hover:file:bg-[#1B4332]/20" 
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input name="tags" placeholder="e.g., Nature, Tech, Infrastructure" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332] transition-colors" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isLoading} className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center disabled:opacity-70">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Project"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}