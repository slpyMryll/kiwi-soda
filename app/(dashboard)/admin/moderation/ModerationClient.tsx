"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ShieldAlert, EyeOff, Eye, Search } from "lucide-react";
import { toggleCommentVisibility } from "@/lib/actions/moderation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function ModerationClient({ initialComments }: { initialComments: any[] }) {
  const [comments, setComments] = useState(initialComments);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-moderation-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        router.refresh();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleToggleHide = async (id: string, isHidden: boolean) => {
    const currentStatus = !!isHidden; 

    setComments((prev) => 
      prev.map(c => c.id === id ? { ...c, is_hidden: !currentStatus } : c)
    );
    
    await toggleCommentVisibility(id, currentStatus);
  };

  const filteredComments = comments.filter((c) => 
    c.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.projects?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#153B44] flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#1B4332]" />
            Content Moderation
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor all platform feedback and remove inappropriate content.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search comments, users, or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] shadow-sm bg-white"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap sm:whitespace-normal">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4 w-1/2">Comment</th>
                <th className="px-6 py-4">Posted</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComments.length > 0 ? (
                filteredComments.map((comment) => (
                  <tr key={comment.id} className={cn("transition-colors hover:bg-gray-50", comment.is_hidden && "bg-red-50/50")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                          {comment.profiles?.avatar_url ? (
                            <img src={comment.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            comment.profiles?.full_name?.charAt(0) || "U"
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{comment.profiles?.full_name || "Unknown User"}</p>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{comment.profiles?.role || "viewer"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {comment.projects?.title ? (comment.projects.title.length > 25 ? comment.projects.title.substring(0, 25) + "..." : comment.projects.title) : "Unknown Project"}
                      </span>
                    </td>
                    <td className="px-6 py-4 min-w-75">
                      <p className={cn("text-gray-600 line-clamp-2", comment.is_hidden && "text-red-400 line-through")}>
                        {comment.content}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                      {formatDistanceToNow(new Date(comment.created_at))} ago
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleHide(comment.id, comment.is_hidden)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm",
                          comment.is_hidden 
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-600" 
                            : "bg-red-50 hover:bg-red-100 border border-red-100 text-red-600"
                        )}
                      >
                        {comment.is_hidden ? (
                          <><Eye className="w-3.5 h-3.5" /> Unhide</>
                        ) : (
                          <><EyeOff className="w-3.5 h-3.5" /> Hide</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No comments found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}