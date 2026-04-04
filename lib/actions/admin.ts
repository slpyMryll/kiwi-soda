"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboardData() {
  const supabase = await createClient();

  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { data: projects } = await supabase.from("projects").select("total_budget, spent_budget").eq("live_status", "Live");
  
  const liveProjectsCount = projects?.length || 0;
  const totalSpent = projects?.reduce((sum, p) => sum + (Number(p.spent_budget) || 0), 0) || 0;

  const { data: tasks } = await supabase.from("tasks").select("status");
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t) => t.status === "Completed").length || 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: comments } = await supabase
    .from("comments")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString());

  const engagementMap = new Map();
  for(let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    engagementMap.set(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), 0);
  }
  
  comments?.forEach((c) => {
    const d = new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if(engagementMap.has(d)) engagementMap.set(d, engagementMap.get(d) + 1);
  });

  const systemReports = Array.from(engagementMap.entries()).map(([date, reports]) => ({ date, reports }));

  const { data: allProfiles } = await supabase.from("profiles").select("role");
  
  let viewerCount = 0;
  let pmCount = 0;

  allProfiles?.forEach(profile => {
    if (profile.role === "viewer") viewerCount++;
    else if (profile.role === "project-manager") pmCount++;
  });

  const userRoleData = [
    { role: "Viewer", count: viewerCount },
    { role: "Project Manager", count: pmCount },
  ];

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  const { data: onlineProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .gte("updated_at", fiveMinutesAgo)
    .neq("role", "admin")
    .order("updated_at", { ascending: false });

  const activeUsers = (onlineProfiles || []).map((u) => ({
    id: u.id,
    name: u.full_name || "Unknown User",
    status: u.role === "project-manager" ? "Project Manager" : "Viewer",
  }));

  return {
    stats: [
      { title: "Total Active Users", value: userCount || 0 },
      { title: "Live Projects", value: liveProjectsCount },
      { title: "Task Completion", value: `${taskCompletionRate}%` },
      { title: "Total Budget Spent", value: `₱${totalSpent.toLocaleString()}` },
    ],
    systemReports,
    userRoleData,
    activeUsers,
  };
}