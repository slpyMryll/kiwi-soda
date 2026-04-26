import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentRailProps } from '@/types/content-rail';
import { HOW_IT_WORKS_STEPS } from '@/lib/constants/mock-data';
import Link from 'next/link'; 

interface ExtendedProps extends ContentRailProps {
  isMobile?: boolean;
}

export function ContentRail({ 
  trendingTopics = [], 
  steps = HOW_IT_WORKS_STEPS,
  isMobile = false 
}: ExtendedProps) {
  
  return (
    <aside className={isMobile 
      ? "w-full flex flex-col bg-white" 
      : "w-64 border-r border-gray-200 bg-white flex flex-col h-[calc(100vh-72px)] sticky top-18"
    }>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Trending Topics</h3>
        {trendingTopics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <Badge 
                key={topic}
                variant="secondary" 
                className="bg-surface-accent text-[#2d6a4f] hover:bg-[#d4edda] border-none px-3 py-1.5 cursor-pointer transition-colors"
              >
                {topic}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No trending topics yet</p>
        )}
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <h3 className="text-sm font-semibold text-gray-700 mb-6 uppercase tracking-wider">How it Works</h3>
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex gap-4 relative">
              {index < steps.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-12 bg-gray-100" />
              )}
              
              <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-sm font-bold shrink-0 z-10 shadow-sm">
                {step.id}
              </div>
              
              <div className="pt-0.5">
                <p className="text-sm font-bold text-gray-900 leading-tight">{step.label}</p>
                {step.description && (
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 bg-surface-accent">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Join the Community</h3>
        <p className="text-[11px] text-gray-600 mb-4 leading-relaxed">
          Follow projects, receive live updates, and contribute to student-led initiatives.
        </p>
        <Button asChild className="w-full bg-[#1B4332] hover:bg-green-900 text-white shadow-sm transition-all active:scale-95 font-bold text-xs py-5 rounded-xl">
          <Link href="/login">
            Get Started
          </Link>
        </Button>
      </div>
    </aside>
  );
}
