"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAllPlatformComments() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      profiles ( full_name, avatar_url, role ),
      projects ( title )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching moderation comments:", error);
    return [];
  }

  return data || [];
}

export async function toggleCommentVisibility(commentId: string, currentHiddenStatus: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("comments")
    .update({ is_hidden: !currentHiddenStatus })
    .eq("id", commentId);

  if (error) {
    console.error("Error toggling comment visibility:", error);
    return false;
  }

  return true;
}