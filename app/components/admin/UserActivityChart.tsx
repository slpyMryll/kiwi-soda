"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { UserRoleDataPoint } from "@/types/admin";
import { Card } from "@/components/ui/card";

export function UserActivityChart({ data }: { data: UserRoleDataPoint[] }) {
  return (
    <Card className="p-4 sm:p-6 border-gray-100 shadow-sm rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-0">
        <h3 className="text-sm sm:text-base font-bold text-gray-900">User Activity Role</h3>
        <div className="flex items-center gap-2">
          <div className="w-6 sm:w-8 h-1.5 rounded-full bg-[#8B5CF6]"></div>
          <span className="text-[11px] sm:text-xs font-bold text-gray-900">Current week</span>
        </div>
      </div>
      
      <div className="h-[200px] sm:h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} maxBarSize={120}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="count" fill="#8B5CF6" radius={[16, 16, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}