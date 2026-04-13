import { createClient } from "@/lib/supabase/server";
import { ProjectDetailView } from "@/app/components/projects/ProjectDetailView";
import { notFound } from "next/navigation";
import { Project } from "@/types/projects";
import { getProjectTeamWithOfficerRoles } from "@/lib/actions/project";

export default async function ViewerProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; 
}) {
  const { id } = await params; 
  if (!id) return notFound();

  const supabase = await createClient();
  const userPromise = supabase.auth.getUser();

  const projectPromise = supabase
    .from("projects")
    .select(
      `
      id, title, description, location, status, live_status, image_url, posted_at, created_at, 
      total_budget, spent_budget, progress, deadline, tags, manager_id, term_id,
      project_milestones ( id, title, end_date, status, progress ),
      budget_logs ( id, budget_change_reason, changed_at, new_amount, old_amount, is_initial, status, profiles:changed_by ( full_name ) ),
      comments ( id, content, created_at, parent_id, profiles ( full_name, avatar_url ) )
    `
    )
    .eq("id", id)
    .eq("live_status", "Live")
    .maybeSingle();

  const [
    {
      data: { user },
    },
    { data: projectData, error },
  ] = await Promise.all([userPromise, projectPromise]);

  if (error || !projectData) return notFound();

  let userRole: any = "viewer";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile) userRole = profile.role;
  }

  let isFollowing = false;
  if (user) {
    const { data: followData } = await supabase
      .from("project_followers")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectData.id)
      .maybeSingle(); 

    isFollowing = !!followData;
  }

  const teamMembers = await getProjectTeamWithOfficerRoles(projectData.id, projectData.term_id);

  const project: Project = {
    ...projectData,
    id: projectData.id,
    title: projectData.title,
    description: projectData.description,
    location: projectData.location || "VSU Campus",
    status: projectData.status || "Ongoing",
    liveStatus: projectData.live_status,
    imageUrl: projectData.image_url || "/project-card-place.webp",
    postedAt: projectData.posted_at || projectData.created_at,
    totalBudget: Number(projectData.total_budget || 0),
    spentBudget: Number(projectData.spent_budget || 0),
    progress: projectData.progress || 0,
    tags: projectData.tags || [],
    comments: (projectData.comments || []).map((c: any) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      parent_id: c.parent_id,
      profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
    })),
    commentsCount: projectData.comments?.length || 0,
    membersCount: teamMembers.length,
    members: teamMembers,
    isFollowing, 
    deadline: new Date(projectData.deadline),
    created_at: new Date(projectData.created_at),
    updated_at: new Date(),

    milestones: (projectData.project_milestones || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      dateString: m.end_date
        ? new Date(m.end_date).toLocaleDateString()
        : "No deadline",
      status: m.status || "Pending",
      progress: m.progress || 0,
    })),

    budgetUpdates: (projectData.budget_logs || [])
      .map((log: any) => {
        const rawReason = log.budget_change_reason || "";
        const parts = rawReason.split(":");
        const changedAt = log.changed_at ? new Date(log.changed_at) : new Date();

        return {
          id: log.id,
          rawDate: changedAt.getTime(),
          date: changedAt.toLocaleString(),
          amountChange: (log.new_amount || 0) - (log.old_amount || 0),
          category: parts.length > 1 ? parts[0].trim() : "General",
          description: parts.length > 1 ? parts.slice(1).join(":").trim() : rawReason,
          updatedBy: log.profiles?.full_name || "System",
          oldTotal: log.old_amount || 0,
          newTotal: log.new_amount || 0,
          isInitial: log.is_initial || false,
          status: log.status || 'Approved',
        };
      })
      .sort((a: any, b: any) => b.rawDate - a.rawDate),
  };

  return (
    <div className="w-full h-full bg-bg-main relative">
      <ProjectDetailView project={project} userRole={userRole} isModal={false} />
    </div>
  );
}