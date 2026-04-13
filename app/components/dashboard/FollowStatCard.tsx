import { Folder, Activity, Edit3, TrendingUp } from "lucide-react";

interface FollowedStatsProps {
  complete: number;
  ongoing: number;
  followed: number;
  updates: number;
}

export function FollowedStats({
  complete,
  ongoing,
  followed,
  updates,
}: FollowedStatsProps) {
  const stats = [
    {
      label: "Completed",
      value: complete.toString(),
      icon: Folder,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      label: "Active",
      value: ongoing.toString(),
      icon: Activity,
      color: "Projects",
      bg: "bg-green-100",
    },
    {
      label: "Following",
      value: followed.toString(),
      icon: Edit3,
      color: "text-gray-500",
      bg: "bg-gray-200",
    },
    {
      label: "New Activities",
      value: updates.toString(),
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white p-3 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 mb-0.5 sm:mb-1 truncate">
                {stat.label}
              </p>
              <h3
                className={`text-xl sm:text-3xl font-bold ${stat.label.includes("Progress") ? "text-orange-500" : stat.label.includes("Live") ? "text-green-500" : "text-[#153B44]"}`}
              >
                {stat.value}
              </h3>
            </div>
            <div
              className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}
            >
              <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
