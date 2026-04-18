"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyProjectFollowers } from "./follow";

export async function addProjectMember(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const profileId = formData.get("profileId") as string;

  const { error } = await supabase
    .from("project_members")
    .upsert(
      { project_id: projectId, profile_id: profileId, project_role: "Member" },
      { onConflict: "project_id, profile_id", ignoreDuplicates: true },
    );

  if (error && error.code !== "23505") return { error: error.message };

  await supabase.from("notifications").insert({
    user_id: profileId,
    message: `You have been added to a new project team.`,
    action_link: `/project-manager/projects/${projectId}`,
  });

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
  const category = (formData.get("category") as string) || "Task Allocation";

  const { data: existingTask } = await supabase
    .from("tasks")
    .select("id")
    .eq("project_id", projectId)
    .eq("assigned_to", assignedTo)
    .ilike("title", title)
    .single();

  if (existingTask)
    return { error: "This exact task is already assigned to this officer." };

  const { data: newTask, error: taskError } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      assigned_to: assignedTo,
      title,
      due_date: dueDate,
      cost,
      status: "Pending",
    })
    .select("id")
    .single();

  if (taskError) return { error: taskError.message };

  if (cost > 0) {
    const { data: project } = await supabase
      .from("projects")
      .select("spent_budget")
      .eq("id", projectId)
      .single();
    const newSpent = Number(project?.spent_budget || 0) + cost;

    await supabase
      .from("projects")
      .update({ spent_budget: newSpent })
      .eq("id", projectId);

    await supabase.from("budget_logs").insert({
      project_id: projectId,
      old_amount: Number(project?.spent_budget || 0),
      new_amount: newSpent,
      budget_change_reason: `${category}: Assigned Task - ${title}`,
      changed_by: user.id,
      is_initial: false,
      status: "Approved",
    });
  }

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

  const { data: existingMilestone } = await supabase
    .from("project_milestones")
    .select("id")
    .eq("project_id", projectId)
    .ilike("title", title)
    .single();

  if (existingMilestone)
    return { error: "A milestone with this title already exists." };

  const { error } = await supabase.from("project_milestones").insert({
    project_id: projectId,
    title,
    end_date: endDate,
    progress,
    status,
  });

  if (error) return { error: error.message };

  await notifyProjectFollowers(
    projectId,
    user.id,
    `New Milestone Added: "${title}"`,
    `/viewer/projects/${projectId}`,
    "milestone_update",
  );
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
    .update({ title, location, progress, status })
    .eq("id", projectId)
    .select()
    .single();
  if (error)
    return {
      error:
        error.code === "PGRST116"
          ? "Permission Denied: Only the PM can edit."
          : error.message,
    };
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
    .eq("id", projectId)
    .select()
    .single();
  if (error)
    return {
      error:
        error.code === "PGRST116"
          ? "Permission Denied: Only the PM can edit."
          : error.message,
    };
  return { success: true };
}

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const title = formData.get("title") as string;
  const endDate = formData.get("deadline") as string;
  const progress = parseInt(formData.get("progress") as string);
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("project_milestones")
    .update({ title, end_date: endDate, progress, status })
    .eq("id", milestoneId);
  if (error) return { error: error.message };

  if (user)
    await notifyProjectFollowers(
      projectId,
      user.id,
      `Milestone Updated: "${title}" is now ${status}`,
      `/viewer/projects/${projectId}`,
      "milestone_update",
    );
  return { success: true };
}

export async function deleteMilestone(projectId: string, milestoneId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_milestones")
    .delete()
    .eq("id", milestoneId)
    .eq("project_id", projectId);
  if (error) return { error: error.message };
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
  return { success: true };
}

export async function deleteDocument(
  projectId: string,
  documentId: string,
  fileUrl: string,
) {
  const supabase = await createClient();
  const urlParts = fileUrl.split("/project-documents/");
  if (urlParts.length > 1)
    await supabase.storage.from("project-documents").remove([urlParts[1]]);

  const { error } = await supabase
    .from("project_documents")
    .delete()
    .eq("id", documentId)
    .eq("project_id", projectId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateProjectProgress(
  projectId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const progress = parseInt(formData.get("progress") as string);
  if (isNaN(progress) || progress < 0 || progress > 100)
    return { error: "Invalid progress value." };

  const status = progress === 100 ? "Completed" : "Ongoing";
  const { error } = await supabase
    .from("projects")
    .update({ progress, status, updated_at: new Date() })
    .eq("id", projectId)
    .select()
    .single();
  if (error)
    return {
      error: error.code === "PGRST116" ? "Permission Denied." : error.message,
    };

  if (user)
    await notifyProjectFollowers(
      projectId,
      user.id,
      `Project progress is now at ${progress}%`,
      `/viewer/projects/${projectId}`,
      "progress_update",
    );
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

  if (isManager)
    await supabase
      .from("projects")
      .update({ total_budget: newAmount, updated_at: new Date() })
      .eq("id", projectId);

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

  if (user && status === "Approved")
    await notifyProjectFollowers(
      projectId,
      user.id,
      `Total budget was adjusted to ₱${newAmount.toLocaleString()}`,
      `/viewer/projects/${projectId}`,
      "budget_update",
    );

  if (status === "Pending" && project?.manager_id) {
    await supabase.from("notifications").insert({
      user_id: project.manager_id,
      message: `A member requested to adjust the total budget to ₱${newAmount.toLocaleString()}.`,
      action_link: `/project-manager/projects/${projectId}?tab=Budget`,
    });
  }

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

  if (isManager)
    await supabase
      .from("projects")
      .update({ spent_budget: newAmount })
      .eq("id", projectId);

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

  if (status === "Approved") {
    await notifyProjectFollowers(
      projectId,
      user.id,
      `New expense recorded: ₱${amount.toLocaleString()} for ${category}`,
      `/viewer/projects/${projectId}`,
      "expense_update",
    );
  } else if (status === "Pending" && project?.manager_id) {
    await supabase.from("notifications").insert({
      user_id: project.manager_id,
      message: `Pending Approval: Expense request for ₱${amount.toLocaleString()} (${category}).`,
      action_link: `/project-manager/projects/${projectId}?tab=Budget`,
    });
  }

  return { success: true, log };
}

export async function approveExpense(logId: string, projectId: string) {
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
  if (project?.manager_id !== user.id)
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
    if (error) return { error: `Approval failed. Error: ${error.message}` };

    await supabase
      .from("projects")
      .update({ total_budget: log.new_amount })
      .eq("id", projectId);

    if (log.changed_by && log.changed_by !== user.id) {
      await supabase.from("notifications").insert({
        user_id: log.changed_by,
        message: `Your Total Budget adjustment request was Approved.`,
        action_link: `/project-manager/projects/${projectId}?tab=Budget`,
      });
    }

    await notifyProjectFollowers(
      projectId,
      user.id,
      `A budget adjustment request was approved.`,
      `/viewer/projects/${projectId}`,
      "budget_update",
    );
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
    if (error) return { error: `Approval failed. Error: ${error.message}` };

    await supabase
      .from("projects")
      .update({ spent_budget: newSpent })
      .eq("id", projectId);

    if (log!.changed_by && log!.changed_by !== user.id) {
      await supabase.from("notifications").insert({
        user_id: log!.changed_by,
        message: `Your expense request for ₱${amountToApprove.toLocaleString()} was Approved!`,
        action_link: `/project-manager/projects/${projectId}?tab=Budget`,
      });
    }

    await notifyProjectFollowers(
      projectId,
      user.id,
      `An expense request for ₱${amountToApprove.toLocaleString()} was approved.`,
      `/viewer/projects/${projectId}`,
      "expense_update",
    );
    return { success: true, log: updatedLog };
  }
}

export async function rejectExpense(logId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: project } = await supabase
    .from("projects")
    .select("manager_id")
    .eq("id", projectId)
    .single();
  if (project?.manager_id !== user.id) return { error: "Unauthorized" };

  const { data: updatedLog, error } = await supabase
    .from("budget_logs")
    .update({ status: "Rejected" })
    .eq("id", logId)
    .select("*, profiles:changed_by(full_name)")
    .single();
  if (error) return { error: error.message };

  if (updatedLog?.changed_by && updatedLog.changed_by !== user.id) {
    const amountToReject = updatedLog.new_amount - updatedLog.old_amount;
    await supabase.from("notifications").insert({
      user_id: updatedLog.changed_by,
      message: `Your budget request for ₱${amountToReject.toLocaleString()} was Rejected.`,
      action_link: `/project-manager/projects/${projectId}?tab=Budget`,
    });
  }

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
  if (project?.manager_id !== user.id) return { error: "Unauthorized" };

  const { data: oldLog } = await supabase
    .from("budget_logs")
    .select("*")
    .eq("id", logId)
    .single();
  if (oldLog?.status !== "Approved")
    return { error: "Only approved entries can be reversed." };
  if (oldLog.budget_change_reason.includes("Correction") || oldLog.is_initial)
    return { error: "Cannot reverse this entry type." };

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

  return {
    success: true,
    updatedOldLog,
    newLog,
    newSpent,
    newTotal,
    isTotalBudget,
  };
}
