"use client";

import { useState } from "react";
import { MessageSquare, Users } from "lucide-react";
import { CommentList } from "@/app/components/projects/CommentList";

interface FeedbackTabProps {
  projectId: string;
  initialComments: any[];
}

export function FeedbackTab({ projectId, initialComments }: FeedbackTabProps) {
  const [realtimeCount, setRealtimeCount] = useState(
    Array.isArray(initialComments) ? initialComments.length : 0
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#1B4332]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#153B44]">Student Feedback</h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Monitor, moderate, and respond to student thoughts regarding this project.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-700">
              Total Conversations ({realtimeCount})
            </span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <CommentList 
            initialComments={initialComments} 
            projectId={projectId} 
            isGuest={false} 
            onCountChange={setRealtimeCount}
          />
        </div>
      </div>
    </div>
  );
}