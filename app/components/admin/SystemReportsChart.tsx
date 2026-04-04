"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";

export function SystemReportsChart({ data }: { data: any[] }) {
  return (
    <Card className="p-4 sm:p-6 border-gray-100 shadow-sm rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-0">
        <h3 className="text-sm sm:text-base font-bold text-gray-900">Platform Engagement</h3>
        <div className="flex items-center gap-2">
          <div className="w-6 sm:w-8 h-1.5 rounded-full bg-[#8B5CF6]"></div>
          <span className="text-[11px] sm:text-xs font-bold text-gray-900">Comments</span>
        </div>
      </div>
      
      <div className="h-[200px] sm:h-[250px] lg:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} minTickGap={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip 
              labelStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
              formatter={(value) => [value, "Comments"]}
            />
            <Area type="monotone" dataKey="reports" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorReports)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}