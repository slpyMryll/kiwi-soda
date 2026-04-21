"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  allComments: any[];
  projectId: string;
  isGuest: boolean;
  isManager?: boolean; 
}

export function CommentList({ 
  allComments = [], 
  projectId, 
  isGuest, 
  isManager = false, 
}: CommentListProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const safeComments = Array.isArray(allComments) ? allComments : [];

  const topLevel = safeComments
    .filter((c: any) => !c.parent_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
  const getReplies = (parentId: string) => safeComments
    .filter((c: any) => c.parent_id === parentId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); 

  if (safeComments.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 mt-6 shadow-sm">
        <p className="text-gray-500 text-sm font-medium">No feedback yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      {topLevel.map((comment: any) => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          replies={getReplies(comment.id)} 
          getReplies={getReplies}
          isGuest={isGuest}
          isManager={isManager}
          projectId={projectId}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}