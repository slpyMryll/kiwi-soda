import { useRouter } from "next/navigation";
import { X, ChevronLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectTopBarProps {
  projectId: string;
  tags: string[];
  isGuest: boolean;
  isModal: boolean;
  isPreview?: boolean;
  onClose?: () => void;
}

export function ProjectTopBar({ projectId, tags, isGuest, isModal, isPreview = false, onClose }: ProjectTopBarProps) {
  const router = useRouter();

  const handleFollow = () => {
    if (isPreview) return; 
    if (isGuest) router.push("/login");
    else console.log("Following project:", projectId);
  };

  return (
    <div className="sticky top-0 z-20 flex justify-between items-center p-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center gap-4">
        {!isModal && (
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
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
        <button 
          onClick={handleFollow}
          disabled={isPreview}
          className={`flex items-center gap-1.5 border border-gray-200 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            isPreview 
              ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-70" 
              : "hover:bg-gray-50 text-gray-700"
          }`}
        >
          Follow <Plus className="w-4 h-4" />
        </button>
        
        {isModal && onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}