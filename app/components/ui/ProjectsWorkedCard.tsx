"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { ProjectsWorkedDataPoint } from "@/types/pm";

interface Props {
  data: ProjectsWorkedDataPoint[];
}

export function ProjectsWorkedCard({ data }: Props) {
  return (
    <Card className="p-4 sm:p-6 border-none shadow-sm rounded-2xl h-full flex flex-col justify-center">
      <h3 className="text-sm font-bold text-[#153B44] mb-4 text-center sm:text-left">Projects Worked</h3>
      
      <div className="flex flex-col min-[450px]:flex-row items-center justify-center gap-6 min-[450px]:gap-0 h-full w-full">
        
        <div className="w-full min-[450px]:w-1/2 h-[120px] sm:h-[150px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={45}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-bold text-[#153B44]">{data.length}</span>
            <span className="text-[10px] text-gray-400">projects</span>
          </div>
        </div>

        <div className="w-full min-[450px]:w-1/2 space-y-2 pl-0 min-[450px]:pl-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] sm:text-xs text-gray-500 truncate">{item.name}</span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[#153B44] shrink-0">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}