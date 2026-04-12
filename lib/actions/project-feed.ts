"use server";

import { createClient } from "@/lib/supabase/server";
import { Project } from "@/types/projects";

const LIMIT = 5;

export async function getInfiniteProjects({
  page = 1,
  q = "",
  status = "all",
  sort = "newest",
  termId = "",
  followingOnly = false, // new flag
}: {
  page?: number;
  q?: string;
  status?: string;
  sort?: string;
  termId?: string;
  followingOnly?: boolean;
}) {
  const supabase = await createClient();

   const {
    data: { user },
  } = await supabase.auth.getUser();

  let followedIds: string[] = [];
  if (user) {
    const { data: followData } = await supabase
      .from("project_followers")
      .select("project_id")
      .eq("user_id", user.id);
    followedIds = followData?.map(f => f.project_id) || [];
  }
    if (followingOnly && followedIds.length === 0) {
    return { projects: [], hasMore: false };
  }


  let query = supabase
    .from("projects")
    .select(`
      id, title, description, location, status, live_status, image_url, posted_at, created_at, updated_at,
      total_budget, spent_budget, progress, deadline, tags, manager_id, term_id,
      project_members ( 
        profile_id, 
        project_role, 
        profiles ( 
          full_name, 
          avatar_url,
          officers ( term_id, position ) 
        ) 
      ),
      project_milestones ( id, title, end_date, status, progress ),
      budget_logs ( id, budget_change_reason, changed_at, new_amount, old_amount, is_initial, status, profiles:changed_by ( full_name ) ),
      comments ( count )
    `)
    .eq('live_status', 'Live');
  
    if (followingOnly) {
                query = query.in("id", followedIds);
              }

  if (termId) query = query.eq('term_id', termId);
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

  const processedProjects: Project[] = rawProjects.map((projectData: any) => {
    const safeMembers = Array.isArray(projectData.project_members) ? projectData.project_members : [];
    const teamMembers = safeMembers.map((m: any) => {
      const officerRecord = m.profiles?.officers?.find((o: any) => o.term_id === projectData.term_id);
      const officerPosition = officerRecord ? officerRecord.position : "USSC Member";
      
      const displayRole = m.project_role === "Project Lead" 
        ? `Project Lead / ${officerPosition}` 
        : officerPosition;

      return {
        id: m.profile_id || Math.random().toString(),
        name: m.profiles?.full_name || "Unknown Officer",
        role: displayRole,
        avatarUrl: m.profiles?.avatar_url || null
      };
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
      isFollowing: followedIds.includes(projectData.id),
      deadline: new Date(projectData.deadline),
      created_at: new Date(projectData.created_at),
      updated_at: new Date(projectData.updated_at),
      members: teamMembers, 
      milestones: (projectData.project_milestones || []).map((m: any) => ({
        id: m.id, title: m.title, dateString: m.end_date ? new Date(m.end_date).toLocaleDateString() : 'No deadline', status: m.status || "Pending", progress: m.progress || 0
      })),
      budgetUpdates: (projectData.budget_logs || []).map((log: any) => {
        const reason = log.budget_change_reason || "";
        const parts = reason.split(":");
        const changedAt = log.changed_at ? new Date(log.changed_at) : new Date();
        return {
          id: log.id, 
          rawDate: changedAt.getTime(),
          date: changedAt.toLocaleString(), 
          amountChange: (log.new_amount || 0) - (log.old_amount || 0), 
          category: parts.length > 1 ? parts[0].trim() : "General",
          description: parts.length > 1 ? parts.slice(1).join(":").trim() : reason, 
          updatedBy: log.profiles?.full_name || "System", 
          oldTotal: log.old_amount || 0, 
          newTotal: log.new_amount || 0, 
          isInitial: log.is_initial || false,
          status: log.status || 'Approved'
        };
      }).sort((a: any, b: any) => b.rawDate - a.rawDate)
    };
  });

  return { projects: processedProjects, hasMore: rawProjects.length === LIMIT };
}

export async function getSingleProjectForFeed(projectId: string): Promise<Project | null> {
  const supabase = await createClient();

  const { data: projectData, error } = await supabase
    .from("projects")
    .select(`
      id, title, description, location, status, live_status, image_url, posted_at, created_at, updated_at,
      total_budget, spent_budget, progress, deadline, tags, manager_id, term_id,
      project_members ( 
        profile_id, 
        project_role, 
        profiles ( 
          full_name, 
          avatar_url,
          officers ( term_id, position )
        ) 
      ),
      project_milestones ( id, title, end_date, status, progress ),
      budget_logs ( id, budget_change_reason, changed_at, new_amount, old_amount, is_initial, status, profiles:changed_by ( full_name ) ),
      comments ( count )
    `)
    .eq('id', projectId)
    .single();

  if (error || !projectData) return null;

  const safeMembers = Array.isArray(projectData.project_members) ? projectData.project_members : [];
  const teamMembers = safeMembers.map((m: any) => {
    const officerRecord = m.profiles?.officers?.find((o: any) => o.term_id === projectData.term_id);
    const officerPosition = officerRecord ? officerRecord.position : "USSC Member";
    const displayRole = m.project_role === "Project Lead" ? `Project Lead / ${officerPosition}` : officerPosition;

    return {
      id: m.profile_id || Math.random().toString(),
      name: m.profiles?.full_name || "Unknown Officer",
      role: displayRole,
      avatarUrl: m.profiles?.avatar_url || null
    };
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
      const reason = log.budget_change_reason || "";
      const parts = reason.split(":");
      const changedAt = log.changed_at ? new Date(log.changed_at) : new Date();
      return {
        id: log.id, 
        rawDate: changedAt.getTime(),
        date: changedAt.toLocaleString(), 
        amountChange: (log.new_amount || 0) - (log.old_amount || 0), 
        category: parts.length > 1 ? parts[0].trim() : "General",
        description: parts.length > 1 ? parts.slice(1).join(":").trim() : reason, 
        updatedBy: log.profiles?.full_name || "System", 
        oldTotal: log.old_amount || 0, 
        newTotal: log.new_amount || 0, 
        isInitial: log.is_initial || false,
        status: log.status || 'Approved'
      };
    }).sort((a: any, b: any) => b.rawDate - a.rawDate)
  };
}