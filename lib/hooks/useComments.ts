"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectComments } from "@/lib/actions/project-details";
import { postComment, editComment, deleteComment } from "@/lib/actions/project";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

export function useComments(projectId: string, initialComments?: any[]) {
  const queryClient = useQueryClient();
  const queryKey = ["comments", projectId];

  const { data: comments = initialComments || [] } = useQuery({
    queryKey,
    queryFn: () => getProjectComments(projectId),
    initialData: initialComments && initialComments.length > 0 ? initialComments : undefined,
    staleTime: 1000 * 60, // 1 minute
  });

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-comments-${projectId}`)
      .on('postgres_changes', { 
        event: '*',
        schema: 'public', 
        table: 'comments', 
        filter: `project_id=eq.${projectId}` 
      }, () => {
        queryClient.invalidateQueries({ queryKey });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId, queryClient, queryKey]);

  const addMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string, parentId?: string }) => 
      postComment(projectId, content, parentId || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Comment posted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post comment");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string, content: string }) => 
      editComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Comment updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update comment");
    }
  });

  const removeMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Comment deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete comment");
    }
  });

  return {
    comments,
    addComment: addMutation.mutateAsync,
    updateComment: updateMutation.mutateAsync,
    deleteComment: removeMutation.mutateAsync,
    isSubmitting: addMutation.isPending || updateMutation.isPending || removeMutation.isPending,
  };
}
