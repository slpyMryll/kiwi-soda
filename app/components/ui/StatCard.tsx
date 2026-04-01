// app/components/ui/StatCard.tsx
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  subtext?: string;
  badge?: string;
  badgeClassName?: string;
}

export function StatCard({ label, value, subtext, badge, badgeClassName }: StatCardProps) {
  return (
    <Card className="p-4 sm:p-6 flex flex-col justify-between border-none shadow-sm rounded-2xl h-full">
      <div className="flex justify-between items-start gap-2">
        <span className="text-[11px] sm:text-sm font-medium text-gray-400">{subtext}</span>
        {badge && (
          <span className={cn(
            "text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0", 
            badgeClassName || "bg-[#FDEFEF] text-[#EE6055]" // Fallback to original colors if none provided
          )}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4 sm:mt-2 text-center">
        <p className="text-xs sm:text-sm font-semibold text-[#153B44]">{label}</p>
        <h2 className="text-4xl sm:text-5xl font-bold text-[#153B44] mt-1">{value}</h2>
      </div>
    </Card>
  );
}