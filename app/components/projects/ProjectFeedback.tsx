"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { postComment } from "@/lib/actions/project";
import { CommentList } from "./CommentList";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProjectFeedbackProps {
  comments: any[];
  projectId: string;
  isGuest: boolean;
}

export function ProjectFeedback({ comments, projectId, isGuest }: ProjectFeedbackProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeComments, setActiveComments] = useState<any[]>(Array.isArray(comments) ? comments : []);
  const [realtimeCount, setRealtimeCount] = useState(activeComments.length);

  useEffect(() => {
    if (isGuest) {
      const fetchGuestComments = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("comments")
          .select("*, profiles(full_name, avatar_url)")
          .eq("project_id", projectId);

        if (data && !error) {
          setActiveComments(data);
          setRealtimeCount(data.length);
        }
      };
      fetchGuestComments();
    } else {
      const safeComments = Array.isArray(comments) ? comments : [];
      setActiveComments(safeComments);
      setRealtimeCount(safeComments.length);
    }
  }, [isGuest, projectId, comments]);

  useEffect(() => {
    if (window.location.hash === '#feedback') {
      const element = document.getElementById('feedback');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    await postComment(projectId, content);
    
    setContent("");
    setIsSubmitting(false);
  };

  return (
    <section id="feedback" className="scroll-mt-24">
      <h2 className="text-lg font-bold text-[#1B4332] mb-4">
        Student Feedback ({realtimeCount})
      </h2>
      
      <div className="bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-gray-100">
        {isGuest ? (
          <div className="relative">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFB703] text-black font-bold flex items-center justify-center shrink-0">?</div>
              <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 min-h-25 flex items-center justify-center text-center shadow-sm">
                <p 
                  className="text-sm text-gray-400 font-medium cursor-pointer hover:text-gray-600 transition-colors" 
                  onClick={() => router.push('/login')}
                >
                  Please login to leave feedback or reply
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pl-11">
              <span className="text-[10px] sm:text-xs text-gray-500">🔒 Login required to engage with projects</span>
              <button disabled className="px-5 py-1.5 bg-gray-200 text-gray-400 rounded-lg text-xs font-bold cursor-not-allowed">
                Post
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white font-bold flex items-center justify-center shrink-0">U</div>
            <div className="flex-1">
              <textarea 
                placeholder="Share your thoughts or feedback..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 min-h-25 text-sm focus:outline-none focus:border-[#1B4332] resize-none shadow-sm"
              />
              <div className="flex justify-end mt-3">
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !content.trim()}
                  className="px-6 py-2 bg-[#1B4332] hover:bg-green-900 text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Posting..." : "Post Feedback"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CommentList 
        initialComments={activeComments} 
        projectId={projectId} 
        isGuest={isGuest} 
        onCountChange={setRealtimeCount} 
      />
    </section>
  );
}