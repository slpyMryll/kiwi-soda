"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    fetchNotifications().then(() => setIsLoading(false));

    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
          } else if (payload.eventType === "UPDATE") {
            const updatedNotif = payload.new as Notification;
            setNotifications((prev) => prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n)));
            setUnreadCount((prevCount) => {
              const oldNotif = payload.old as Notification;
              if (!oldNotif.is_read && updatedNotif.is_read) return Math.max(0, prevCount - 1);
              if (oldNotif.is_read && !updatedNotif.is_read) return prevCount + 1;
              return prevCount;
            });
          } else if (payload.eventType === "DELETE") {
             const deletedNotif = payload.old as Notification;
             setNotifications((prev) => prev.filter(n => n.id !== deletedNotif.id));
             setUnreadCount((prev) => Math.max(0, prev - 1)); // Safely decrement if needed
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
  };

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead };
}