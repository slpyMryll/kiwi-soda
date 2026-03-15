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
  const progress = parseInt((formData.get("progress") as string) || "0");

  const status = progress === 100 ? "Completed" : "Ongoing";

  const { error } = await supabase
    .from("projects")
    .update({
      title,
      location,
      progress,
      status,
    })
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

  const { data: project } = await supabase
    .from("projects")
    .select("manager_id")
    .eq("id", projectId)
    .single();
  const isManager = project?.manager_id === user?.id;
  const status = isManager ? "Approved" : "Pending";

  if (isManager) {
    await supabase
      .from("projects")
      .update({ total_budget: newAmount, updated_at: new Date() })
      .eq("id", projectId);
  }

  const { data: log, error: logError } = await supabase
    .from("budget_logs")
    .insert({
      project_id: projectId,
      changed_by: user?.id,
      old_amount: oldAmount,
      new_amount: newAmount,
      budget_change_reason: `Total Budget: Adjustment`,
      is_initial: false,
      status: status,
    })
    .select("*, profiles:changed_by(full_name)")
    .single();

  if (logError) return { error: logError.message };
  revalidatePath("/", "layout");
  return { success: true, log };
}

export async function addExpense(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;

  const { data: project } = await supabase
    .from("projects")
    .select("manager_id, spent_budget")
    .eq("id", projectId)
    .single();
  const isManager = project?.manager_id === user.id;
  const status = isManager ? "Approved" : "Pending";
  const newAmount = project!.spent_budget + amount;

  if (isManager) {
    await supabase
      .from("projects")
      .update({ spent_budget: newAmount })
      .eq("id", projectId);
  }

  const { data: log, error: logError } = await supabase
    .from("budget_logs")
    .insert({
      project_id: projectId,
      changed_by: user.id,
      old_amount: project!.spent_budget,
      new_amount: newAmount,
      budget_change_reason: `${category}: ${description}`,
      is_initial: false,
      status: status,
    })
    .select("*, profiles:changed_by(full_name)")
    .single();

  if (logError) return { error: logError.message };
  return { success: true, log };
}

export async function approveExpense(logId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("manager_id, spent_budget, total_budget")
    .eq("id", projectId)
    .single();
  if (project?.manager_id !== user?.id)
    return { error: "Only the PM can approve." };

  const { data: log } = await supabase
    .from("budget_logs")
    .select("*")
    .eq("id", logId)
    .single();
  if (log?.status === "Approved") return { error: "Already approved." };

  if (log?.budget_change_reason.includes("Total Budget")) {
    const { data: updatedLog, error } = await supabase
      .from("budget_logs")
      .update({ status: "Approved" })
      .eq("id", logId)
      .select("*, profiles:changed_by(full_name)")
      .single();
    if (error)
      return {
        error: `Approval failed (RLS blocked). Error: ${error.message}`,
      };

    await supabase
      .from("projects")
      .update({ total_budget: log.new_amount })
      .eq("id", projectId);
    revalidatePath("/", "layout");
    return { success: true, log: updatedLog };
  } else {
    const amountToApprove = log!.new_amount - log!.old_amount;
    const newSpent = project!.spent_budget + amountToApprove;

    const { data: updatedLog, error } = await supabase
      .from("budget_logs")
      .update({
        status: "Approved",
        old_amount: project!.spent_budget,
        new_amount: newSpent,
      })
      .eq("id", logId)
      .select("*, profiles:changed_by(full_name)")
      .single();
    if (error)
      return {
        error: `Approval failed (RLS blocked). Error: ${error.message}`,
      };

    await supabase
      .from("projects")
      .update({ spent_budget: newSpent })
      .eq("id", projectId);
    revalidatePath("/", "layout");
    return { success: true, log: updatedLog };
  }
}

export async function rejectExpense(logId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("manager_id")
    .eq("id", projectId)
    .single();
  if (project?.manager_id !== user?.id) return { error: "Unauthorized" };

  const { data: updatedLog, error } = await supabase
    .from("budget_logs")
    .update({ status: "Rejected" })
    .eq("id", logId)
    .select("*, profiles:changed_by(full_name)")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true, log: updatedLog };
}

export async function adjustExpense(logId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: project } = await supabase
    .from("projects")
    .select("manager_id, spent_budget, total_budget")
    .eq("id", projectId)
    .single();
  if (!project) return { error: "Project not found." };
  if (project.manager_id !== user.id) return { error: "Unauthorized" };

  const { data: oldLog } = await supabase
    .from("budget_logs")
    .select("*")
    .eq("id", logId)
    .single();

  if (oldLog?.status !== "Approved")
    return { error: "Only approved entries can be reversed." };

  if (oldLog.budget_change_reason.includes("Correction") || oldLog.is_initial) {
    return { error: "Cannot reverse this entry type." };
  }

  const isTotalBudget =
    oldLog.budget_change_reason.includes("Total Budget") ||
    oldLog.budget_change_reason.includes("budget adjustment");

  let newSpent = project.spent_budget;
  let newTotal = project.total_budget;
  let logOldAmount = 0;
  let logNewAmount = 0;

  if (isTotalBudget) {
    newTotal = oldLog.old_amount;
    logOldAmount = project.total_budget;
    logNewAmount = newTotal;
    await supabase
      .from("projects")
      .update({ total_budget: newTotal })
      .eq("id", projectId);
  } else {
    const amountToReverse = oldLog.new_amount - oldLog.old_amount;
    newSpent = Math.max(0, project.spent_budget - amountToReverse);
    logOldAmount = project.spent_budget;
    logNewAmount = newSpent;
    await supabase
      .from("projects")
      .update({ spent_budget: newSpent })
      .eq("id", projectId);
  }

  const { data: updatedOldLog, error } = await supabase
    .from("budget_logs")
    .update({ status: "Adjusted" })
    .eq("id", logId)
    .select("*, profiles:changed_by(full_name)")
    .single();
  if (error) return { error: error.message };

  const safeReason = oldLog.budget_change_reason.replace(/\[|\]/g, "");

  const { data: newLog } = await supabase
    .from("budget_logs")
    .insert({
      project_id: projectId,
      changed_by: user.id,
      old_amount: logOldAmount,
      new_amount: logNewAmount,
      budget_change_reason: `Correction -> Voided (${safeReason})`,
      is_initial: false,
      status: "Approved",
    })
    .select("*, profiles:changed_by(full_name)")
    .single();

  revalidatePath("/", "layout");

  return {
    success: true,
    updatedOldLog,
    newLog,
    newSpent,
    newTotal,
    isTotalBudget,
  };
}
