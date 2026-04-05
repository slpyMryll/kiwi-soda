"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  
  revalidatePath("/admin/users");
  return { success: true };
}

export async function removeUser(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  
  if (error) return { success: false, error: error.message };
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

  revalidatePath("/admin/terms");
  return { success: true };
}

export async function setActiveTerm(termId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("terms").update({ is_current: true }).eq("id", termId);
  if (error) return { success: false, error: error.message };
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