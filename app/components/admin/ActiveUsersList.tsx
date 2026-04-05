"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ActiveUsersListProps {
  initialUsers: any[];
}

export function ActiveUsersList({ initialUsers }: ActiveUsersListProps) {
  const [users, setUsers] = useState(Array.isArray(initialUsers) ? initialUsers : []);

  useEffect(() => {
    const supabase = createClient();

    const fetchOnlineUsers = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .gte("updated_at", fiveMinutesAgo)
        .neq("role", "admin")
        .order("updated_at", { ascending: false });

      if (data) {
        setUsers(
          data.map((u) => ({
            id: u.id,
            name: u.full_name || "Unknown User",
            status: u.role === "project-manager" ? "Project Manager" : "Viewer",
          }))
        );
      }
    };

    const channel = supabase
      .channel("realtime-online-users")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => {
          fetchOnlineUsers();
        }
      )
      .subscribe();

    const cleanupInterval = setInterval(fetchOnlineUsers, 60 * 1000); 

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <Card className="p-4 sm:p-6 border-gray-100 shadow-sm rounded-xl h-full flex flex-col bg-white">
      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6">Online Users</h3>
      
      <div className="border-b border-dashed border-gray-300 mb-4 sm:mb-6 w-full"></div>
      
      <div className="space-y-4 sm:space-y-5 flex-1 overflow-y-auto pr-1">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.name}</span>
              </div>
              <span className={cn(
                "text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0",
                user.status === "Project Manager" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-[#10b981]"
              )}>
                {user.status}
              </span>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-full">
            <span className="text-xs text-gray-400 font-medium">No users currently online</span>
          </div>
        )}
      </div>
    </Card>
  );
}