export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue' | 'Awaiting Review';
export type PmProjectStatus = 'Ongoing' | 'Completed' | 'Pending';

export interface SidebarTask {
  id: string;
  name: string;
  status: TaskStatus;
  dueDate: string; 
}

export interface PmProjectData {
  id: string;
  title: string;
  status: PmProjectStatus;
  isLive: boolean;
  progress: number;
  projectLead: string;
  members: string;
  deadline: string;
  budget: string;
}

export interface ProjectsWorkedDataPoint {
  name: string;
  value: number;
  color: string;
}