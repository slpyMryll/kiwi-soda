"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  PhilippinePeso,
  Users,
  Clock,
  ArrowLeft,
  Eye,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { ProjectManageHeader } from "@/app/components/projects/manage/ProjectManagerHeader";
import { OverviewTab } from "@/app/components/projects/manage/tabs/OveviewTab";
import { TasksAndTeamTab } from "@/app/components/projects/manage/tabs/TasksAndTeamTab";
import { BudgetTab } from "@/app/components/projects/manage/tabs/BudgetTab";
import { TimelineTab } from "@/app/components/projects/manage/tabs/TimelineTab";
import { DocumentsTab } from "@/app/components/projects/manage/tabs/DocumentsTab";
import { ChartsTab } from "@/app/components/projects/manage/tabs/ChartsTab";
import { ProjectDetailView } from "@/app/components/projects/ProjectDetailView";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const TABS = [
  "Overview",
  "Tasks & Team",
  "Budget",
  "Timeline",
  "Documents",
  "Charts",
];

export default function ProjectDetailClient({
  project,
  availablePMs,
  initialTab,
}: {
  project: any;
  availablePMs: any[];
  initialTab: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [progress, setProgress] = useState(project.progress || 0);
  const [spentBudget, setSpentBudget] = useState(project.spentBudget || 0);
  const [membersCount, setMembersCount] = useState(project.membersCount || 0);
  const [pendingTasks, setPendingTasks] = useState(
    project.tasks?.filter((t: any) => t.status !== "Completed").length || 0
  );

  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase.channel('project-metrics-sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${project.id}` }, (payload) => {
        if (payload.new.progress !== undefined) setProgress(payload.new.progress);
        if (payload.new.spent_budget !== undefined) setSpentBudget(payload.new.spent_budget);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${project.id}` }, async () => {
        const { count } = await supabase.from('tasks').select('*', { count: 'exact', head: true })
          .eq('project_id', project.id).neq('status', 'Completed');
        if (count !== null) setPendingTasks(count);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members', filter: `project_id=eq.${project.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') setMembersCount((prev: number) => prev + 1);
        if (payload.eventType === 'DELETE') setMembersCount((prev: number) => Math.max(1, prev - 1));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [project.id]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

  const handleCoverPhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB");
      return;
    }

    setIsUploading(true);
    const supabase = createClient();

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${project.id}/cover-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("project-assets")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("project-assets").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("projects")
        .update({ image_url: publicUrl })
        .eq("id", project.id);

      if (updateError) throw updateError;

      router.refresh();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to update cover photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const formattedBudget = spentBudget >= 1000 
    ? `${(spentBudget / 1000).toFixed(1)}k` 
    : spentBudget.toString();

  const stats = [
    {
      label: "Progress",
      value: `${progress}%`,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      label: "Budget Spent",
      value: formattedBudget,
      icon: PhilippinePeso,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      label: "Team Members",
      value: membersCount,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 max-w-7xl mx-auto w-full pb-24">
      <div className="flex justify-between items-center w-full mb-1">
        <Link
          href="/project-manager/projects"
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1B4332] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        <button
          onClick={() => setIsPreviewOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#1B4332] rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Eye className="w-4 h-4" /> Preview Public View
        </button>
      </div>

      <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-sm group bg-gray-200">
        <img
          src={project.imageUrl || "/project-card-place.webp"}
          alt="Project Cover"
          className={`w-full h-full object-cover transition-all duration-500 ${isUploading ? "opacity-50 scale-105" : "group-hover:scale-105"}`}
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <label className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-white/95 hover:bg-white text-gray-900 rounded-full font-bold text-sm shadow-xl transition-transform hover:scale-105">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            {isUploading ? "Uploading..." : "Change Cover Photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverPhotoChange}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      <ProjectManageHeader project={project} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                <h3 className="text-2xl font-bold text-gray-900 leading-none">
                  {stat.value}
                </h3>
                <p className="text-xs font-semibold text-gray-500 mt-1">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full bg-gray-200/60 p-1.5 rounded-2xl flex overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex-1 min-w-30 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === tab
                ? "bg-white text-[#153B44] shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full">
        {activeTab === "Overview" && <OverviewTab project={project} />}
        {activeTab === "Tasks & Team" && (
          <TasksAndTeamTab
            projectId={project.id}
            members={project.members}
            tasks={project.tasks}
            availablePMs={availablePMs}
            isProjectLead={project.isManager}
            currentUserId={project.currentUserId}
          />
        )}
        {activeTab === "Budget" && <BudgetTab project={project} />}
        {activeTab === "Timeline" && (
          <TimelineTab projectId={project.id} milestones={project.milestones} />
        )}
        {activeTab === "Documents" && <DocumentsTab project={project} />}
        {activeTab === "Charts" && <ChartsTab project={project} />}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] lg:max-w-4xl xl:max-w-5xl p-0 overflow-hidden bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Project Preview</DialogTitle>
          <ProjectDetailView
            project={project}
            userRole="guest"
            isModal={true}
            isPreview={true}
            onClose={() => setIsPreviewOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}