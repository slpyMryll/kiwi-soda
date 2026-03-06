import { ReportDataPoint, UserRoleDataPoint, ActiveUser, AdminStat } from "@/types/admin";

export const MOCK_ADMIN_STATS: AdminStat[] = [
  { title: "Total Users", value: 25 },
  { title: "Active Sessions", value: 25 },
  { title: "New Signups Today", value: 3 },
  { title: "Total Reports", value: 25 },
];

export const MOCK_SYSTEM_REPORTS: ReportDataPoint[] = [
  { date: "Jan 1", reports: 0 },
  { date: "Jan 2", reports: 6 },
  { date: "Jan 3", reports: 12 },
  { date: "Jan 4", reports: 21 },
  { date: "Jan 5", reports: 17 },
  { date: "Jan 6", reports: 15 },
  { date: "Jan 7", reports: 20 },
  { date: "Jan 8", reports: 16 },
  { date: "Jan 9", reports: 13 },
  { date: "Jan 10", reports: 10 },
  { date: "Jan 11", reports: 5 },
];

export const MOCK_USER_ACTIVITY: UserRoleDataPoint[] = [
  { role: "Project Manager", count: 17 },
  { role: "Viewer", count: 45 },
];

export const MOCK_ACTIVE_USERS: ActiveUser[] = [
  { id: "1", name: "Juan Dela Cruz", status: "Online" },
  { id: "2", name: "Juan Dela Cruz", status: "Online" },
];