"use client";

import { useState } from "react";
import { CheckCircle2, PhilippinePeso, Users, Clock } from "lucide-react";
import { ProjectManageHeader } from "@/app/components/projects/manage/ProjectManagerHeader";
import { OverviewTab } from "@/app/components/projects/manage/tabs/OveviewTab";
import { TasksAndTeamTab } from "@/app/components/projects/manage/tabs/TasksAndTeamTab";
import { BudgetTab } from "@/app/components/projects/manage/tabs/BudgetTab";
import { TimelineTab } from "@/app/components/projects/manage/tabs/TimelineTab";
import { DocumentsTab } from "@/app/components/projects/manage/tabs/DocumentsTab";
import { ChartsTab } from "@/app/components/projects/manage/tabs/ChartsTab";

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
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

  const stats = [
    {
      label: "Progress",
      value: `${project.progress}%`,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      label: "Budget Spent",
      value: `${(project.spentBudget / 1000).toFixed(1)}k`,
      icon: PhilippinePeso,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      label: "Team Members",
      value: project.membersCount,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
    {
      label: "Pending Tasks",
      value:
        project.tasks?.filter((t: any) => t.status !== "Completed").length || 0,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <ProjectManageHeader project={project} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
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
            className={`flex-1 min-w-[120px] py-2.5 text-sm font-bold rounded-xl transition-all ${
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
          />
        )}
        {activeTab === "Budget" && <BudgetTab project={project} />}
        {activeTab === "Timeline" && (
          <TimelineTab projectId={project.id} milestones={project.milestones} />
        )}
        {activeTab === "Documents" && <DocumentsTab />}
        {activeTab === "Charts" && <ChartsTab />}
      </div>
    </div>
  );
}
