"use client";

import { useRouter } from "next/navigation";
import { X, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "../ui/followButton";

interface ProjectTopBarProps {
  projectId: string;
  tags: string[];
  isGuest: boolean;
  isModal: boolean;
  isPreview?: boolean;
  onClose?: () => void;
  initialIsFollowing?: boolean;
}

export function ProjectTopBar({ 
  projectId, 
  tags, 
  isGuest, 
  isModal, 
  isPreview = false, 
  onClose,
  initialIsFollowing 
}: ProjectTopBarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-20 flex justify-between items-center p-4 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-4">
        {!isModal && (
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Feed
          </button>
        )}
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600 border-none shadow-none">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {!isPreview && (
          <div className="w-24">
             <FollowButton 
               projectId={projectId} 
               isGuest={isGuest}
               initialIsFollowing={initialIsFollowing}
               className="w-full !py-2" 
             />
          </div>
        )}
        
        {isModal && onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}