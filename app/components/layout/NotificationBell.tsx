"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Info, BellRing } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell({ userId }: { userId?: string }) {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_link) {
      router.push(notification.action_link);
    }
  };

  if (!userId) return null;

  if (!isMounted) {
    return (
      <div className="p-2 rounded-full relative outline-none">
        <Bell className="w-5 h-5 text-white/80" />
      </div>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="p-2 rounded-full hover:bg-white/10 transition-colors relative outline-none focus:ring-2 focus:ring-white/20">
        <Bell className={cn("w-5 h-5 transition-colors", unreadCount > 0 ? "text-white" : "text-white/80")} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#153B44] animate-in zoom-in"></span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-[calc(100vw-2rem)] sm:w-96 p-0 bg-white rounded-xl shadow-xl border border-gray-200 mt-2 overflow-hidden mx-4 sm:mx-0"
      >
        <div className="flex items-center justify-between p-4 bg-gray-50/80 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#153B44]" />
            <span className="font-bold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-[#153B44] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 &&
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              className="text-xs font-semibold text-[#153B44] hover:text-[#1B4B57] transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          }
        </div>

        <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="bg-gray-50 p-3 rounded-full mb-3">
                <Bell className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-900">All caught up!</p>
              <p className="text-xs text-gray-500 mt-1">You have no new notifications.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-4 cursor-pointer transition-colors border-b border-gray-50 last:border-0 rounded-none",
                    notification.is_read ? "bg-white hover:bg-gray-50" : "bg-blue-50/30 hover:bg-blue-50/50"
                  )}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-0.5 shrink-0">
                      {!notification.is_read ? (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      ) : (
                        <Info className="w-4 h-4 text-gray-400 mt-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-snug break-words", notification.is_read ? "text-gray-600" : "text-gray-900 font-medium")}>
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}