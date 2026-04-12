// /lib/hooks/useFollow.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow, getFollowStatus } from "@/lib/actions/follow";

export function useFollow(projectId: string) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null); // null = loading
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const result = await getFollowStatus(projectId);
        setIsFollowing(result.following); // will be true if already in DB
      } catch (err) {
        console.error("Failed to fetch follow status:", err);
        setIsFollowing(false); // fallback
      }
    }

    fetchStatus();
  }, [projectId]);

  const handleFollow = async (isGuest: boolean) => {
    if (isGuest) {
      router.push("/login");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const result = await toggleFollow(projectId);
      if ("following" in result && typeof result.following === "boolean") {
        setIsFollowing(result.following);
      } else if ("error" in result) {
        console.error(result.error);
      }
    } catch (err) {
      console.error("Follow action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, loading, handleFollow };
}