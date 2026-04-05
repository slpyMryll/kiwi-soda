"use client";

import { useState, useEffect } from "react";
import { Search, MoreVertical, ShieldAlert, Trash2, UserPlus, UserMinus, ShieldCheck, Activity } from "lucide-react";
import { updateUserRole, removeUser } from "@/lib/actions/admin-management";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export function UserManagementClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string, userId: string, role?: string, name: string } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-user-management")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (payload) => {
        setUsers(prev => prev.map(u => u.id === payload.new.id ? { ...u, ...payload.new } : u));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const confirmAction = async () => {
    if (!pendingAction) return;
    
    if (pendingAction.type === 'promote' || pendingAction.type === 'demote') {
      const originalUsers = [...users];
      setUsers(prev => prev.map(u => u.id === pendingAction.userId ? { ...u, role: pendingAction.role } : u));
      
      const result = await updateUserRole(pendingAction.userId, pendingAction.role!);
      if (!result.success) {
        alert(`Failed to update role: ${result.error}`);
        setUsers(originalUsers); 
      }
    } else if (pendingAction.type === 'remove') {
      const result = await removeUser(pendingAction.userId);
      if (result.success) {
        setUsers(prev => prev.filter(u => u.id !== pendingAction.userId));
      } else {
        alert(`Failed to remove user: ${result.error}`);
      }
    }
    
    setIsModalOpen(false);
    setPendingAction(null);
  };

  const filteredUsers = users.filter((u) => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
   <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#153B44] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#1B4332]" /> User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage platform access, roles, and real-time statuses.</p>
        </div>

        <div className="relative w-full sm:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" placeholder="Search by name, email, or role..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1B4332] shadow-sm bg-white"
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("p-2 rounded-full", pendingAction?.type === 'remove' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600")}>
                {pendingAction?.type === 'remove' ? <ShieldAlert className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Action</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to {pendingAction?.type === 'remove' ? 'permanently remove' : pendingAction?.type} <span className="font-bold text-gray-900">{pendingAction?.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
              <button 
                onClick={confirmAction} 
                className={cn("px-4 py-2 text-sm font-bold text-white rounded-xl", pendingAction?.type === 'remove' ? "bg-red-600 hover:bg-red-700" : "bg-[#1B4332] hover:bg-green-900")}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[65vh]">
          <table className="w-full text-left text-sm whitespace-nowrap sm:whitespace-normal">
            <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider sticky top-0 z-10 shadow-[0_1px_0_#e5e7eb]">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                const isOnline = (currentTime - new Date(user.updated_at).getTime()) < 5 * 60 * 1000;

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex justify-center items-center font-bold text-xs overflow-hidden shrink-0">
                          {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : user.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.full_name || "Unknown User"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {user.email || <span className="italic opacity-50">Not provided</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        user.role === "admin" ? "bg-purple-50 text-purple-600" :
                        user.role === "project-manager" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-[#10b981]"
                      )}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full",
                        isOnline ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                      )}>
                        <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400")}></span>
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-lg outline-none">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg p-1 z-[110]">
                            {user.role === 'viewer' ? (
                              <DropdownMenuItem onClick={() => { setPendingAction({ type: 'promote', userId: user.id, role: 'project-manager', name: user.full_name }); setIsModalOpen(true); }} className="gap-2 cursor-pointer focus:bg-blue-50">
                                <UserPlus className="w-4 h-4" /> Promote to PM
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => { setPendingAction({ type: 'demote', userId: user.id, role: 'viewer', name: user.full_name }); setIsModalOpen(true); }} className="gap-2 cursor-pointer focus:bg-orange-50">
                                <UserMinus className="w-4 h-4" /> Demote to Viewer
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem disabled className="gap-2 text-gray-400 cursor-not-allowed">
                              <Activity className="w-4 h-4" /> View Activity Logs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem onClick={() => { setPendingAction({ type: 'remove', userId: user.id, name: user.full_name }); setIsModalOpen(true); }} className="gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                              <Trash2 className="w-4 h-4" /> Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}