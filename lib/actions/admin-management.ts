"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { recordActivity } from "./system";

export async function getAdminUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, updated_at, avatar_url")
    .order("created_at", { ascending: false });

  if (error) console.error("Error fetching users:", error);
  return data || [];
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Role Update Error:", error);
    return { success: false, error: error.message };
  }
  
  await recordActivity({
    action_type: "USER_ROLE_CHANGED",
    entity_id: userId,
    description: `Updated user role to ${newRole}`,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function removeUser(userId: string) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) return { success: false, error: "Unauthorized" };
  
  if (currentUser.id === userId) {
    return { success: false, error: "You cannot delete your own account." };
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title")
    .eq("manager_id", userId);

  if (projects && projects.length > 0) {
    return { 
      success: false, 
      error: `Cannot delete user: They are the manager of "${projects[0].title}"${projects.length > 1 ? ` and ${projects.length - 1} other projects` : ""}. Reassign or delete these projects first.` 
    };
  }

  await recordActivity({
    action_type: "USER_DELETED",
    entity_id: userId,
    description: `Initiated permanent removal of user profile and platform dependencies.`,
  });

  await supabase.from("system_settings").update({ updated_by: null }).eq("updated_by", userId);
  await supabase.from("activity_logs").update({ actor_id: null }).eq("actor_id", userId);
  await supabase.from("comments").update({ user_id: null }).eq("user_id", userId);
  await supabase.from("budget_logs").update({ changed_by: null }).eq("changed_by", userId);
  

  await supabase.from("officers").delete().eq("profile_id", userId);
  await supabase.from("project_members").delete().eq("profile_id", userId);
  await supabase.from("notifications").delete().eq("user_id", userId);
  await supabase.from("notifications").delete().eq("actor_id", userId);
  await supabase.from("follows").delete().eq("user_id", userId);
  await supabase.from("push_subscriptions").delete().eq("user_id", userId);

  const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId);
  
  if (profileError) {
    console.error("Profile Deletion Error:", profileError);
    return { success: false, error: profileError.message };
  }

  const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
  
  if (authError) {
    console.error("Auth Deletion Error:", authError);
    return { success: false, error: `Profile deleted, but Auth removal failed: ${authError.message}` };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function getTermsAndOfficers() {
  const supabase = await createClient();
  const { data: terms, error } = await supabase
    .from("terms")
    .select(`
      *,
      officers (
        id, position, created_at,
        profiles ( id, full_name, avatar_url, email ) 
      )
    `)
    .order("created_at", { ascending: false });

  if (error) console.error("Error fetching terms:", error);
  return terms || [];
}

export async function getProjectManagers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, email")
    .eq("role", "project-manager");

  if (error) console.error("Error fetching PMs:", error);
  return data || [];
}

export async function createTermWithOfficers(
  term: { name: string; start_date: string; end_date: string },
  officers: { profile_id: string; position: string; committee?: string }[]
) {
  const supabase = await createClient();
  
  const { data: termData, error: termError } = await supabase
    .from("terms")
    .insert([{ ...term, is_current: false }])
    .select()
    .single();

  if (termError) return { success: false, error: termError.message };

  if (officers.length > 0) {
    const validOfficers = officers.filter(o => o.profile_id && o.position);
    if (validOfficers.length > 0) {
      const officersToInsert = validOfficers.map(o => ({
        term_id: termData.id,
        profile_id: o.profile_id,
        position: o.position,
      }));

      const { error: offError } = await supabase.from("officers").insert(officersToInsert);
      if (offError) return { success: false, error: offError.message };
    }
  }

  await recordActivity({
    action_type: "TERM_CREATED",
    entity_id: termData.id,
    entity_name: term.name,
    description: `Created new academic term: ${term.name} with ${officers.length} initial officers`,
  });

  revalidatePath("/admin/terms");
  return { success: true };
}

export async function setActiveTerm(termId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("terms").update({ is_current: true }).eq("id", termId);
  if (error) return { success: false, error: error.message };

  await recordActivity({
    action_type: "TERM_ACTIVATED",
    entity_id: termId,
    description: `An academic term was set as the active organization term`,
  });

  revalidatePath("/admin/terms");
  return { success: true };
}

export async function removeOfficer(officerId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("officers").delete().eq("id", officerId);
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin/terms");
  return { success: true };
}

export async function assignOfficer(termId: string, profileId: string, position: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("officers")
    .insert([{ term_id: termId, profile_id: profileId, position }]);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/terms");
  return { success: true };
}

export async function updateTermCover(termId: string, coverUrl: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("terms")
    .update({ cover_url: coverUrl })
    .eq("id", termId);

  if (error) return { success: false, error: error.message };

  await recordActivity({
    action_type: "TERM_COVER_UPDATED",
    entity_id: termId,
    description: `Updated the cover photo for an academic term`,
  });

  revalidatePath("/admin/terms");
  revalidatePath("/viewer");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTerm(termId: string) {
  const supabase = await createClient();

  const { data: term } = await supabase.from("terms").select("is_current, name").eq("id", termId).single();
  
  if (term?.is_current) {
    return { success: false, error: "You cannot delete the currently active term. Activate another term first." };
  }

  const { error } = await supabase.from("terms").delete().eq("id", termId);
  
  if (error) return { success: false, error: error.message };

  await recordActivity({
    action_type: "TERM_DELETED",
    entity_id: termId,
    description: `Deleted academic term: ${term?.name}`,
  });

  revalidatePath("/admin/terms");
  return { success: true };
}
