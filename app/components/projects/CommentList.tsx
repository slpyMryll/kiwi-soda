"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CommentItem } from "./CommentItem";

export function CommentList({ initialComments = [], projectId, isGuest }: { initialComments?: any[], projectId: string, isGuest: boolean }) {
  const safeInitial = Array.isArray(initialComments) ? initialComments : [];
  
  const [allComments, setAllComments] = useState<any[]>(safeInitial);
  const supabase = createClient();

  useEffect(() => {
    setAllComments(Array.isArray(initialComments) ? initialComments : []);
  }, [initialComments]);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-comments-${projectId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments', 
        filter: `project_id=eq.${projectId}` 
      }, async (payload) => {
        const { data: newWithProfile } = await supabase
          .from('comments')
          .select('*, profiles(full_name, avatar_url)')
          .eq('id', payload.new.id)
          .single();

        if (newWithProfile) {
          setAllComments((prev) => {
            const safePrev = Array.isArray(prev) ? prev : [];
            if (safePrev.some(c => c.id === newWithProfile.id)) return safePrev;
            return [newWithProfile, ...safePrev];
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId, supabase]);

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
    <div className="space-y-6 mt-8">
      {topLevel.map((comment: any) => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          replies={getReplies(comment.id)} 
          getReplies={getReplies}
          isGuest={isGuest}
          projectId={projectId}
        />
      ))}
    </div>
  );
}