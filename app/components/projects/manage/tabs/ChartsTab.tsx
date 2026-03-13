"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Users,
  Wallet,
  Target,
  TrendingUp,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

export function ChartsTab({ project }: { project: any }) {
  const [showSelector, setShowSelector] = useState(false);
  const [activeCharts, setActiveCharts] = useState<string[]>([
    "team-performance",
    "budget-vs-spending",
  ]);

  const teamPerformanceData = (project.members || [])
    .map((m: any) => {
      const memberTasks = (project.tasks || []).filter(
        (t: any) => t.assigned_to === m.id || t.assignee === m.name,
      );
      return {
        name: m.name.split(" ")[0],
        Completed: memberTasks.filter((t: any) => t.status === "Completed")
          .length,
        Assigned: memberTasks.length,
      };
    })
    .filter((d: any) => d.Assigned > 0);

  const budgetVsSpendingData = [
    {
      name: "Project Budget",
      "Total Budget": project.totalBudget || 0,
      "Spent Budget": project.spentBudget || 0,
    },
  ];

  const milestoneData = (project.milestones || []).map((m: any) => ({
    name: m.title.length > 12 ? m.title.substring(0, 12) + "..." : m.title,
    progress: m.progress || 0,
    fullTitle: m.title,
  }));

  const timelineData = (project.budgetUpdates || [])
    .slice()
    .reverse()
    .map((log: any) => ({
      date: new Date(log.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      balance: log.newTotal,
    }));

  const AVAILABLE_CHARTS = [
    {
      id: "team-performance",
      title: "Team Performance",
      icon: Users,
      description: "Track assigned vs. completed tasks for each team member.",
    },
    {
      id: "budget-vs-spending",
      title: "Budget vs Spending",
      icon: Wallet,
      description:
        "Compare the total allocated budget against the current spending.",
    },
    {
      id: "milestone-progress",
      title: "Milestone Progress",
      icon: Target,
      description: "Track the completion percentage of each milestone.",
    },
    {
      id: "budget-timeline",
      title: "Budget Timeline",
      icon: TrendingUp,
      description: "Visualize the project balance over time.",
    },
  ];

  const handleToggleChart = (id: string) => {
    if (activeCharts.includes(id)) {
      setActiveCharts((prev) => prev.filter((chartId) => chartId !== id));
    } else {
      setActiveCharts((prev) => [...prev, id]);
    }
  };

  const renderChartContent = (id: string) => {
    switch (id) {
      case "team-performance":
        if (teamPerformanceData.length === 0)
          return (
            <EmptyChartState message="No tasks assigned to team members yet." />
          );
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={teamPerformanceData}
              margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                allowDecimals={false}
              />
              <RechartsTooltip
                cursor={{ fill: "#F3F4F6" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Bar
                dataKey="Assigned"
                fill="#EAB308"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="Completed"
                fill="#1B4332"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "budget-vs-spending":
        if (project.totalBudget === 0)
          return (
            <EmptyChartState message="No budget assigned to this project." />
          );
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={budgetVsSpendingData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickFormatter={(value) =>
                  `₱${value >= 1000 ? (value / 1000).toFixed(0) + "k" : value}`
                }
              />
              <RechartsTooltip
                cursor={{ fill: "#F3F4F6" }}
                formatter={(value: any) =>
                  `₱${Number(value || 0).toLocaleString()}`
                }
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              {/* THE FIX: Changed Total Budget to #1B4332 (Dark Green) and Spent Budget to #EF4444 (Red) */}
              <Bar
                dataKey="Total Budget"
                fill="#1B4332"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="Spent Budget"
                fill="#EF4444"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "milestone-progress":
        if (milestoneData.length === 0)
          return <EmptyChartState message="No milestones created yet." />;
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={milestoneData}
              margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                domain={[0, 100]}
              />
              <RechartsTooltip
                cursor={{ fill: "#F3F4F6" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: any) => [`${value}%`, "Progress"]}
              />
              <Bar
                dataKey="progress"
                fill="#1B4332"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "budget-timeline":
        if (timelineData.length === 0)
          return <EmptyChartState message="No budget history available." />;
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={timelineData}
              margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B4332" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                dy={10}
              />
              <YAxis hide domain={["auto", "auto"]} />
              <RechartsTooltip
                formatter={(value: any) =>
                  `₱${Number(value || 0).toLocaleString()}`
                }
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#1B4332"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#153B44]">
            Project Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Visualize your project's performance and budget data.
          </p>
        </div>
        <button
          onClick={() => setShowSelector(!showSelector)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${showSelector ? "bg-gray-100 text-gray-700" : "bg-[#1B4332] hover:bg-green-900 text-white shadow-sm"}`}
        >
          {showSelector ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {showSelector ? "Close Menu" : "Add Chart"}
        </button>
      </div>

      {showSelector && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-in slide-in-from-top-4 fade-in duration-200">
          <h3 className="text-sm font-bold text-[#153B44] uppercase tracking-wider mb-4">
            Select Charts to Display
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {AVAILABLE_CHARTS.map((chart) => {
              const Icon = chart.icon;
              const isActive = activeCharts.includes(chart.id);
              return (
                <div
                  key={chart.id}
                  onClick={() => handleToggleChart(chart.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-3 ${isActive ? "border-[#1B4332] bg-[#E6F4EA]" : "border-gray-100 hover:border-green-300 hover:bg-gray-50"}`}
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`p-2 rounded-lg ${isActive ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-500"}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-[#1B4332] mt-2" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {chart.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {chart.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeCharts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <LayoutDashboard className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Your dashboard is empty
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Click "Add Chart" above to select visualizations and build your
            custom project dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeCharts.map((chartId) => {
            const chartConfig = AVAILABLE_CHARTS.find((c) => c.id === chartId);
            if (!chartConfig) return null;

            return (
              <div
                key={chartId}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#E6F4EA] rounded-lg text-[#1B4332]">
                      <chartConfig.icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">
                      {chartConfig.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleToggleChart(chartId)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Remove Chart"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {renderChartContent(chartId)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="h-[300px] flex items-center justify-center flex-col text-center px-4">
      <BarChart3 className="w-8 h-8 text-gray-200 mb-3" />
      <p className="text-sm font-semibold text-gray-400">{message}</p>
    </div>
  );
}
