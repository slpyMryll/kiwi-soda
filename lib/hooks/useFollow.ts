"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow, getFollowStatus } from "@/lib/actions/follow";
import { useQueryClient } from "@tanstack/react-query"; 
import { toast } from "sonner";

export function useFollow(projectId: string, initialIsFollowing?: boolean) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState<boolean | null>(initialIsFollowing ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialIsFollowing !== undefined) {
      setIsFollowing(initialIsFollowing);
    } else if (isFollowing === null) {
      async function fetchStatus() {
        try {
          const result = await getFollowStatus(projectId);
          setIsFollowing(result.following);
        } catch (err) {
          console.error("Failed to fetch follow status:", err);
          setIsFollowing(false);
        }
      }
      fetchStatus();
    }
  }, [projectId, initialIsFollowing]);

  useEffect(() => {
    const handleSync = (e: CustomEvent) => {
      if (e.detail.projectId === projectId && e.detail.isFollowing !== isFollowing) {
        setIsFollowing(e.detail.isFollowing);
      }
    };
    window.addEventListener("sync-follow", handleSync as EventListener);
    return () => window.removeEventListener("sync-follow", handleSync as EventListener);
  }, [projectId, isFollowing]);

  const handleFollow = async (isGuest: boolean) => {
    if (isGuest) {
      router.push("/login");
      return;
    }

    if (loading || isFollowing === null) return;
    setLoading(true);

    const prevState = isFollowing;
    const newState = !prevState;

    setIsFollowing(newState);
    window.dispatchEvent(new CustomEvent("sync-follow", { detail: { projectId, isFollowing: newState } }));

    // Optimistically update the cache for all relevant queries
    // 1. Update any infinite project feeds (Public/Followed)
    const projectQueries = queryClient.getQueriesData({ queryKey: ["projects"] });
    projectQueries.forEach(([queryKey, oldData]) => {
      const data = oldData as any;
      if (!data || !data.pages) return;

      const followingOnly = (queryKey as any)[7] === true;

      const newPages = data.pages.map((page: any) => {
        let newProjects = page.projects.map((p: any) => 
          p.id === projectId ? { ...p, isFollowing: newState } : p
        );

        if (followingOnly && !newState) {
          newProjects = newProjects.filter((p: any) => p.id !== projectId);
        }

        return { ...page, projects: newProjects };
      });

      queryClient.setQueryData(queryKey, { ...data, pages: newPages });
    });

    queryClient.setQueryData(["project", projectId], (old: any) => {
      if (!old) return old;
      return { ...old, isFollowing: newState };
    });

    queryClient.setQueriesData({ queryKey: ["pm-projects"] }, (old: any) => {
      if (!old || !old.projects) return old;
      return {
        ...old,
        projects: old.projects.map((p: any) => 
          p.id === projectId ? { ...p, isFollowing: newState } : p
        )
      };
    });

    try {
      const result = await toggleFollow(projectId);
      if (result.success) {
        router.refresh();

        if (newState) {
          queryClient.invalidateQueries({ queryKey: ["projects"] });
        }
        
        queryClient.invalidateQueries({ queryKey: ["followed-stats"] });
        toast.success(newState ? "Project followed" : "Project unfollowed");
      } else {
        setIsFollowing(prevState);
        window.dispatchEvent(new CustomEvent("sync-follow", { detail: { projectId, isFollowing: prevState } }));
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        queryClient.invalidateQueries({ queryKey: ["pm-projects"] });
        toast.error(result.error || "Failed to update follow status");
      }
    } catch (err: any) {
      console.error("Follow action failed:", err);
      setIsFollowing(prevState);
      window.dispatchEvent(new CustomEvent("sync-follow", { detail: { projectId, isFollowing: prevState } }));
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["pm-projects"] });
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, loading, handleFollow };
}