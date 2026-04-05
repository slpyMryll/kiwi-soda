"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function recordActivity({
  action_type,
  entity_id,
  entity_name,
  description,
  metadata = {},
}: {
  action_type: string;
  entity_id?: string;
  entity_name?: string;
  description: string;
  metadata?: any;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    action_type,
    entity_id,
    entity_name,
    description,
    metadata,
  });
}

export async function getSystemSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("system_settings").select("*");
  
  return (data || []).reduce((acc: any, curr) => {
    let val = curr.value?.content !== undefined ? curr.value.content : curr.value;
    
    if (typeof val === 'string') {
      val = val.replace(/^"|"$/g, '');
    }
    
    acc[curr.key] = val;
    return acc;
  }, {});
}

export async function updateSystemSetting(key: string, value: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("system_settings")
    .upsert({ 
      key, 
      value: { content: value }, 
      updated_by: user?.id, 
      updated_at: new Date().toISOString() 
    });

  if (error) {
    console.error("Settings Update Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/privacy");
  revalidatePath("/terms");
  revalidatePath("/cookies");
  
  return { success: true };
}

export async function getActivityLogs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select(`
      *,
      profiles:actor_id ( full_name, role )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) console.error("Error fetching logs:", error);
  return data || [];
}