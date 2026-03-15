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
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Trending Topics</h3>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <Badge 
              key={topic}
              variant="secondary" 
              className="bg-surface-accent text-[#2d6a4f] hover:bg-[#d4edda] border-none px-3 py-1.5 cursor-pointer"
            >
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      <div className="p-6 flex-1">
        <h3 className="text-sm font-semibold text-gray-700 mb-6">How it Works</h3>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex gap-4 relative">
              {index < steps.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-10 bg-gray-200" />
              )}
              
              <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-sm font-semibold shrink-0 z-10 shadow-sm">
                {step.id}
              </div>
              
              <div className="pt-1.5">
                <p className="text-sm font-bold text-gray-700">{step.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 bg-surface-accent">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Join the Community</h3>
        <p className="text-xs text-gray-600 mb-4">
          Connect with others who care about sustainable projects
        </p>
        <Button asChild className="w-full bg-[#1B4332] hover:bg-green-900 text-white shadow-sm transition-colors">
          <Link href="/login">
            Get Started
          </Link>
        </Button>
      </div>
    </aside>
  );
}