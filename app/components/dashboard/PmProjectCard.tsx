import { FC } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { PmProjectData } from '@/types/pm';

export const PmProjectCard: FC<PmProjectData> = ({
  title, status, isLive, progress, projectLead, members, deadline, budget,
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-300 flex flex-col gap-4 sm:gap-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-[#153B44] leading-tight">{title}</h3>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${status === 'Active' ? 'bg-[#153B44] text-white' : 'bg-gray-100 text-gray-500'}`}>{status}</span>
            {isLive && (
              <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-[#BFFFE3] text-[#00603B] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00603B] shrink-0" /> Live
              </span>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-[#153B44] shrink-0 mt-1">
          <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <ProgressBar progress={progress} />

      <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-5 pt-4 sm:pt-5 border-t border-gray-100">
        {[
          { label: 'PROJECT LEAD', value: projectLead },
          { label: 'MEMBERS', value: members },
          { label: 'DEADLINE', value: deadline },
          { label: 'BUDGET', value: budget },
        ].map((item, index) => (
          <div key={index} className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">{item.label}</span>
            <span className="text-[12px] sm:text-sm font-semibold text-[#153B44]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};