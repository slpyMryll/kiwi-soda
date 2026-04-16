"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { recordActivity } from "./system";

export async function createProject(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: officerRecord, error: officerError } = await supabase
    .from("officers")
    .select("term_id, terms!inner(is_current)")
    .eq("profile_id", user.id)
    .eq("terms.is_current", true)
    .single();

  if (officerError || !officerRecord) {
    return {
      error:
        "You are not assigned as an officer for the current active term. Contact an Administrator.",
    };
  }

  const derivedTermId = officerRecord.term_id;

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const totalBudget = parseFloat(formData.get("totalBudget") as string);
  const deadline = formData.get("deadline") as string;
  const tagsInput = formData.get("tags") as string;

  const imageFile = formData.get("imageFile") as File | null;
  let finalImageUrl = "/project-card-place.webp";

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Image Upload Failed: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("project-images").getPublicUrl(fileName);

    finalImageUrl = publicUrl;
  }

  const tags = tagsInput
    ? tagsInput
        .split(",")
        .map((tag) => {
          const trimmed = tag.trim();
          return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
        })
        .filter((tag) => tag !== "#")
    : [];

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      title,
      description,
      total_budget: totalBudget,
      spent_budget: 0,
      deadline,
      manager_id: user.id,
      term_id: derivedTermId,
      status: "Ongoing",
      live_status: "Draft",
      progress: 0,
      image_url: finalImageUrl,
      tags,
    })
    .select()
    .single();

  if (projectError) return { error: `Project Error: ${projectError.message}` };

  const { error: memberError } = await supabase.from("project_members").insert({
    project_id: project.id,
    profile_id: user.id,
    project_role: "Project Lead",
  });

  if (memberError) return { error: `Member Error: ${memberError.message}` };

  const { error: budgetError } = await supabase.from("budget_logs").insert({
    project_id: project.id,
    changed_by: user.id,
    old_amount: 0,
    new_amount: totalBudget,
    budget_change_reason: "Initial budget allocation",
    is_initial: true,
  });

  if (budgetError) return { error: `Budget Log Error: ${budgetError.message}` };

  await recordActivity({
    action_type: "PROJECT_CREATED",
    entity_id: project.id,
    entity_name: title,
    description: `Created a new project: ${title} with an initial budget of ₱${totalBudget.toLocaleString()}`,
  });

  revalidatePath("/project-manager/projects");
  return { success: true };
}

export async function toggleProjectLiveStatus(
  projectId: string,
  currentStatus: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const newStatus = currentStatus === "Live" ? "Draft" : "Live";
  const updateData: any = { live_status: newStatus };

  if (newStatus === "Live") {
    updateData.status = "Ongoing";
  }

  const { error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", projectId);
  if (error) return { error: error.message };

  await recordActivity({
    action_type: "PROJECT_STATUS_CHANGED",
    entity_id: projectId,
    description: `Changed project visibility status to ${newStatus}`,
  });

  revalidatePath("/project-manager/projects", "layout");
  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  await supabase.from("budget_logs").delete().eq("project_id", projectId);
  await supabase
    .from("project_milestones")
    .delete()
    .eq("project_id", projectId);
  await supabase.from("tasks").delete().eq("project_id", projectId);
  await supabase.from("project_members").delete().eq("project_id", projectId);
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("manager_id", user.id);

  if (error) return { error: error.message };

  await recordActivity({
    action_type: "PROJECT_DELETED",
    entity_id: projectId,
    description: `Permanently deleted a project and its associated records`,
  });

  revalidatePath("/project-manager/projects", "layout");
  return { success: true };
}

export async function postComment(
  projectId: string,
  content: string,
  parentId: string | null = null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required" };

  const { error } = await supabase
    .from("comments")
    .insert({
      project_id: projectId,
      user_id: user.id,
      content,
      parent_id: parentId,
    });
  if (error) return { error: error.message };

  revalidatePath(`/viewer/projects/${projectId}`);
  return { success: true };
}

export async function editComment(commentId: string, newContnent: string) {
  const supabase = await createClient();
  const { data: {user} } = await supabase.auth.getUser();
  if(!user) return {error: "Authentication required"};

  const { error } = await supabase
    .from("comments")
    .update({ content: newContnent, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const { data: {user} } = await supabase.auth.getUser();

  if(!user) return {error: "Authentication required"};
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getProjectTeamWithOfficerRoles(projectId: string, termId: string | null) {
  const supabase = await createClient();
  
  const { data: members, error } = await supabase
    .from("project_members")
    .select(`
      project_role,
      profile_id,
      profiles!profile_id ( full_name, avatar_url )
    `)
    .eq("project_id", projectId);

  if (error || !members) {
    console.error("Error fetching team:", error?.message || error);
    return [];
  }

  const profileIds = members.map(m => m.profile_id);
  const officerMap = new Map();

  if (termId && profileIds.length > 0) {
    const { data: officers } = await supabase
      .from("officers")
      .select("profile_id, position")
      .eq("term_id", termId)
      .in("profile_id", profileIds);

    if (officers) {
      officers.forEach(o => officerMap.set(o.profile_id, o.position));
    }
  }

  return members.map((member: any) => {
    const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
    const officerPosition = officerMap.get(member.profile_id) || "USSC Member";

    const displayRole = member.project_role === "Project Lead" 
      ? `Project Lead / ${officerPosition}` 
      : officerPosition;

    return {
      id: member.profile_id,
      profile_id: member.profile_id,
      name: profile?.full_name || "Unknown Officer",
      avatarUrl: profile?.avatar_url || null,
      avatar_url: profile?.avatar_url || null, 
      role: member.project_role || "Member",
      display_role: displayRole,
      is_lead: member.project_role === "Project Lead"
    };
  });
}

export async function getActiveTerm() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("terms")
    .select("id, name, is_current, cover_url")
    .eq("is_current", true)
    .single();

  if (error) return null;
  return data;
}

export async function getAllTerms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("terms")
    .select("id, name, is_current, cover_url")
    .order("start_date", { ascending: false });

  return data || [];
}

export async function getProjectsByManager(
  userId: string, 
  params: { q?: string; status?: string; sort?: string; page?: number; dateFilter?: string }
) {
  const supabase = await createClient();
  const q = params.q || "";
  const status = params.status || "all";
  const sort = params.sort || "newest";
  const dateFilter = params.dateFilter || "all";
  const page = params.page || 1;
  const limit = 6;

  const { data: memberRecords } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('profile_id', userId);
    
  const memberProjectIds = memberRecords?.map(r => r.project_id) || [];
  const quotedMemberIds = memberProjectIds.length > 0 
    ? memberProjectIds.map(id => `"${id}"`).join(',') 
    : "";

  let statsQuery = supabase.from("projects").select("live_status, progress");
  if (quotedMemberIds) {
    statsQuery = statsQuery.or(`manager_id.eq.${userId},id.in.(${quotedMemberIds})`);
  } else {
    statsQuery = statsQuery.eq("manager_id", userId);
  }
  const { data: statsData } = await statsQuery;

  const totalStats = statsData?.length || 0;
  const liveStats = statsData?.filter((p) => p.live_status === "Live").length || 0;
  const draftStats = statsData?.filter((p) => p.live_status === "Draft").length || 0;
  const avgProgressStats = totalStats > 0 ? statsData!.reduce((acc, p) => acc + (p.progress || 0), 0) / totalStats : 0;

  let query = supabase
    .from("projects")
    .select(`*, project_members (count), comments (count)`, { count: "exact" });

  if (quotedMemberIds) {
    query = query.or(`manager_id.eq.${userId},id.in.(${quotedMemberIds})`);
  } else {
    query = query.eq("manager_id", userId);
  }

  if (q) query = query.ilike("title", `%${q}%`);
  
  if (status !== "all") {
    const statusFilter = status.toLowerCase();
    if (statusFilter === "ongoing") {
      query = query.or('status.ilike.%ongoing%,status.ilike.%active%,status.is.null,status.eq.""');
    } else if (statusFilter === "completed") {
      query = query.ilike("status", "%completed%");
    } else {
      query = query.ilike("status", `%${statusFilter}%`); 
    }
  }

  if (dateFilter === "this_month") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    query = query.gte("created_at", startOfMonth.toISOString());
  }

  if (sort === "newest") query = query.order("created_at", { ascending: false });
  else if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else if (sort === "a-z") query = query.order("title", { ascending: true });
  else if (sort === "z-a") query = query.order("title", { ascending: false });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  const totalPages = Math.ceil((count || 0) / limit);

  const projects = data?.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      location: p.location || "VSU Campus",
      imageUrl: p.image_url,
      tags: p.tags || [],
      status: (p.status && p.status.toLowerCase() === "completed") ? ("Completed" as const) : ("Ongoing" as const),
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

  return {
    success: true,
    projects,
    totalPages,
    totalFiltered: count || 0,
    stats: {
      total: totalStats,
      live: liveStats,
      draft: draftStats,
      avgProgress: avgProgressStats,
    }
  };
}