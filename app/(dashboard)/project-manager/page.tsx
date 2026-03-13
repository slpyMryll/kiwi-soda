import { createClient } from "@/lib/supabase/server";
import { Project } from "@/types/projects";
import { Inbox } from "lucide-react";

import { PmHeader } from "@/app/components/dashboard/PmHeader";
import { ProjectsWorkedCard } from "@/app/components/ui/ProjectsWorkedCard";
import { StatCard } from "@/app/components/ui/StatCard";
import { PmProjectCard } from "@/app/components/dashboard/PmProjectCard";
import { TaskSidebar } from "@/app/components/dashboard/TaskSidebar";

import { 
  MOCK_SIDEBAR_TASKS, 
  MOCK_PROJECTS_WORKED_DATA 
} from "@/lib/constants/pm-mock-data";

export default async function PmDashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      project_members (count),
      comments (count)
    `)
    .eq("manager_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5); 

  const projects: Project[] = data?.map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    imageUrl: p.image_url,
    tags: p.tags || [],
    status: p.status,
    liveStatus: p.live_status,
    totalBudget: Number(p.total_budget),
    spentBudget: Number(p.spent_budget),
    progress: p.progress,
    deadline: p.deadline,
    postedAt: p.posted_at || p.created_at,
    created_at: p.created_at,
    updated_at: p.updated_at,
    membersCount: p.project_members?.[0]?.count || 0,
    commentsCount: p.comments?.[0]?.count || 0,
    isFollowing: false, 
  })) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <PmHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="md:col-span-2 lg:col-span-2">
          <ProjectsWorkedCard data={MOCK_PROJECTS_WORKED_DATA} />
        </div>
        <div className="lg:col-span-1">
          <StatCard label="Active Tasks" value={7} badge="3 due soon" />
        </div>
        <div className="lg:col-span-1">
          <StatCard label="Projects Finished" value={5} subtext="4 pending" />
        </div>
        <div className="lg:col-span-1">
          <StatCard label="Council Members" value={16} subtext="2 online" />
        </div>
      </div>

     <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        
        <div className="lg:col-span-3 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-0">
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 shrink-0 mb-6">
            <div>
              <h2 className="text-2xl sm:text-[26px] font-bold text-[#153B44] tracking-tight">Recent Projects</h2>
              <p className="text-sm sm:text-[15px] text-gray-500 mt-1">Manage and track your latest council projects</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 min-h-0 pb-2">
            {projects.length > 0 ? (
              projects.map((project) => (
                <PmProjectCard key={project.id} {...project} />
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center mt-4">
                <Inbox className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No active projects found.</p>
                <p className="text-sm text-gray-400 mt-1">Head over to the Projects tab to create one.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <TaskSidebar tasks={MOCK_SIDEBAR_TASKS} />
        </div>

      </div>
    </div>
  );
}