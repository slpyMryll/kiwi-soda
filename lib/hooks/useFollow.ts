"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow, getFollowStatus } from "@/lib/actions/follow";
import { useQueryClient } from "@tanstack/react-query"; 

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

    try {
      const result = await toggleFollow(projectId);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      } else {
        setIsFollowing(prevState);
        window.dispatchEvent(new CustomEvent("sync-follow", { detail: { projectId, isFollowing: prevState } }));
      }
    } catch (err) {
      console.error("Follow action failed:", err);
      setIsFollowing(prevState);
      window.dispatchEvent(new CustomEvent("sync-follow", { detail: { projectId, isFollowing: prevState } }));
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, loading, handleFollow };
}