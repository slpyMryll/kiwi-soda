"use client";

import { Plus, BarChart2, TrendingUp, X } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const teamData = [
  { name: "John", Completed: 12, Assigned: 15 },
  { name: "Maria", Completed: 18, Assigned: 20 },
  { name: "Ana", Completed: 10, Assigned: 12 },
  { name: "David", Completed: 8, Assigned: 10 },
  { name: "Sarah", Completed: 14, Assigned: 18 },
];

const budgetData = [
  { name: "Jan W1", allocated: 30000, spent: 15000 },
  { name: "Jan W2", allocated: 50000, spent: 30000 },
  { name: "Jan W3", allocated: 70000, spent: 45000 },
  { name: "Jan W4", allocated: 90000, spent: 65000 },
  { name: "Feb W1", allocated: 110000, spent: 85000 },
  { name: "Feb W2", allocated: 130000, spent: 98000 },
];

export function ChartsTab() {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Progress Visualization
        </h2>
        <button className="flex items-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Chart
        </button>
      </div>

      <div className="border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-bold text-gray-700 mb-3">
          Select Charts to Display
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
              <BarChart2 className="w-4 h-4 text-[#1B4332]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Team Performance
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Compare team member task completion rates
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Budget vs Spending
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Monitor budget allocation and actual spending
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border border-gray-200 rounded-xl p-4 sm:p-6 bg-gray-50/30">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
          <button className="absolute top-4 right-4 p-1 rounded-md bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <h3 className="text-sm font-bold text-gray-800 mb-6">
            Team Performance
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={teamData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  iconType="square"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "20px" }}
                />
                <Bar
                  dataKey="Completed"
                  fill="#1B4332"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="Assigned"
                  fill="#EAB308"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
          <button className="absolute top-4 right-4 p-1 rounded-md bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <h3 className="text-sm font-bold text-gray-800 mb-6">
            Budget vs Spending
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={budgetData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  ticks={[0, 35000, 70000, 105000, 140000]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "20px" }}
                />
                <Line
                  type="linear"
                  dataKey="allocated"
                  name="Budget Allocated"
                  stroke="#1B4332"
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: "#fff",
                    stroke: "#1B4332",
                    strokeWidth: 2,
                  }}
                />
                <Line
                  type="linear"
                  dataKey="spent"
                  name="Actual Spent"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: "#fff",
                    stroke: "#EF4444",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
