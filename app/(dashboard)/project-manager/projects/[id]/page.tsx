import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectDetailClient from "./ProjectDetailClient";
import { getProjectTeamWithOfficerRoles } from "@/lib/actions/project";

export const metadata = {
  title: "PM Projects - OnTrack",
  description: "View and manage your projects in one place. Track progress, deadlines, and team collaboration with ease.",
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      timeZone: 'Asia/Manila'
    }).format(new Date(dateStr));
  } catch (e) { return "Invalid Date"; }
};

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "Unknown Date";
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Asia/Manila'
    }).format(new Date(dateStr));
  } catch (e) { return "Invalid Date"; }
};

export default async function ManageProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let id = "";
  try {
    const resolvedParams = await params;
    id = resolvedParams?.id || "";
  } catch (e) {
    return notFound();
  }

  if (!id) return notFound();

  let initialTab = "Overview";
  try {
    const resolvedSearchParams = await searchParams;
    const tabParam = resolvedSearchParams?.tab;
    const validTabs = ["Overview", "Tasks & Team", "Budget", "Timeline", "Documents", "Charts", "Feedback"];
    if (typeof tabParam === "string" && validTabs.includes(tabParam)) {
      initialTab = tabParam;
    }
  } catch (e) {}

  const supabase = await createClient();

  const pmsPromise = supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("role", "project-manager");

  const projectPromise = supabase
    .from("projects")
    .select(
      `
      id, manager_id, term_id, title, description, location, status, live_status, image_url, posted_at, created_at, total_budget, spent_budget, progress, deadline, tags,
      tasks ( id, title, assigned_to, due_date, status, cost, profiles ( full_name ) ),
      budget_logs ( id, budget_change_reason, changed_at, new_amount, old_amount, is_initial, status, profiles:changed_by ( full_name ) ),
      project_milestones ( id, title, end_date, status, progress ),
      project_documents ( id, name, file_url, file_size, file_type, is_pinned, created_at, profiles:uploaded_by ( full_name ) ),
      comments ( id, user_id, content, created_at, parent_id, profiles ( full_name, avatar_url ) )
    `
    )
    .eq("id", id)
    .maybeSingle();

  const [{ data: availablePMs }, { data: projectData, error }] =
    await Promise.all([pmsPromise, projectPromise]);
  
  if (error && error.code !== "PGRST116") {
    console.error("SUPABASE FETCH ERROR:", error.message);
  }
  
  if (!projectData) return notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isManager = projectData.manager_id === user?.id;
  
  const teamMembers = await getProjectTeamWithOfficerRoles(projectData.id, projectData.term_id);
  
  const safeTasks = Array.isArray(projectData?.tasks) ? projectData.tasks : [];
  const safeMilestones = Array.isArray(projectData?.project_milestones) ? projectData.project_milestones : [];
  const safeBudgetLogs = Array.isArray(projectData?.budget_logs) ? projectData.budget_logs : [];
  const safeDocuments = Array.isArray(projectData?.project_documents) ? projectData.project_documents : [];
  const safePMs = Array.isArray(availablePMs) ? availablePMs : [];

  const project: any = {
    ...projectData,
    isManager,
    currentUserId: user?.id,
    id: projectData.id,
    title: projectData.title || "Untitled Project",
    description: projectData.description || "",
    location: projectData.location || "VSU Campus",
    status: projectData.status || "Ongoing",
    liveStatus: projectData.live_status || "Draft",
    imageUrl: projectData.image_url || "/project-card-place.webp",
    postedAt: projectData.posted_at || projectData.created_at,
    totalBudget: Number(projectData.total_budget || 0),
    spentBudget: Number(projectData.spent_budget || 0),
    progress: projectData.progress || 0,
    deadline: projectData.deadline,
    tags: projectData.tags || [], 
    
    comments: (projectData.comments || []).map((c: any) => ({
      id: c.id,
      user_id: c.user_id,
      content: c.content,
      created_at: c.created_at,
      parent_id: c.parent_id,
      profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
    })),

    membersCount: teamMembers.length,
    members: teamMembers,

    tasks: safeTasks.map((t: any, index: number) => ({
      id: t?.id || `task-${index}`,
      title: t?.title || "Untitled Task",
      assignee: t?.profiles?.full_name || "Unassigned",
      assigned_to: t?.assigned_to || null,
      dueDate: formatDate(t?.due_date),
      rawDueDate: t?.due_date || "", 
      status: t?.status || "Pending",
      cost: t?.cost || 0,
    })),

    milestones: safeMilestones.map((m: any, index: number) => ({
      id: m?.id || `milestone-${index}`,
      title: m?.title || "Untitled Milestone",
      deadline: formatDate(m?.end_date),
      status: m?.status || "Pending",
      progress: m?.progress || 0,
    })),

    budgetUpdates: safeBudgetLogs.map((log: any, index: number) => {
      const parts = (log?.budget_change_reason || "").split(":");
      return {
        id: log?.id || `log-${index}`,
        date: formatDateTime(log?.changed_at),
        amountChange: (log?.new_amount || 0) - (log?.old_amount || 0),
        category: parts.length > 1 ? parts[0] : "General",
        description: parts.length > 1 ? parts[1].trim() : log?.budget_change_reason || "No description",
        updatedBy: log?.profiles?.full_name || "System",
        oldTotal: log?.old_amount || 0,
        newTotal: log?.new_amount || 0,
        isInitial: log?.is_initial || false,
        status: log?.status || 'Approved',
      };
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),

    documents: safeDocuments.map((d: any, index: number) => ({
      id: d?.id || `doc-${index}`,
      name: d?.name || "Untitled Document",
      url: d?.file_url || "#",
      size: d?.file_size || 0,
      type: d?.file_type || "unknown",
      uploadedBy: d?.profiles?.full_name || "Unknown",
      date: formatDate(d?.created_at),
      isPinned: d?.is_pinned || false,
    })).sort((a: any, b: any) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }),
  };

  return (
    <ProjectDetailClient project={project} availablePMs={safePMs} initialTab={initialTab} />
  );
}
