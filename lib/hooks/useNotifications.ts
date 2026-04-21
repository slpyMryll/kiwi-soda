"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: string;
  entity_id: string;
  message: string;
  action_link?: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications(userId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["notifications", userId];

  const { data: notifications = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "notifications", 
        filter: `user_id=eq.${userId}` 
      }, () => {
        queryClient.invalidateQueries({ queryKey });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, queryKey]);

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Notification marked as read");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to mark notification as read");
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const supabase = createClient();
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("All notifications marked as read");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to mark all as read");
    }
  });

  return { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead: markAsReadMutation.mutateAsync, 
    markAllAsRead: markAllAsReadMutation.mutateAsync 
  };
}