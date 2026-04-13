"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
      revalidatePath("/following");
      return { success: true, following: true };
    }

    const { error: deleteError } = await supabase
      .from("project_followers")
      .delete()
      .eq("user_id", user.id)
      .eq("project_id", projectId);

    if (deleteError) return { error: deleteError.message };

    revalidatePath("/viewer/projects");
    revalidatePath("/following");
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

  if (authError || !user) return { following: false }; // default for guest

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