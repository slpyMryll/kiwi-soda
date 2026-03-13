import { createClient } from "@/lib/supabase/server";
import PmProjectsClient from "./PmProjectsClient";
import { Project } from "@/types/projects";

export default async function PmProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      project_members (count),
      comments (count)
    `,
    )
    .eq("manager_id", user?.id)
    .order("created_at", { ascending: false });

  const projects: Project[] =
    data?.map((p: any) => ({
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
      deadline: p.deadline,
      postedAt: p.posted_at || p.created_at,
      created_at: p.created_at,
      updated_at: p.updated_at,
      membersCount: p.project_members?.[0]?.count || 0,
      commentsCount: p.comments?.[0]?.count || 0,
      isFollowing: false,
    })) || [];

  return <PmProjectsClient projects={projects} />;
}
