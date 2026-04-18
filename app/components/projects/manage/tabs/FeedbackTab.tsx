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
    Array.isArray(initialComments) ? initialComments.length : 0,
  );

  return (
    <div id="feedback" className="flex flex-col gap-6 animate-in fade-in duration-500 scroll-mt-24">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="w-full sm:w-auto">
          <h2 className="text-xl font-bold text-[#153B44]">Student Feedback</h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor, moderate, and respond to student thoughts regarding this
            project.
          </p>
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