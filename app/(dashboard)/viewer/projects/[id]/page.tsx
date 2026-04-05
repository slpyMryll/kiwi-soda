import { createClient } from "@/lib/supabase/server";
import { ProjectDetailView } from "@/app/components/projects/ProjectDetailView";
import { notFound } from "next/navigation";
import { Project } from "@/types/projects";

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
      total_budget, spent_budget, progress, deadline, tags, manager_id,
      project_members ( profile_id, project_role, profiles ( full_name, avatar_url ) ),
      project_milestones ( id, title, end_date, status, progress ),
      budget_logs ( id, budget_change_reason, changed_at, new_amount, old_amount, is_initial, profiles:changed_by ( full_name ) ),
      comments ( id, content, created_at, parent_id, profiles ( full_name, avatar_url ) )
    `,
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

  let managerProfile = null;
  if (projectData.manager_id) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", projectData.manager_id)
      .single();
    managerProfile = data;
  }

  let userRole: any = "viewer";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile) userRole = profile.role;
  }

  const teamMembers: any[] = [];

  if (managerProfile) {
    teamMembers.push({
      id: projectData.manager_id,
      name: managerProfile.full_name || "Unknown Manager",
      role: "Project Manager",
      avatarUrl: managerProfile.avatar_url || null,
    });
  }

  const safeMembers = Array.isArray(projectData.project_members)
    ? projectData.project_members
    : [];
  safeMembers.forEach((m: any) => {
    if (m.profile_id !== projectData.manager_id) {
      teamMembers.push({
        id: m.profile_id || Math.random().toString(),
        name: m.profiles?.full_name || "Unknown Officer",
        role: m.project_role || "Member",
        avatarUrl: m.profiles?.avatar_url || null,
      });
    }
  });

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
    isFollowing: false,
    deadline: new Date(projectData.deadline),
    created_at: new Date(projectData.created_at),
    updated_at: new Date(),
    members: teamMembers,

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
        const parts = (log.budget_change_reason || "").split(":");
        return {
          id: log.id,
          date: log.changed_at
            ? new Date(log.changed_at).toLocaleDateString()
            : "Unknown Date",
          amountChange: (log.new_amount || 0) - (log.old_amount || 0),
          description:
            parts.length > 1
              ? parts[1].trim()
              : log.budget_change_reason || "No description",
          updatedBy: log.profiles?.full_name || "System",
          oldTotal: log.old_amount || 0,
          newTotal: log.new_amount || 0,
          isInitial: log.is_initial,
        };
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
  };

  return (
    <div className="w-full h-full bg-bg-main relative">
      <ProjectDetailView
        project={project}
        userRole={userRole}
        isModal={false}
      />
    </div>
  );
}