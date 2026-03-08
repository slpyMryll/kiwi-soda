"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Share2, ArrowRight, Plus, Wallet, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "../ui/ProgressBar";
import { ProjectCardProps} from "@/types/projects";

export function ProjectCard({ project, userRole = 'guest' }: ProjectCardProps) {
  const router = useRouter();
  
  const isGuest = userRole === 'guest';

  const handleAction = (e: React.MouseEvent) => {
    if (isGuest) {
      e.preventDefault();
      router.push("/login");
    } else {
      console.log("Action clicked by authenticated user");
    }
  };

  const formattedPostedDate = new Date(project.postedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const formattedDeadline = new Date(project.deadline).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <article className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      
      <div className="relative h-48 w-full bg-gray-100">
        <img 
          src={project.imageUrl || "/project-car-place.jpg"} 
          alt={project.title} 
          className="w-full h-full object-cover" 
        />
        
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 pr-20">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border-none">
              {tag}
            </Badge>
          ))}
          
          {(userRole === 'project-manager' || userRole === 'admin') && (
            <Badge variant="secondary" className="bg-white/95 text-[#1B4332] border-none shadow-sm">
              {project.status} • {project.liveStatus}
            </Badge>
          )}
        </div>
        
        <button 
          onClick={handleAction} 
          className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors z-10"
        >
          {project.isFollowing ? 'Following' : 'Follow'} <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{project.title}</h2>
        <p className="text-xs text-gray-500 mb-4">Posted on {formattedPostedDate}</p>
        <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {(userRole === 'project-manager' || userRole === 'admin') && (
          <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#1B4332]" />
              <span className="font-medium">
                ₱{project.spentBudget.toLocaleString()} <span className="text-gray-400">/ ₱{project.totalBudget.toLocaleString()}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{project.membersCount} Members</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="font-medium">Due {formattedDeadline}</span>
            </div>
          </div>
        )}

        <ProgressBar progress={project.progress} />

        <hr className="border-gray-100 mb-4" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <button onClick={handleAction} className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{project.commentsCount} <span className="hidden min-[375px]:inline">Comments</span></span>
            </button>
            <button onClick={handleAction} className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
          
          <button onClick={handleAction} className="w-full sm:w-auto flex justify-center items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
            Read More <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}