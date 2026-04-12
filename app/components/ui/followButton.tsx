"use client";
import { Plus } from "lucide-react";
import { useFollow } from "@/lib/hooks/useFollow";

interface FollowButtonProps {
  projectId: string;
  isGuest: boolean;
  
}

export function FollowButton({ projectId, isGuest}: FollowButtonProps) {
  const { isFollowing, loading, handleFollow } = useFollow(projectId);

  if (isFollowing === null) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleFollow(isGuest);
      }}
      disabled={loading}
      className={`absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors z-10 ${
        isFollowing ? "bg-black/40 text-white hover:bg-black/60" : "bg-black/40 text-white hover:bg-black/60"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
      {!isFollowing && <Plus className="w-3 h-3" />}
    </button>
  );
}