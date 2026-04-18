"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboardData() {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const [
    { count: userCount },
    { data: projectStats },
    { data: taskStats },
    { data: comments },
    { data: roleStats },
    { data: onlineProfiles }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("spent_budget").eq("live_status", "Live"),
    supabase.from("tasks").select("status"),
    supabase.from("comments").select("created_at").gte("created_at", thirtyDaysAgo.toISOString()),
    supabase.from("profiles").select("role"),
    supabase.from("profiles").select("id, full_name, role").gte("updated_at", fiveMinutesAgo).neq("role", "admin").order("updated_at", { ascending: false })
  ]);

  const liveProjectsCount = projectStats?.length || 0;
  const totalSpent = projectStats?.reduce((sum, p) => sum + (Number(p.spent_budget) || 0), 0) || 0;

  const totalTasks = taskStats?.length || 0;
  const completedTasks = taskStats?.filter((t) => t.status === "Completed").length || 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

  let viewerCount = 0;
  let pmCount = 0;

  roleStats?.forEach(profile => {
    if (profile.role === "viewer") viewerCount++;
    else if (profile.role === "project-manager") pmCount++;
  });

  const userRoleData = [
    { role: "Viewer", count: viewerCount },
    { role: "Project Manager", count: pmCount },
  ];

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