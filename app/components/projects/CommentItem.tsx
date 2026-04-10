"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ShieldAlert } from "lucide-react";
import { postComment } from "@/lib/actions/project";
import { cn } from "@/lib/utils";

interface CommentItemProps {
  comment: any;
  replies: any[];
  isGuest: boolean;
  projectId: string;
  depth?: number;
  getReplies: (parentId: string) => any[]; 
}

export function CommentItem({ comment, replies, isGuest, projectId, depth = 0, getReplies }: CommentItemProps) {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isHidden = comment.is_hidden;

  const handleReply = async () => {
    if (!replyContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await postComment(projectId, replyContent, comment.id);
    setReplyContent("");
    setIsReplyOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div className={cn("flex flex-col gap-2 sm:gap-3 animate-in fade-in zoom-in-95", depth > 0 && "ml-3 sm:ml-8 mt-3 border-l-2 border-gray-100 pl-3 sm:pl-4")}>
      <div className={cn(
        "flex gap-2 sm:gap-3 p-3 sm:p-4 bg-white border rounded-2xl shadow-sm transition-shadow",
        isHidden ? "border-red-100 bg-red-50/20" : "border-gray-100 hover:shadow-md"
      )}>
        <div className={cn(
          "w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white font-bold flex items-center justify-center shrink-0 text-[10px] sm:text-xs overflow-hidden",
          isHidden ? "bg-red-200" : "bg-[#1B4332]"
        )}>
          {!isHidden && comment.profiles?.avatar_url ? (
            <img src={comment.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            isHidden ? <ShieldAlert className="w-4 h-4 text-red-500" /> : (comment.profiles?.full_name?.charAt(0) || "U")
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className={cn("text-xs sm:text-sm font-bold truncate pr-2", isHidden ? "text-red-500" : "text-gray-900")}>
              {isHidden ? "System Administrator" : (comment.profiles?.full_name || "Student")}
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
              {formatDistanceToNow(new Date(comment.created_at))} ago
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed wrap-break-word">
            {isHidden ? (
              <span className="italic text-gray-400 font-medium">This comment was removed by a platform administrator for violating community guidelines.</span>
            ) : (
              comment.content
            )}
          </p>
          
          {!isHidden && (
            <div className="flex gap-4 mt-2 sm:mt-3">
              <button 
                onClick={() => isGuest ? window.location.href = '/login' : setIsReplyOpen(!isReplyOpen)}
                className="text-[11px] sm:text-xs font-semibold text-gray-400 hover:text-[#1B4332] flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Reply
              </button>
            </div>
          )}

          {isReplyOpen && !isHidden && (
            <div className="mt-3 flex flex-col gap-2 animate-in slide-in-from-top-2">
              <textarea 
                autoFocus
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm focus:outline-none focus:border-[#1B4332] resize-none"
                placeholder="Write a reply..."
                value={replyContent}
                rows={2}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-1">
                <button 
                  onClick={() => setIsReplyOpen(false)} 
                  className="px-3 py-1.5 text-[11px] sm:text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReply} 
                  disabled={isSubmitting || !replyContent.trim()}
                  className="px-3 sm:px-4 py-1.5 bg-[#1B4332] hover:bg-green-900 text-white rounded-md text-[11px] sm:text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {replies?.map((reply: any) => (
        <CommentItem 
          key={reply.id} 
          comment={reply} 
          replies={getReplies(reply.id)} 
          getReplies={getReplies}
          isGuest={isGuest} 
          projectId={projectId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}