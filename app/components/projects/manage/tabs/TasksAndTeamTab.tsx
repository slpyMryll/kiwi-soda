"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, User, Loader2, Calendar, Edit2, Trash2, Lock, AlertTriangle,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { addProjectMember, assignTask } from "@/lib/actions/project-details";
import { USSC_BUDGET_CATEGORIES } from "@/lib/constants/budget-categories";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function TasksAndTeamTab({
  projectId, members = [], tasks = [], availablePMs = [], isProjectLead = false, currentUserId = "",
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightTaskId = searchParams.get("taskId");

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [localMembers, setLocalMembers] = useState(members);
  const [localTasks, setLocalTasks] = useState(tasks);

  const [remainingBudget, setRemainingBudget] = useState<number | null>(null);
  const todayDate = new Date().toISOString().split("T")[0];

  const fetchFreshTabState = useCallback(async () => {
    const supabase = createClient();
    const { data: projectData } = await supabase
      .from("projects")
      .select("total_budget, spent_budget")
      .eq("id", projectId)
      .single();
    if (projectData) {
      setRemainingBudget(
        Number(projectData.total_budget || 0) -
          Number(projectData.spent_budget || 0),
      );
    }
    const { data: latestTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId);
    if (latestTasks) {
      const formattedTasks = latestTasks.map((t) => {
        const pm = availablePMs.find((p: any) => p.id === t.assigned_to);
        return {
          id: t.id,
          title: t.title,
          assignee: pm ? pm.full_name : "Team Member",
          dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString() : "N/A",
          rawDueDate: t.due_date,
          status: t.status,
          cost: t.cost,
          assigned_to: t.assigned_to,
        };
      });
      setLocalTasks(formattedTasks);
    }
  }, [projectId, availablePMs]);

  useEffect(() => {
    if (isMounted) fetchFreshTabState();
  }, [isMounted, fetchFreshTabState]);

  useEffect(() => {
    if (highlightTaskId) {
      setTimeout(() => {
        const el = document.getElementById(`project-task-${highlightTaskId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [highlightTaskId, localTasks]);

  useEffect(() => {
    const supabase = createClient();

    const taskChannel = supabase
      .channel(`project-tasks-${projectId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
        (payload) => {
          const pm = availablePMs.find((p: any) => p.id === payload.new.assigned_to);
          const newTask = {
            id: payload.new.id,
            title: payload.new.title,
            assignee: pm ? pm.full_name : "Team Member",
            dueDate: payload.new.due_date ? new Date(payload.new.due_date).toLocaleDateString() : "N/A",
            rawDueDate: payload.new.due_date,
            status: payload.new.status,
            cost: payload.new.cost,
            assigned_to: payload.new.assigned_to,
          };
          
          setLocalTasks((prev: any) => {
            if (prev.some((t: any) => t.id === newTask.id)) return prev;
            return [...prev, newTask];
          });
        }
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
        (payload) => {
          setLocalTasks((prev: any) =>
            prev.map((t: any) => {
              if (t.id === payload.new.id) {
                const pm = availablePMs.find((p: any) => p.id === payload.new.assigned_to);
                return {
                  ...t,
                  title: payload.new.title,
                  status: payload.new.status,
                  dueDate: payload.new.due_date ? new Date(payload.new.due_date).toLocaleDateString() : "N/A",
                  rawDueDate: payload.new.due_date,
                  cost: payload.new.cost,
                  assigned_to: payload.new.assigned_to,
                  assignee: pm ? pm.full_name : t.assignee,
                };
              }
              return t;
            })
          );
        }
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "tasks" },
        (payload) => {
          setLocalTasks((prev: any) => prev.filter((t: any) => t.id !== payload.old.id));
        }
      )
      .subscribe();

    const memberChannel = supabase
      .channel(`project-members-${projectId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_members", filter: `project_id=eq.${projectId}` },
        (payload) => {
          const pm = availablePMs.find((p: any) => p.id === payload.new.profile_id);
          if (pm) {
            const newMember = {
              id: pm.id,
              name: pm.full_name,
              role: payload.new.project_role,
              display_role: payload.new.project_role,
              avatarUrl: pm.avatar_url || null,
            };
            setLocalMembers((prev: any) => {
              if (prev.find((m: any) => m.id === newMember.id)) return prev;
              return [...prev, newMember];
            });
          }
        }
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "project_members", filter: `project_id=eq.${projectId}` },
        (payload) => {
          setLocalMembers((prev: any) => prev.filter((m: any) => m.id !== payload.old.profile_id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(memberChannel);
    };
  }, [projectId, availablePMs]);

  const handleApproveTask = async (taskId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("tasks").update({ status: "Completed" }).eq("id", taskId);
    if (error) alert("Failed to approve task.");
  };

  const confirmDelete = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", taskToDelete);

    setIsDeleting(false);
    if (error) {
      alert("Failed to delete task.");
    } else {
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const getMemberStats = (profileId: string) => {
    const memberTasks = localTasks.filter((t: any) => t.assigned_to === profileId);
    const completed = memberTasks.filter((t: any) => t.status === "Completed").length;
    return {
      total: memberTasks.length,
      completed,
      percentage: memberTasks.length > 0 ? (completed / memberTasks.length) * 100 : 0,
    };
  };

  const getEffectiveStatus = (task: any) => {
    if (!task.rawDueDate) return task.status;
    const now = new Date();
    const deadline = new Date(task.rawDueDate);
    deadline.setHours(23, 59, 59, 999);

    if (task.status === "Completed") return "Completed";
    if (task.status === "Awaiting Review") return "Awaiting Review";
    if (deadline < now) return "Overdue";

    return task.status;
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "bg-[#C4E7D4] text-[#4A7C5F]";
      case "pending": return "bg-gray-100 text-gray-500";
      case "in progress": return "bg-orange-100 text-orange-700";
      case "awaiting review": return "bg-amber-100 text-amber-700 animate-pulse";
      case "overdue": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await addProjectMember(projectId, formData);
    setIsLoading(false);
    if (result.error) alert(`Database Error: ${result.error}`);
    else setIsMemberModalOpen(false);
  };

  const handleAssignTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const cost = Number(formData.get("cost") || 0);
    if (remainingBudget !== null && cost > remainingBudget) {
      alert(`Error: Task cost (₱${cost.toLocaleString()}) exceeds the remaining project balance (₱${remainingBudget.toLocaleString()}).`);
      setIsLoading(false);
      return;
    }

    const result = await assignTask(projectId, formData);
    setIsLoading(false);
    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      fetchFreshTabState();
      setIsTaskModalOpen(false);
    }
  };

  const handleEditTaskSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask) return;
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const cost = Number(formData.get("cost") || 0);
    const oldCost = editingTask.cost || 0;
    const costDifference = cost - oldCost;

    if (remainingBudget !== null && costDifference > remainingBudget) {
      alert(`Error: Increasing the task cost by ₱${costDifference.toLocaleString()} exceeds the remaining project balance (₱${remainingBudget.toLocaleString()}).`);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    const updates = {
      title: formData.get("title"),
      assigned_to: formData.get("assignedTo"),
      due_date: formData.get("dueDate"),
      cost,
    };
    const { error } = await supabase.from("tasks").update(updates).eq("id", editingTask.id);
    setIsLoading(false);
    if (error) alert(`Error updating task: ${error.message}`);
    else {
      fetchFreshTabState();
      setIsEditModalOpen(false);
      setEditingTask(null);
    }
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const navigateToMyTasks = (taskId: string, isMyTask: boolean) => {
    if (isMyTask || isProjectLead) {
      router.push(`/project-manager/tasks?taskId=${taskId}`);
    }
  };

  if (!isMounted) return <div className="animate-pulse bg-white p-5 h-[600px] rounded-2xl w-full" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[450px] sm:h-[500px] lg:h-[550px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Task management</h2>

          {isProjectLead && (
            <Dialog open={isTaskModalOpen} onOpenChange={(open) => { setIsTaskModalOpen(open); if (open) fetchFreshTabState(); }}>
              <DialogTrigger asChild>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold transition-colors">
                  <Plus className="w-4 h-4" /> Assign Task
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Assign New Task</DialogTitle></DialogHeader>
                <form onSubmit={handleAssignTask} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Task Title</label>
                    <input name="title" required placeholder="e.g., Site Assessment Report" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Assign To</label>
                    <select name="assignedTo" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]">
                      <option value="">Select a project member...</option>
                      {localMembers.map((m: any) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">Due Date</label>
                      <input 
                        type="date" 
                        name="dueDate" 
                        required 
                        min={todayDate} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">Budget Cost (Optional)</label>
                      <input type="number" name="cost" step="0.01" min="0" max={remainingBudget !== null ? remainingBudget : ""} placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">
                      Expense Category <span className="text-gray-400 font-normal">(If cost applied)</span>
                    </label>
                    <select name="category" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]">
                      <option value="Task Allocation">Task Allocation (Default)</option>
                      {USSC_BUDGET_CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Task"}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (open) fetchFreshTabState(); }}>
            <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit Task Details</DialogTitle></DialogHeader>
              {editingTask && (
                <form onSubmit={handleEditTaskSubmit} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Task Title</label>
                    <input name="title" defaultValue={editingTask.title} required placeholder="e.g., Site Assessment Report" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Assign To</label>
                    <select name="assignedTo" defaultValue={editingTask.assigned_to} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]">
                      <option value="">Select a project member...</option>
                      {localMembers.map((m: any) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">Due Date</label>
                      <input 
                        type="date" 
                        name="dueDate" 
                        defaultValue={editingTask.rawDueDate ? new Date(editingTask.rawDueDate).toISOString().split("T")[0] : ""} 
                        required 
                        min={todayDate}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">Budget Cost (Optional)</label>
                      <input type="number" name="cost" step="0.01" min="0" max={remainingBudget !== null ? remainingBudget + (editingTask.cost || 0) : ""} defaultValue={editingTask.cost} placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                  </button>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className="sm:max-w-md w-[95vw] p-6">
              <DialogHeader>
                <DialogTitle className="text-red-600 flex items-center gap-2 text-xl">
                  <AlertTriangle className="w-6 h-6" /> Confirm Deletion
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-[15px] text-gray-600 leading-relaxed">
                  Are you sure you want to delete this task? This action cannot be undone and will permanently remove the record from the project tracking.
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={executeDelete} disabled={isDeleting} className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70">
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Yes, Delete Task
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar">
          {localTasks.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 px-4 mt-2">
              <p className="text-sm text-gray-500">No tasks assigned yet. {isProjectLead && 'Click "Assign Task" to start.'}</p>
            </div>
          ) : (
            localTasks.map((task: any) => {
              const isMyTask = task.assigned_to === currentUserId;
              const isInteractable = isMyTask || isProjectLead;
              const effectiveStatus = getEffectiveStatus(task);

              return (
                <div key={task.id} id={`project-task-${task.id}`} onClick={() => isInteractable && navigateToMyTasks(task.id, isMyTask)} title={!isInteractable ? "This task is not assigned to you." : "Click to view in My Tasks"} className={cn("flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-3 sm:gap-4 group bg-white", isInteractable ? "cursor-pointer border-gray-200 hover:border-[#153B44]/30 hover:shadow-sm" : "cursor-not-allowed opacity-75 border-gray-200 hover:bg-gray-50")}>
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    {!isInteractable && (
                      <div className="shrink-0 p-1.5 bg-gray-100 rounded-md">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className={cn("text-sm font-bold mb-2 truncate transition-colors", "text-gray-900", isInteractable ? "group-hover:text-[#153B44]" : "")}>
                        {task.title}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5 truncate"><User className="w-3.5 h-3.5 shrink-0" /> {task.assignee}</span>
                        <span className="flex items-center gap-1.5 shrink-0"><Calendar className="w-3.5 h-3.5" /> Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 mt-2 sm:mt-0">
                    {task.status === "Awaiting Review" && isProjectLead && (
                      <button onClick={(e) => { e.stopPropagation(); handleApproveTask(task.id); }} className="text-[11px] bg-[#153B44] text-white px-3 py-1.5 rounded-lg hover:bg-[#1B4B57] transition-colors font-semibold shadow-sm">
                        Approve
                      </button>
                    )}

                    {effectiveStatus === "Overdue" && task.status !== "Awaiting Review" && isProjectLead && (
                      <button onClick={(e) => { e.stopPropagation(); handleApproveTask(task.id); }} className="text-[11px] bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-sm">
                        Force Complete
                      </button>
                    )}

                    <span className={`px-3 py-1.5 sm:py-1 rounded-full text-xs font-bold w-fit capitalize text-center ${getStatusStyles(effectiveStatus)}`}>
                      {effectiveStatus.replace("-", " ")}
                    </span>

                    {isProjectLead && (
                      <div className="flex items-center gap-1 border-l border-gray-200 pl-2 sm:pl-3 ml-1">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(task); }} title="Edit Task" className="p-1.5 text-gray-400 hover:text-[#1B4332] rounded-md hover:bg-green-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); confirmDelete(task.id); }} title="Delete Task" className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900">Team Members</h2>

          {isProjectLead && (
            <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
              <DialogTrigger asChild>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold transition-colors">
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md w-[95vw]">
                <DialogHeader><DialogTitle>Add Officer to Project</DialogTitle></DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Select Officer</label>
                    <select name="profileId" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]">
                      <option value="">Select from Council...</option>
                      {availablePMs.filter((pm: any) => !localMembers.find((m: any) => m.id === pm.id)).map((pm: any) => (
                        <option key={pm.id} value={pm.id}>{pm.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add to Project"}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {localMembers.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-1 lg:col-span-2 py-4">No members assigned yet.</p>
          ) : (
            localMembers.map((m: any) => {
              const stats = getMemberStats(m.id);
              return (
                <div key={m.id} className="p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                  <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        m.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight truncate">{m.name}</h4>
                      <p className="text-xs text-[#1B4332] font-medium truncate mt-0.5">{m.display_role || m.role}</p>
                    </div>
                  </div>
                  <div className="w-full sm:text-right sm:w-32 shrink-0">
                    <p className="text-[10px] font-bold text-gray-500 mb-1.5">Tasks {stats.completed}/{stats.total} completed</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#52B788] rounded-full transition-all" style={{ width: `${stats.percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}