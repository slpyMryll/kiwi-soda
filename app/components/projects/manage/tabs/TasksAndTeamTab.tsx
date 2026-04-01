"use client";

import { useState, useEffect } from "react";
import { Plus, User, Loader2, Calendar, Edit2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addProjectMember, assignTask } from "@/lib/actions/project-details";
import { createClient } from "@/lib/supabase/client";

export function TasksAndTeamTab({
  projectId,
  members = [],
  tasks = [],
  availablePMs = [],
  isProjectLead = false,
}: any) {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  const [localMembers, setLocalMembers] = useState(members);
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalMembers(members);
    setLocalTasks(tasks);
  }, [members, tasks]);

  useEffect(() => {
    const supabase = createClient();

    const taskChannel = supabase
      .channel("realtime-tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const pm = availablePMs.find(
              (p: any) => p.id === payload.new.assigned_to,
            );
            const newTask = {
              id: payload.new.id,
              title: payload.new.title,
              assignee: pm ? pm.full_name : "Team Member",
              dueDate: payload.new.due_date
                ? new Date(payload.new.due_date).toLocaleDateString()
                : "N/A",
              rawDueDate: payload.new.due_date,
              status: payload.new.status,
              cost: payload.new.cost,
              assigned_to: payload.new.assigned_to,
            };
            setLocalTasks((prev: any) => [...prev, newTask]);
          } else if (payload.eventType === "UPDATE") {
            setLocalTasks((prev: any) =>
              prev.map((t: any) => {
                if (t.id === payload.new.id) {
                  const pm = availablePMs.find(
                    (p: any) => p.id === payload.new.assigned_to,
                  );
                  return {
                    ...t,
                    title: payload.new.title,
                    status: payload.new.status,
                    dueDate: payload.new.due_date
                      ? new Date(payload.new.due_date).toLocaleDateString()
                      : "N/A",
                    rawDueDate: payload.new.due_date,
                    cost: payload.new.cost,
                    assigned_to: payload.new.assigned_to,
                    assignee: pm ? pm.full_name : t.assignee,
                  };
                }
                return t;
              }),
            );
          } else if (payload.eventType === "DELETE") {
            setLocalTasks((prev: any) =>
              prev.filter((t: any) => t.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    const memberChannel = supabase
      .channel("realtime-members")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_members",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const pm = availablePMs.find(
            (p: any) => p.id === payload.new.profile_id,
          );
          if (pm) {
            const newMember = {
              id: pm.id,
              name: pm.full_name,
              role: payload.new.project_role,
              avatarUrl: pm.avatar_url || null,
            };
            setLocalMembers((prev: any) => [...prev, newMember]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(memberChannel);
    };
  }, [projectId, availablePMs]);

  const handleApproveTask = async (taskId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'Completed' })
      .eq('id', taskId);
      
    if (error) alert("Failed to approve task.");
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;
    
    const supabase = createClient();
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
      
    if (error) alert("Failed to delete task.");
  };

  const getMemberStats = (profileId: string) => {
    const memberTasks = localTasks.filter(
      (t: any) => t.assigned_to === profileId,
    );
    const completed = memberTasks.filter(
      (t: any) => t.status === "Completed",
    ).length;
    return {
      total: memberTasks.length,
      completed,
      percentage:
        memberTasks.length > 0 ? (completed / memberTasks.length) * 100 : 0,
    };
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
    const result = await assignTask(projectId, formData);
    setIsLoading(false);

    if (result.error) alert(`Error: ${result.error}`);
    else setIsTaskModalOpen(false);
  };

  const handleEditTaskSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask) return;
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    
    const updates = {
      title: formData.get("title"),
      assigned_to: formData.get("assignedTo"),
      due_date: formData.get("dueDate"),
      cost: formData.get("cost") ? Number(formData.get("cost")) : 0,
    };

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', editingTask.id);

    setIsLoading(false);

    if (error) {
      alert(`Error updating task: ${error.message}`);
    } else {
      setIsEditModalOpen(false);
      setEditingTask(null);
    }
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[450px] sm:h-[500px] lg:h-[550px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Task management</h2>

          {isProjectLead && (
            <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
              <DialogTrigger asChild>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold transition-colors">
                  <Plus className="w-4 h-4" /> Assign Task
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Assign New Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleAssignTask} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">
                      Task Title
                    </label>
                    <input
                      name="title"
                      required
                      placeholder="e.g., Site Assessment Report"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">
                      Assign To
                    </label>
                    <select
                      name="assignedTo"
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                    >
                      <option value="">Select a project member...</option>
                      {localMembers.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">
                        Budget Cost (Optional)
                      </label>
                      <input
                        type="number"
                        name="cost"
                        placeholder="0.00"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Create Task"
                    )}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Task Details</DialogTitle>
              </DialogHeader>

              {editingTask && (
                <form onSubmit={handleEditTaskSubmit} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">
                      Task Title
                    </label>
                    <input
                      name="title"
                      defaultValue={editingTask.title}
                      required
                      placeholder="e.g., Site Assessment Report"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">
                      Assign To
                    </label>
                    <select
                      name="assignedTo"
                      defaultValue={editingTask.assigned_to}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                    >
                      <option value="">Select a project member...</option>
                      {localMembers.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        defaultValue={editingTask.rawDueDate ? new Date(editingTask.rawDueDate).toISOString().split('T')[0] : ""}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">
                        Budget Cost (Optional)
                      </label>
                      <input
                        type="number"
                        name="cost"
                        defaultValue={editingTask.cost}
                        placeholder="0.00"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar">
          {localTasks.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 px-4 mt-2">
              <p className="text-sm text-gray-500">
                No tasks assigned yet. {isProjectLead && 'Click "Assign Task" to start.'}
              </p>
            </div>
          ) : (
            localTasks.map((task: any) => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors gap-3 sm:gap-4 bg-white"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 truncate">
                    {task.title}
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 shrink-0" /> {task.assignee}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Calendar className="w-3.5 h-3.5" /> Due: {task.dueDate}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 mt-2 sm:mt-0">
                  {task.status === "Awaiting Review" && isProjectLead && (
                    <button
                      onClick={() => handleApproveTask(task.id)}
                      className="text-[11px] bg-[#153B44] text-white px-3 py-1.5 rounded-lg hover:bg-[#1B4B57] transition-colors font-semibold shadow-sm"
                    >
                      Approve
                    </button>
                  )}
                  <span
                    className={`px-3 py-1.5 sm:py-1 rounded-full text-xs font-bold w-fit capitalize text-center ${getStatusStyles(task.status)}`}
                  >
                    {task.status.replace("-", " ")}
                  </span>

                  {isProjectLead && (
                    <div className="flex items-center gap-1 border-l border-gray-200 pl-2 sm:pl-3 ml-1">
                      <button 
                        onClick={() => openEditModal(task)}
                        title="Edit Task"
                        className="p-1.5 text-gray-400 hover:text-[#1B4332] rounded-md hover:bg-green-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete Task"
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
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
                <DialogHeader>
                  <DialogTitle>Add Officer to Project</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleAddMember} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">
                      Select Officer
                    </label>
                    <select
                      name="profileId"
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                    >
                      <option value="">Select from Council...</option>
                      {availablePMs
                        .filter(
                          (pm: any) =>
                            !localMembers.find((m: any) => m.id === pm.id),
                        )
                        .map((pm: any) => (
                          <option key={pm.id} value={pm.id}>
                            {pm.full_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70 transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Add to Project"
                    )}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {localMembers.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-1 lg:col-span-2 py-4">
              No members assigned yet.
            </p>
          ) : (
            localMembers.map((m: any) => {
              const stats = getMemberStats(m.id);
              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-red-400 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {m.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight truncate">
                        {m.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{m.role}</p>
                    </div>
                  </div>
                  <div className="w-full sm:text-right sm:w-32 shrink-0">
                    <p className="text-[10px] font-bold text-gray-500 mb-1.5">
                      Tasks {stats.completed}/{stats.total} completed
                    </p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#52B788] rounded-full transition-all"
                        style={{ width: `${stats.percentage}%` }}
                      />
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