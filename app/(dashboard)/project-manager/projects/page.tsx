import { createClient } from "@/lib/supabase/server";
import PmProjectsClient from "./PmProjectsClient";
import { Project } from "@/types/projects";

export default async function PmProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || "";
  const status = resolvedParams?.status || "all";
  const sort = resolvedParams?.sort || "newest";
  const dateFilter = resolvedParams?.date || "all";
  const page = parseInt(resolvedParams?.page || "1");
  const limit = 6;

  const { data: memberRecords } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('profile_id', user?.id);
    
  const memberProjectIds = memberRecords?.map(r => r.project_id) || [];

  const quotedMemberIds = memberProjectIds.length > 0 
    ? memberProjectIds.map(id => `"${id}"`).join(',') 
    : "";

  let statsQuery = supabase.from("projects").select("live_status, progress");
  if (quotedMemberIds) {
    statsQuery = statsQuery.or(`manager_id.eq.${user?.id},id.in.(${quotedMemberIds})`);
  } else {
    statsQuery = statsQuery.eq("manager_id", user?.id);
  }
  const { data: statsData } = await statsQuery;

  const totalStats = statsData?.length || 0;
  const liveStats = statsData?.filter((p) => p.live_status === "Live").length || 0;
  const draftStats = statsData?.filter((p) => p.live_status === "Draft").length || 0;
  const avgProgressStats = totalStats > 0 ? statsData!.reduce((acc, p) => acc + (p.progress || 0), 0) / totalStats : 0;

  let query = supabase
    .from("projects")
    .select(`*, project_members (count), comments (count)`, { count: "exact" });

  if (quotedMemberIds) {
    query = query.or(`manager_id.eq.${user?.id},id.in.(${quotedMemberIds})`);
  } else {
    query = query.eq("manager_id", user?.id);
  }

  if (q) query = query.ilike("title", `%${q}%`);
  
  if (status !== "all") {
    const statusFilter = status.toLowerCase();
    
    if (statusFilter === "ongoing") {
      query = query.or('status.ilike.%ongoing%,status.ilike.%active%,status.is.null,status.eq.""');
    } else if (statusFilter === "completed") {
      query = query.ilike("status", "%completed%");
    } else {
      query = query.ilike("status", `%${statusFilter}%`); 
    }
  }

  if (dateFilter === "this_month") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    query = query.gte("created_at", startOfMonth.toISOString());
  }

  if (sort === "newest") query = query.order("created_at", { ascending: false });
  else if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else if (sort === "a-z") query = query.order("title", { ascending: true });
  else if (sort === "z-a") query = query.order("title", { ascending: false });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  const totalPages = Math.ceil((count || 0) / limit);

  const projects: Project[] =
    data?.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      location: p.location || "VSU Campus",
      imageUrl: p.image_url,
      tags: p.tags || [],
      status: (p.status && p.status.toLowerCase() === "completed") ? "Completed" : "Ongoing",
      liveStatus: p.live_status,
      totalBudget: Number(p.total_budget),
      spentBudget: Number(p.spent_budget),
      progress: p.progress,
      deadline: p.deadline,
      postedAt: p.posted_at || p.created_at,
      created_at: p.created_at,
      updated_at: p.updated_at,
      membersCount: p.project_members?.[0]?.count || 0,
      commentsCount: p.comments?.[0]?.count || 0,
      isFollowing: false,
    })) || [];

  return (
    <PmProjectsClient
      projects={projects}
      currentPage={page}
      totalPages={totalPages}
      totalFiltered={count || 0}
      stats={{
        total: totalStats,
        live: liveStats,
        draft: draftStats,
        avgProgress: avgProgressStats,
      }}
    />
  );
}