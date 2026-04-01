"use client";

import { useState, useEffect } from "react";
import { 
  Search, LayoutGrid, List as ListIcon, Calendar, 
  FolderKanban, CheckCircle2, Circle, Clock, Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/types/pm";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export interface Task {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  dueDate: string;
  status: TaskStatus;
  isProjectLead: boolean;
}

interface PmTasksClientProps {
  initialTasks: Task[];
  currentUserId: string;
}

export function PmTasksClient({ initialTasks, currentUserId }: PmTasksClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightTaskId = searchParams.get("taskId");

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (highlightTaskId) {
      setTimeout(() => {
        const el = document.getElementById(`task-${highlightTaskId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [highlightTaskId, viewMode]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase.channel('my-tasks-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks', 
        filter: `assigned_to=eq.${currentUserId}` 
      }, async (payload) => {
        if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        } else {
          const { data: fullTask } = await supabase
            .from('tasks')
            .select('id, title, due_date, status, projects (id, title, manager_id)')
            .eq('id', payload.new.id)
            .single();

          if (fullTask) {
            const projectData = Array.isArray(fullTask.projects) ? fullTask.projects[0] : fullTask.projects;
            const formatted: Task = {
              id: fullTask.id,
              title: fullTask.title,
              dueDate: fullTask.due_date || "",
              status: fullTask.status,
              projectId: projectData?.id || "",
              projectName: projectData?.title || "Unknown Project",
              isProjectLead: projectData?.manager_id === currentUserId
            };

            setTasks(prev => {
              const exists = prev.find(t => t.id === formatted.id);
              if (exists) return prev.map(t => t.id === formatted.id ? formatted : t);
              return [...prev, formatted];
            });
          }
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    if (error) console.error("Error updating task:", error);
  };

  const handleAction = (task: Task) => {
    if (task.status === "Completed") return;

    if (task.status === "Pending") {
      updateTaskStatus(task.id, "In Progress");
    } else if (task.status === "In Progress") {
      const nextStatus = task.isProjectLead ? "Completed" : "Awaiting Review";
      updateTaskStatus(task.id, nextStatus);
    } else if (task.status === "Awaiting Review") {
      updateTaskStatus(task.id, "In Progress");
    }
  };

  const navigateToProject = (projectId: string, taskId: string) => {
    if (!projectId) return;
    router.push(`/project-manager/projects/${projectId}?tab=Tasks+%26+Team&taskId=${taskId}`);
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEffectiveStatus = (task: Task): TaskStatus => {
    const now = new Date();
    const deadline = new Date(task.dueDate);
    deadline.setHours(23, 59, 59, 999);

    if (task.status === 'Completed') return 'Completed';
    if (task.status === 'Awaiting Review') return 'Awaiting Review'; 
    if (deadline < now) return 'Overdue';
    
    return task.status;
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Pending': return "bg-gray-100 text-gray-500";
      case 'In Progress': return "bg-orange-100 text-orange-700";
      case 'Awaiting Review': return "bg-amber-100 text-amber-700 animate-pulse";
      case 'Completed': return "bg-[#C4E7D4] text-[#4A7C5F]";
      case 'Overdue': return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#153B44] tracking-tight">My Tasks</h1>
          <p className="text-sm sm:text-[15px] text-gray-500 mt-1">Manage your assigned duties and project deliverables.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 shadow-sm"
            />
          </div>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-full sm:w-auto justify-center">
            <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md transition-all flex-1 sm:flex-none flex justify-center", viewMode === "list" ? "bg-gray-100 text-[#153B44] shadow-sm" : "text-gray-400")}>
              <ListIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md transition-all flex-1 sm:flex-none flex justify-center", viewMode === "grid" ? "bg-gray-100 text-[#153B44] shadow-sm" : "text-gray-400")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                <th className="p-4 w-12 text-center">Action</th>
                <th className="p-4">Task Details</th>
                <th className="p-4 hidden md:table-cell text-right pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTasks.map((task) => {
                const effectiveStatus = getEffectiveStatus(task);
                const isPendingReal = task.status === "Pending";
                const isReviewReal = task.status === "Awaiting Review";
                const isDone = task.status === "Completed";
                const isOverdue = effectiveStatus === "Overdue";
                
                return (
                  <tr 
                    key={task.id} 
                    id={`task-${task.id}`}
                    onClick={() => navigateToProject(task.projectId, task.id)}
                    className={cn(
                      "transition-colors cursor-pointer group", 
                      isDone ? "bg-gray-50/30 hover:bg-gray-50/80" : "hover:bg-gray-50/50",
                      isOverdue && !isDone ? "bg-red-50/20 hover:bg-red-50/40" : ""
                    )}
                  >
                    <td className="p-4 text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAction(task); }} 
                        disabled={isDone}
                        className="outline-none"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-[#4A7C5F]" />
                        ) : isReviewReal ? (
                          <Clock className="w-5 h-5 text-amber-500 hover:text-amber-600" />
                        ) : isPendingReal ? (
                          <Play className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors" />
                        ) : (
                          <Circle className={cn(
                            "w-5 h-5 transition-colors", 
                            isOverdue ? "text-red-300 hover:text-red-500" : 
                            task.isProjectLead ? "text-gray-300 hover:text-[#4A7C5F]" : "text-gray-300 hover:text-amber-500"
                          )} />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <p className={cn("text-sm font-medium", isDone && "text-gray-400 line-through", isOverdue && !isDone && "text-red-700")}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1 group-hover:text-gray-600 transition-colors"><FolderKanban className="w-3 h-3"/> {task.projectName}</span>
                        <span className={cn("flex items-center gap-1", isOverdue && !isDone && "text-red-500")}>
                          <Calendar className="w-3 h-3"/> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "No Date"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right pr-6 hidden md:table-cell">
                      <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-medium shadow-sm", getStatusBadge(effectiveStatus))}>
                        {effectiveStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTasks.map((task) => {
            const effectiveStatus = getEffectiveStatus(task);
            const isPendingReal = task.status === "Pending";
            const isReviewReal = task.status === "Awaiting Review";
            const isDone = task.status === "Completed";
            const isOverdue = effectiveStatus === "Overdue";
            
            return (
              <div 
                key={task.id} 
                id={`task-${task.id}`}
                onClick={() => navigateToProject(task.projectId, task.id)}
                className={cn(
                  "bg-white rounded-xl p-5 border shadow-sm transition-all flex flex-col h-full cursor-pointer group", 
                  isDone ? "bg-gray-50/50 border-transparent" : "border-gray-200 hover:border-[#153B44]/30 hover:shadow-md",
                  isOverdue && !isDone ? "border-red-200 bg-red-50/10" : ""
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm", getStatusBadge(effectiveStatus))}>
                    {effectiveStatus}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); handleAction(task); }} disabled={isDone} className="outline-none">
                    {isDone ? <CheckCircle2 className="w-6 h-6 text-[#4A7C5F]" /> : isReviewReal ? <Clock className="w-6 h-6 text-amber-500 hover:text-amber-600" /> : isPendingReal ? <Play className="w-6 h-6 text-gray-400 hover:text-blue-500" /> : <Circle className={cn("w-6 h-6 transition-colors", isOverdue ? "text-red-300 hover:text-red-500" : task.isProjectLead ? "text-gray-300 hover:text-[#4A7C5F]" : "text-gray-300 hover:text-amber-500")} />}
                  </button>
                </div>
                <h3 className={cn("text-base font-semibold leading-snug mb-3", isDone && "text-gray-400 line-through", isOverdue && !isDone && "text-red-700")}>{task.title}</h3>
                <div className="space-y-2 pt-4 border-t border-gray-100 mt-auto text-xs text-gray-500">
                  <div className="flex items-center gap-2 group-hover:text-gray-700 transition-colors"><FolderKanban className="w-4 h-4 text-gray-400" /><span className="truncate">{task.projectName}</span></div>
                  <div className={cn("flex items-center gap-2", isOverdue && !isDone && "text-red-500")}><Calendar className="w-4 h-4" /><span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "No Date"}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}