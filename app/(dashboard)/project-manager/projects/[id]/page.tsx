import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectDetailClient from "./ProjectDetailClient";

export default async function ManageProjectPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  
  const resolvedSearchParams = await searchParams;
  const tabParam = typeof resolvedSearchParams.tab === 'string' ? resolvedSearchParams.tab : "Overview";
  
  const validTabs = ["Overview", "Tasks & Team", "Budget", "Timeline", "Documents", "Charts"];
  const initialTab = validTabs.includes(tabParam) ? tabParam : "Overview";

  const supabase = await createClient();
  
  const { data: availablePMs } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('role', 'project-manager');

  const { data: projectData, error } = await supabase
    .from("projects")
    .select(`
      *,
      project_members ( profile_id, project_role, profiles ( full_name, avatar_url ) ),
      tasks ( *, profiles ( full_name ) ),
      budget_logs ( * ),
      project_milestones ( * )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Supabase Fetch Error:", error.message);
  }

  if (error || !projectData) return notFound();

  const project: any = {
    ...projectData,
    totalBudget: Number(projectData.total_budget),
    spentBudget: Number(projectData.spent_budget),
    membersCount: projectData.project_members?.length || 0,
    
    members: projectData.project_members?.map((m: any) => ({
      id: m.profile_id,
      name: m.profiles?.full_name || "Unknown Officer",
      role: m.project_role || "Member",
      avatarUrl: m.profiles?.avatar_url
    })) || [],

    tasks: projectData.tasks?.map((t: any) => ({
      id: t.id,
      title: t.title,
      assignee: t.profiles?.full_name || "Unassigned",
      assigned_to: t.assigned_to,
      dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A',
      status: t.status,
      cost: t.cost
    })) || [],

    milestones: projectData.project_milestones?.map((m: any) => ({
      id: m.id,
      title: m.title,
      deadline: m.end_date ? new Date(m.end_date).toLocaleDateString() : 'No deadline',
      status: m.status,
      progress: m.progress
    })) || [],

    budgetUpdates: projectData.budget_logs?.map((log: any) => {
      const parts = (log.budget_change_reason || "").split(":");
      return {
        id: log.id,
        date: new Date(log.changed_at).toLocaleString(),
        amountChange: log.new_amount - log.old_amount,
        category: parts.length > 1 ? parts[0] : "General",
        description: parts.length > 1 ? parts[1].trim() : log.budget_change_reason,
        oldTotal: log.old_amount,
        newTotal: log.new_amount,
        isInitial: log.is_initial
      };
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) || []
  };

  return <ProjectDetailClient project={project} availablePMs={availablePMs || []} initialTab={initialTab} />;
}