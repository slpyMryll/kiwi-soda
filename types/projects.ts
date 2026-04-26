export type ProjectStatus = "Ongoing" | "Completed";
export type LiveSatus = "Live" | "Draft";
export type MilestoneStatus = "Proposed" | "Approved" | "In Execution" | "Completed" | "Pending";

export interface ProjectMilestone {
  id: string;
  title: string;
  dateString: string;
  status: MilestoneStatus;
}

export interface ProjectBudgetUpdate {
  id: string;
  date: string;
  amountChange: number; 
  description: string;
  updatedBy: string;
  oldTotal: number;
  newTotal: number;
  isInitial?: boolean;
}

export interface Project {
  id: string;
  termId?: string;
  managerId?: string;
  title: string;
  description: string;
  location: string;
  postedAt: string;
  imageUrl?: string;
  tags: string[];
  progress: number;
  commentsCount: number;
  isFollowing: boolean;
  isGuest?: boolean;
  comments?: ProjectComment[];
  //Project Manager Role
  status: ProjectStatus;
  liveStatus: LiveSatus;
  totalBudget: number;
  spentBudget: number;
  membersCount: number;
  deadline: Date;

  milestones?: ProjectMilestone[];
  budgetUpdates?: ProjectBudgetUpdate[];

  members?: any[]; 
  tasks?: any[];
  created_at: Date;
  updated_at: Date;
}

export interface ProjectCardProps {
    project: Project;
    userRole?: 'admin' | 'project-manager' | 'viewer' | 'guest';
    onReadMore?: () => void;
}

export interface ProjectComment {
  id: string;
  user_id?: string;
  content: string;
  created_at: string | Date;
  parent_id: string | null;
  is_hidden?: boolean;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  } | null;
}