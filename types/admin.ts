export interface AdminStat {
  title: string;
  value: number | string;
}

export interface ReportDataPoint {
  date: string;
  reports: number;
}

export interface UserRoleDataPoint {
  role: string;
  count: number;
}

export interface ActiveUser {
  id: string;
  name: string;
  status: 'Online' | 'Offline';
}