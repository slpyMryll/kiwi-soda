"use server";

import { createClient } from "@/lib/supabase/server";
import { Project } from "@/types/projects";

const LIMIT = 5;

export async function getInfiniteProjects({
  page = 1,
  q = "",
  status = "all",
  sort = "newest"
}) {
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select(`
      id, title, description, location, status, live_status, image_url, posted_at, created_at, updated_at,
      total_budget, spent_budget, progress, deadline, tags, manager_id,
      project_members ( profile_id, project_role, profiles ( full_name, avatar_url ) ),
      project_milestones ( id, title, end_date, status, progress ),
      budget_logs ( id, budget_change_reason, changed_at, new_amount, old_amount, is_initial, profiles:changed_by ( full_name ) ),
      comments ( count )
    `)
    .eq('live_status', 'Live');

  if (q) query = query.ilike("title", `%${q}%`);
  if (status !== "all") query = query.eq("status", status === "ongoing" ? "Ongoing" : "Completed");

  if (sort === "newest") query = query.order("created_at", { ascending: false });
  else if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else if (sort === "a-z") query = query.order("title", { ascending: true });
  else if (sort === "z-a") query = query.order("title", { ascending: false });

  const from = (page - 1) * LIMIT;
  const to = from + LIMIT - 1;

  const { data: rawProjects, error } = await query.range(from, to);

  if (error || !rawProjects) return { projects: [], hasMore: false };

  const managerIds = Array.from(new Set(rawProjects.map((p: any) => p.manager_id).filter(Boolean)));
  const { data: managers } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', managerIds);
  const managerMap = new Map(managers?.map((m: any) => [m.id, m]));

  const processedProjects: Project[] = rawProjects.map((projectData: any) => {
    const teamMembers: any[] = [];
    const managerProfile = managerMap.get(projectData.manager_id);
    
    if (managerProfile) {
      teamMembers.push({
        id: projectData.manager_id,
        name: managerProfile.full_name || "Unknown Manager",
        role: "Project Manager",
        avatarUrl: managerProfile.avatar_url || null
      });
    }

    const safeMembers = Array.isArray(projectData.project_members) ? projectData.project_members : [];
    safeMembers.forEach((m: any) => {
      if (m.profile_id !== projectData.manager_id) {
        teamMembers.push({
          id: m.profile_id || Math.random().toString(),
          name: m.profiles?.full_name || "Unknown Officer",
          role: m.project_role || "Member",
          avatarUrl: m.profiles?.avatar_url || null
        });
      }
    });

    return {
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
      commentsCount: projectData.comments?.[0]?.count || 0,
      membersCount: teamMembers.length,
      isFollowing: false, 
      deadline: new Date(projectData.deadline),
      created_at: new Date(projectData.created_at),
      updated_at: new Date(projectData.updated_at),
      members: teamMembers, 
      milestones: (projectData.project_milestones || []).map((m: any) => ({
        id: m.id, title: m.title, dateString: m.end_date ? new Date(m.end_date).toLocaleDateString() : 'No deadline', status: m.status || "Pending", progress: m.progress || 0
      })),
      budgetUpdates: (projectData.budget_logs || []).map((log: any) => {
        const parts = (log.budget_change_reason || "").split(":");
        return {
          id: log.id, date: log.changed_at ? new Date(log.changed_at).toLocaleDateString() : 'Unknown Date', amountChange: (log.new_amount || 0) - (log.old_amount || 0), description: parts.length > 1 ? parts[1].trim() : (log.budget_change_reason || "No description"), updatedBy: log.profiles?.full_name || "System", oldTotal: log.old_amount || 0, newTotal: log.new_amount || 0, isInitial: log.is_initial
        };
      }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  });

  return {
    projects: processedProjects,
    hasMore: rawProjects.length === LIMIT
  };
}