import { PmHeader } from "@/app/components/dashboard/PmHeader";
import { ProjectsWorkedCard } from "@/app/components/ui/ProjectsWorkedCard";
import { StatCard } from "@/app/components/ui/StatCard";
import { PmProjectCard } from "@/app/components/dashboard/PmProjectCard";
import { TaskSidebar } from "@/app/components/dashboard/TaskSidebar";

import { 
  MOCK_SIDEBAR_TASKS, 
  MOCK_PM_PROJECTS, 
  MOCK_PROJECTS_WORKED_DATA 
} from "@/lib/constants/pm-mock-data";

export default function PmDashboardPage() {
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
        

        <div className="lg:col-span-3 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
            <div>
              <h2 className="text-2xl sm:text-[26px] font-bold text-[#153B44] tracking-tight">Active Projects</h2>
              <p className="text-sm sm:text-[15px] text-gray-500 mt-1">Manage and track all your council projects</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {MOCK_PM_PROJECTS.map((project) => (
              <PmProjectCard key={project.id} {...project} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <TaskSidebar tasks={MOCK_SIDEBAR_TASKS} />
        </div>

      </div>
    </div>
  );
}