import { Check, Clock } from "lucide-react";
import { ProjectMilestone } from "@/types/projects";

interface ProjectTimelineProps {
  milestones?: ProjectMilestone[];
}

export function ProjectTimeline({ milestones = [] }: ProjectTimelineProps) {
  if (!milestones || milestones.length === 0) return null;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Proposed":
      case "Approved":
      case "Completed":
        return {
          bg: "bg-[#52B788]",
          text: "text-[#1B4332]",
          icon: <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" strokeWidth={3} /></div>
        };
      case "In Execution":
        return {
          bg: "bg-[#FFB703]",
          text: "text-[#1B4332]",
          icon: <Clock className="w-4 h-4 text-[#1B4332]" strokeWidth={2.5} />
        };
      case "Pending":
      default:
        return {
          bg: "bg-[#E2E8F0]",
          text: "text-[#1B4332] opacity-60",
          icon: null
        };
    }
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-[#1B4332] mb-6">Project Timeline</h2>
      <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-4">
        
        {milestones.map((milestone) => {
          const style = getStatusStyles(milestone.status);
          
          return (
            <div key={milestone.id} className="relative pl-8">
              <div className={`absolute -left-4.25 top-0.5 ${style.bg} w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm`}>
                {style.icon}
              </div>
              <div>
                <h4 className={`font-bold text-sm ${style.text}`}>{milestone.title}</h4>
                <p className={`text-xs mt-0.5 ${milestone.status === 'Pending' ? 'text-gray-500 opacity-60' : 'text-gray-500'}`}>
                  {milestone.dateString}
                </p>
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
}