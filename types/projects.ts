export type ProjectStatus = "Active" | "Archived" | "Completed";
export type LiveSatus = "Live" | "Draft";

export interface Project {
  id: string;
  title: string;
  description: string;
  postedAt: string;
  imageUrl?: string;
  tags: string[];
  progress: number;
  commentsCount: number;
  isFollowing: boolean;
  isGuest?: boolean;
  //Project Manager Role
  status: ProjectStatus;
  liveStatus: LiveSatus;
  totalBudget: number;
  spentBudget: number;
  membersCount: number;
  deadline: Date;

  created_at: Date;
  updated_at: Date;
}

export interface ProjectCardProps {
    project: Project;
    userRole?: 'admin' | 'project-manager' | 'viewer' | 'guest';
}