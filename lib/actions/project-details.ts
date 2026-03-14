"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addProjectMember(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const profileId = formData.get("profileId") as string;

  const { error } = await supabase.from("project_members").upsert(
    {
      project_id: projectId,
      profile_id: profileId,
      project_role: "Member",
    },
    {
      onConflict: "project_id, profile_id",
      ignoreDuplicates: true,
    },
  );

  if (error && error.code !== "23505") {
    return { error: error.message };
  }

  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}

export async function assignTask(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const assignedTo = formData.get("assignedTo") as string;
  const dueDate = formData.get("dueDate") as string;
  const cost = parseFloat((formData.get("cost") as string) || "0");

  const { error } = await supabase.from("tasks").insert({
    project_id: projectId,
    assigned_to: assignedTo,
    title,
    due_date: dueDate,
    cost,
    status: "Pending",
  });

  if (error) return { error: error.message };
  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}

export async function addExpense(
  projectId: string,
  currentSpent: number,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;

  const { error: updateError } = await supabase
    .from("projects")
    .update({ spent_budget: currentSpent + amount })
    .eq("id", projectId);

  if (updateError) return { error: updateError.message };

  const { error: logError } = await supabase.from("budget_logs").insert({
    project_id: projectId,
    changed_by: user.id,
    old_amount: currentSpent,
    new_amount: currentSpent + amount,
    budget_change_reason: `${category}: ${description}`,
    is_initial: false,
  });

  if (logError) return { error: logError.message };

  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}

export async function addMilestone(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const endDate = formData.get("deadline") as string;
  const progress = parseInt(formData.get("progress") as string);
  const status = formData.get("status") as string;

  const { error } = await supabase.from("project_milestones").insert({
    project_id: projectId,
    title,
    end_date: endDate,
    progress,
    status,
  });

  if (error) return { error: error.message };
  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}

export async function updateProjectDetails(
  projectId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const location = formData.get("location") as string;

  const { error } = await supabase
    .from("projects")
    .update({ title, location, updated_at: new Date() })
    .eq("id", projectId);

  if (error) return { error: error.message };
  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}
export async function updateProjectDescription(
  projectId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const description = formData.get("description") as string;

  const { error } = await supabase
    .from("projects")
    .update({ description, updated_at: new Date() })
    .eq("id", projectId);

  if (error) return { error: error.message };
  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}

export async function updateProjectBudget(
  projectId: string,
  oldAmount: number,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const newAmount = parseFloat(formData.get("totalBudget") as string);

  const { error: updateError } = await supabase
    .from("projects")
    .update({ total_budget: newAmount, updated_at: new Date() })
    .eq("id", projectId);

  if (updateError) return { error: updateError.message };

  const { error: logError } = await supabase.from("budget_logs").insert({
    project_id: projectId,
    changed_by: user?.id,
    old_amount: oldAmount,
    new_amount: newAmount,
    budget_change_reason: `Manual budget adjustment`,
    is_initial: false,
  });

  if (logError) return { error: logError.message };

  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const endDate = formData.get("deadline") as string;
  const progress = parseInt(formData.get("progress") as string);
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("project_milestones")
    .update({ title, end_date: endDate, progress, status })
    .eq("id", milestoneId);

  if (error) return { error: error.message };
  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}

export async function deleteMilestone(projectId: string, milestoneId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("project_milestones")
    .delete()
    .eq("id", milestoneId);

  if (error) return { error: error.message };
  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}

export async function uploadDocument(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const fileExt = file.name.split(".").pop();
  const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("project-documents")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("project-documents").getPublicUrl(fileName);

  const { error: dbError } = await supabase.from("project_documents").insert({
    project_id: projectId,
    name: file.name,
    file_url: publicUrl,
    file_size: file.size,
    file_type: file.type || "application/octet-stream",
    uploaded_by: user.id,
  });

  if (dbError) return { error: dbError.message };
  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}

export async function deleteDocument(
  projectId: string,
  documentId: string,
  fileUrl: string,
) {
  const supabase = await createClient();

  const urlParts = fileUrl.split("/project-documents/");
  if (urlParts.length > 1) {
    const filePath = urlParts[1];
    await supabase.storage.from("project-documents").remove([filePath]);
  }

  const { error } = await supabase
    .from("project_documents")
    .delete()
    .eq("id", documentId);

  if (error) return { error: error.message };
  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}

export async function updateProjectProgress(
  projectId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const progress = parseInt(formData.get("progress") as string);

  if (isNaN(progress) || progress < 0 || progress > 100) {
    return { error: "Invalid progress value. Must be between 0 and 100." };
  }

  const { error } = await supabase
    .from("projects")
    .update({ progress, updated_at: new Date() })
    .eq("id", projectId);

  if (error) return { error: error.message };
  revalidatePath(`/project-manager/projects/${projectId}`);
  return { success: true };
}