import { SidebarTask, PmProjectData, ProjectsWorkedDataPoint } from "@/types/pm";

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const MOCK_SIDEBAR_TASKS: SidebarTask[] = [
  { id: "1", name: "Achievement Plan", status: "Pending", dueDate: today.toISOString() },
  { id: "2", name: "Designing Graphics", status: "In Progress", dueDate: today.toISOString() },
  { id: "3", name: "Financial budget proposal", status: "Completed", dueDate: tomorrow.toISOString() },
];

export const MOCK_PM_PROJECTS: PmProjectData[] = [
  {
    id: "1",
    title: "Protect Project Nature 2026",
    status: "Ongoing",
    isLive: true,
    progress: 67,
    projectLead: "Php 50,000",
    members: "8/14",
    deadline: "April 20 2026",
    budget: "34,560/50,000"
  },
  {
    id: "2",
    title: "Digital Student ID System",
    status: "Pending",
    isLive: false,
    progress: 45,
    projectLead: "Php 120,000",
    members: "12/15",
    deadline: "Dec 15 2026",
    budget: "45,000/120,000"
  }
];

export const MOCK_PROJECTS_WORKED_DATA: ProjectsWorkedDataPoint[] = [
  { name: "Campus Week 2024", value: 55, color: "#8B5CF6" },
  { name: "Protect Project Nature", value: 67, color: "#FCA5A5" },
  { name: "VSU Anniversary 2024", value: 51, color: "#67E8F9" },
  { name: "Students Night 2024", value: 42, color: "#FDBA74" },
];