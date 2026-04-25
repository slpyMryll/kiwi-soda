"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from 'next/headers'
import { revalidatePath } from "next/cache";

import { NotificationDispatcher } from "@/lib/services/notification-dispatcher";

export async function notifyProjectFollowers(
  projectId: string,
  actorId: string,
  message: string,
  actionLink: string,
  type: string = 'project_update',
  category: 'followed_project_updates' | 'budget_alerts' | 'general' = 'followed_project_updates'
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

  if (!supabaseServiceKey) return;

  const supabaseAdmin = createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll() { return []; },
      setAll() {},
    },
  });

  const { data: project } = await supabaseAdmin
    .from("projects")
    .select("title")
    .eq("id", projectId)
    .single();

  const projectName = project?.title || "A project you follow";
  
  const formattedMessage = `[${projectName}] ${message}`;

  const { data: followers } = await supabaseAdmin
    .from("project_followers")
    .select("user_id")
    .eq("project_id", projectId);

  if (!followers || followers.length === 0) return;

  const userIds = followers.map((f: any) => f.user_id);

  // Use the centralized dispatcher to enforce preferences
  await NotificationDispatcher.dispatch({
    userIds,
    actorId,
    message: formattedMessage,
    actionLink,
    type,
    category,
    projectId,
  });
}

export async function toggleFollow(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: "Unauthorized" };

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("project_followers")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking follow status:", fetchError);
      return { error: fetchError.message };
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from("project_followers")
        .insert({
          user_id: user.id,
          project_id: projectId,
          followed_at: new Date().toISOString(),
        });

      if (insertError) return { error: insertError.message };

      revalidatePath("/viewer/projects");
      revalidatePath("/viewer/following");
      revalidatePath(`/viewer/projects/${projectId}`);
      return { success: true, following: true };
    }

    const { error: deleteError } = await supabase
      .from("project_followers")
      .delete()
      .eq("user_id", user.id)
      .eq("project_id", projectId);

    if (deleteError) return { error: deleteError.message };

    revalidatePath("/viewer/projects");
    revalidatePath("/viewer/following");
    revalidatePath(`/viewer/projects/${projectId}`);
    return { success: true, following: false };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getFollowStatus(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { following: false }; 

  const { data: existing, error } = await supabase
    .from("project_followers")
    .select("*")
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error(error);
    return { following: false };
  }

  return { following: !!existing };
}

export async function getFollowedStats() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      complete: 0,
      ongoing: 0,
      followed: 0,
      updates: 0,
    };
  }

  const { data, error } = await supabase
    .from("project_followers")
    .select(`
      followed_at,
      projects(progress)
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return {
      complete: 0,
      ongoing: 0,
      followed: 0,
      updates: 0,
    };
  }

  const followed = data.length;

  const ongoing = data.filter(
    (p: any) => (p.projects?.progress || 0) < 100
  ).length;

  const complete = data.filter(
    (p: any) => (p.projects?.progress || 0) === 100
  ).length;

  const updates = data.filter((p: any) => {
    const days =
      (Date.now() - new Date(p.followed_at).getTime()) /
      (1000 * 60 * 60 * 24);

    return days <= 7;
  }).length;

  return {
    complete,
    ongoing,
    followed,
    updates,
  };
}