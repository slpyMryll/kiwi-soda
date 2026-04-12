"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectFilters } from "@/app/components/dashboard/ProjectFilters";
import { FaqFab } from "@/app/components/ui/FaqFab";
import { InfiniteProjectFeed } from "@/app/components/dashboard/InfiniteProjectFeed";
import { getInfiniteProjects } from "@/lib/actions/project-feed";
import { getAllTerms, getActiveTerm } from "@/lib/actions/project";
import { FollowedStats } from "@/app/components/dashboard/FollowStatCard";
import { getFollowedStats } from "@/lib/actions/follow";

export default function ViewerFollowing() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "newest";

  const [projects, setProjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [currentTermId, setCurrentTermId] = useState<string>("");

  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [completedProjectsCount, setCompletedProjectsCount] = useState(0);

  // ✅ NEW: stats state
  const [stats, setStats] = useState({
    complete: 0,
    ongoing: 0,
    followed: 0,
    updates: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [allTerms, activeTerm] = await Promise.all([
        getAllTerms(),
        getActiveTerm(),
      ]);

      setTerms(allTerms);

      const termId = searchParams.get("term") || activeTerm?.id || "";
      setCurrentTermId(termId);

      const { projects: fetchedProjects } = await getInfiniteProjects({
        page: 1,
        q,
        status,
        sort,
        termId,
        followingOnly: true,
      });

      setProjects(fetchedProjects);

      // ✅ project-based counts
      const activeCount = fetchedProjects.filter(
        (p) => (p.progress || 0) < 100
      ).length;

      const completedCount = fetchedProjects.filter(
        (p) => (p.progress || 0) === 100
      ).length;

      setActiveProjectsCount(activeCount);
      setCompletedProjectsCount(completedCount);

      // ✅ FOLLOW STATS FROM SUPABASE
      const statsData = await getFollowedStats();
      setStats(statsData);

      setLoading(false);
    }

    fetchData();
  }, [q, status, sort, searchParams]);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="mx-auto px-4 lg:px-12 w-full flex-1 relative pb-24 bg-bg-main">

      <div className="mb-4 mt-4">
        <h1 className="text-2xl font-bold text-[#153B44]">
          My Following
        </h1>
        <p className="text-sm text-gray-500">
          Stay updated on the projects you are following
        </p>
      </div>

      
      <FollowedStats
        complete={stats.complete}
        ongoing={stats.ongoing}
        followed={stats.followed}
        updates={stats.updates}
      />

      <ProjectFilters />

      <InfiniteProjectFeed
        initialProjects={projects}
        userRole="viewer"
        searchParams={{ q, status, sort, termId: currentTermId }}
        followingOnly={true}
      />

      <FaqFab />
    </main>
  );
}