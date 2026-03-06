import { PmHeader } from "@/app/components/dashboard/PmHeader";
import { ProjectsWorkedCard } from "@/app/components/ui/ProjectsWorkedCard";
import { StatCard } from "@/app/components/ui/StatCard";
import { PmProjectCard } from "@/app/components/dashboard/PmProjectCard";
import { TaskSidebar, SidebarTask } from "@/app/components/dashboard/TaskSidebar";

export default function PmDashboardPage() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const databaseTasks: SidebarTask[] = [
    { id: "1", name: "Achievement Plan", status: "Pending", dueDate: today.toISOString() },
    { id: "2", name: "Designing Graphics", status: "In Progress", dueDate: today.toISOString() },
    { id: "3", name: "Financial budget proposal", status: "Completed", dueDate: tomorrow.toISOString() },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <PmHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="md:col-span-2 lg:col-span-2"><ProjectsWorkedCard /></div>
        <div className="lg:col-span-1"><StatCard label="Active Tasks" value={7} badge="3 due soon" /></div>
        <div className="lg:col-span-1"><StatCard label="Projects Finished" value={5} subtext="4 pending" /></div>
        <div className="lg:col-span-1"><StatCard label="Council Members" value={16} subtext="2 online" /></div>
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
            <PmProjectCard title="Protect Project Nature 2026" status="Active" isLive={true} progress={67} projectLead="Php 50,000" members="8/14" deadline="April 20 2026" budget="34,560/50,000" />
            <PmProjectCard title="Digital Student ID System" status="Pending" isLive={false} progress={45} projectLead="Php 120,000" members="12/15" deadline="Dec 15 2026" budget="45,000/120,000" />
          </div>
        </div>

        <div className="lg:col-span-2">
          <TaskSidebar tasks={databaseTasks} />
        </div>

      </div>
    </div>
  );
}