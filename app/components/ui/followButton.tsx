"use client";
import { Plus, Check } from "lucide-react";
import { useFollow } from "@/lib/hooks/useFollow";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  projectId: string;
  isGuest: boolean;
  initialIsFollowing?: boolean;
  className?: string;
}

export function FollowButton({ projectId, isGuest, initialIsFollowing, className }: FollowButtonProps) {
  const { isFollowing, loading, handleFollow } = useFollow(projectId, initialIsFollowing);

  if (isFollowing === null) {
    return (
      <button
        disabled
        className={cn(
          "flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/20 text-transparent animate-pulse z-10",
          className
        )}
      >
        Follow <Plus className="w-3 h-3 opacity-0" />
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFollow(isGuest);
      }}
      disabled={loading}
      className={cn(
        "flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 z-10",
        isFollowing 
          ? "bg-[#1B4332] text-white hover:bg-green-900 shadow-sm" 
          : "bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm",
        className
      )}
    >
      {isFollowing ? (
        <>
          <Check className="w-3 h-3" /> Following
        </>
      ) : (
        <>
          Follow <Plus className="w-3 h-3" />
        </>
      )}
    </button>
  );
}