import { createClient } from "@/lib/supabase/server";
import { Project } from "@/types/projects";
import { PmDashboardClient } from "./PmDashboardClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "PM Dashboard - OnTrack",
  description: "Your central hub for managing projects, tracking progress, and overseeing team collaboration. Stay on top of deadlines, budgets, and project health all in one place.",
};

export default async function PmDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Parallelize all primary fetches
  const [projectData, tasksData, councilMembersResult] = await Promise.all([
    supabase
      .from("projects")
      .select(`*, project_members (count), comments (count)`)
      .eq("manager_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id, title, status, due_date")
      .eq("assigned_to", user.id),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "project-manager")
  ]);

  const initialProjects: Project[] =
    (projectData.data || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      location: p.location || "VSU Campus",
      imageUrl: p.image_url,
      tags: p.tags || [],
      status: p.status,
      liveStatus: p.live_status,
      totalBudget: Number(p.total_budget),
      spentBudget: Number(p.spent_budget),
      progress: p.progress,
      deadline: p.deadline ? new Date(p.deadline) : new Date(), 
      postedAt: p.posted_at || p.created_at,
      created_at: p.created_at,
      updated_at: p.updated_at,
      membersCount: p.project_members?.[0]?.count || 0,
      commentsCount: p.comments?.[0]?.count || 0,
      isFollowing: false,
    }));

  const councilMembersCount = councilMembersResult.count;

  return (
    <PmDashboardClient 
      initialProjects={initialProjects} 
      initialTasks={tasksData.data || []}
      councilMembersCount={councilMembersCount || 0}
      userId={user.id} 
    />
  );
}