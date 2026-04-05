"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

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
      status: "Active",
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

  const { error } = await supabase
    .from("projects")
    .update({ live_status: newStatus })
    .eq("id", projectId);

  if (error) return { error: error.message };

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

  revalidatePath("/project-manager/projects", "layout");
  return { success: true };
}

export async function postComment(
  projectId: string, 
  content: string, 
  parentId: string | null = null
) {
  const supabase = await createClient(); //
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required" };

  const { error } = await supabase.from('comments').insert({
    project_id: projectId,
    user_id: user.id,
    content,
    parent_id: parentId
  });

  if (error) return { error: error.message };
  
  revalidatePath(`/viewer/projects/${projectId}`);
  return { success: true };
}