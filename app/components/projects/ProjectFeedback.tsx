import { useRouter } from "next/navigation";

interface ProjectFeedbackProps {
  commentsCount: number;
  isGuest: boolean;
}

export function ProjectFeedback({ commentsCount, isGuest }: ProjectFeedbackProps) {
  const router = useRouter();

  return (
    <section>
      <h2 className="text-lg font-bold text-[#1B4332] mb-4">Student Feedback ({commentsCount})</h2>
      <div className="bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-gray-100">
        {isGuest ? (
          <div className="relative">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFB703] text-black font-bold flex items-center justify-center shrink-0">?</div>
              <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 min-h-25 flex items-center justify-center text-center shadow-sm">
                <p className="text-sm text-gray-400 font-medium cursor-pointer hover:text-gray-600" onClick={() => router.push('/login')}>
                  Please login to leave feedback or follow the project
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
                className="w-full bg-white border border-gray-200 rounded-xl p-4 min-h-25 text-sm focus:outline-none focus:border-[#1B4332] resize-none shadow-sm"
              />
              <div className="flex justify-end mt-3">
                <button className="px-6 py-2 bg-[#1B4332] hover:bg-green-900 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
                  Post Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}