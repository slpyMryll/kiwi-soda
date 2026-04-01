"use client";

import { useState } from "react";
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Calendar,
  FolderKanban,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  projectName: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed";
}

const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Review Q3 Budget Proposal",
    projectName: "Campus Renovation",
    dueDate: "2026-04-05",
    status: "Pending",
  },
  {
    id: "2",
    title: "Approve vendor contracts",
    projectName: "Tech Symposium 2026",
    dueDate: "2026-04-02",
    status: "In Progress",
  },
  {
    id: "3",
    title: "Finalize event schedule",
    projectName: "Tech Symposium 2026",
    dueDate: "2026-03-28",
    status: "Completed",
  },
  {
    id: "4",
    title: "Draft safety guidelines",
    projectName: "Campus Renovation",
    dueDate: "2026-04-10",
    status: "Pending",
  },
  {
    id: "5",
    title: "Publish marketing materials",
    projectName: "Alumni Homecoming",
    dueDate: "2026-04-15",
    status: "Pending",
  },
];

export function PmTasksClient() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: task.status === "Completed" ? "Pending" : "Completed",
          };
        }
        return task;
      }),
    );

  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.projectName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-[#F3E9AD] text-[#857A3D]";
      case "Completed":
        return "bg-[#C4E7D4] text-[#4A7C5F]";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#153B44] tracking-tight">
            My Tasks
          </h1>
          <p className="text-sm sm:text-[15px] text-gray-500 mt-1">
            Manage your assigned duties and project deliverables.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
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
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-all flex-1 sm:flex-none flex justify-center",
                viewMode === "list"
                  ? "bg-gray-100 text-[#153B44] shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              )}
              aria-label="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-all flex-1 sm:flex-none flex justify-center",
                viewMode === "grid"
                  ? "bg-gray-100 text-[#153B44] shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              )}
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <CheckCircle2 className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-[#153B44]">All caught up!</h3>
          <p className="text-sm text-gray-500">
            No tasks match your current criteria.
          </p>
        </div>
      ) : viewMode === "list" ? (
        // LIST VIEW
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider w-12 text-center">
                    Done
                  </th>
                  <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                    Task Details
                  </th>
                  <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Project
                  </th>
                  <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Due Date
                  </th>
                  <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right pr-6">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTasks.map((task) => {
                  const isCompleted = task.status === "Completed";
                  return (
                    <tr
                      key={task.id}
                      className={cn(
                        "hover:bg-gray-50/50 transition-colors group",
                        isCompleted ? "bg-gray-50/30" : "",
                      )}
                    >
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleTaskCompletion(task.id)}
                          className="outline-none focus:ring-2 focus:ring-[#153B44]/20 rounded-full"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-[#4A7C5F] hover:text-[#386049] transition-colors" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 hover:text-[#153B44] transition-colors" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <p
                          className={cn(
                            "text-sm font-medium transition-all duration-200",
                            isCompleted
                              ? "text-gray-400 line-through"
                              : "text-[#153B44]",
                          )}
                        >
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 sm:hidden">
                          <span className="flex items-center gap-1 text-[11px] text-gray-500">
                            <FolderKanban className="w-3 h-3" />{" "}
                            {task.projectName}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Calendar className="w-3 h-3" />{" "}
                            {new Date(task.dueDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600">
                          <FolderKanban className="w-3.5 h-3.5 text-gray-400" />
                          {task.projectName}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(task.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <span
                          className={cn(
                            "text-[11px] px-2.5 py-1 rounded-full font-medium shadow-sm whitespace-nowrap",
                            getStatusBadge(task.status),
                          )}
                        >
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // GRID VIEW
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === "Completed";
            return (
              <div
                key={task.id}
                className={cn(
                  "bg-white rounded-xl p-5 border shadow-sm transition-all duration-200 relative group flex flex-col h-full",
                  isCompleted
                    ? "border-transparent bg-gray-50/50"
                    : "border-gray-200 hover:border-[#153B44]/30 hover:shadow-md",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm",
                      getStatusBadge(task.status),
                    )}
                  >
                    {task.status}
                  </span>
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="outline-none focus:ring-2 focus:ring-[#153B44]/20 rounded-full shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-[#4A7C5F] hover:text-[#386049] transition-colors" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 group-hover:text-gray-400 hover:!text-[#153B44] transition-colors" />
                    )}
                  </button>
                </div>

                <div className="flex-1">
                  <h3
                    className={cn(
                      "text-base font-semibold leading-snug transition-all duration-200 mb-3",
                      isCompleted
                        ? "text-gray-400 line-through"
                        : "text-[#153B44]",
                    )}
                  >
                    {task.title}
                  </h3>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FolderKanban className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{task.projectName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
