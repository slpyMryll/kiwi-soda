import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number;
  subtext?: string;
  badge?: string;
}

export function StatCard({ label, value, subtext, badge }: StatCardProps) {
  return (
    <Card className="p-3 sm:p-4 lg:p-6 flex flex-col justify-between border-none shadow-sm rounded-xl sm:rounded-2xl h-full">
      <div className="flex justify-between items-start gap-1">
        <span className="text-xs sm:text-sm font-medium text-gray-400 line-clamp-1">
          {subtext}
        </span>
        {badge && (
          <span className="text-[9px] sm:text-[10px] bg-[#FDEFEF] text-[#EE6055] px-1.5 sm:px-2 py-0.5 rounded-full font-semibold shrink-0">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2 sm:mt-4 text-center">
        <p className="text-xs sm:text-sm font-semibold text-[#153B44]">{label}</p>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#153B44] mt-0.5 sm:mt-1">
          {value}
        </h2>
      </div>
    </Card>
  );
}