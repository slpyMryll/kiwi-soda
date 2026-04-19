"use client";

import dynamic from "next/dynamic";

const SystemReportsChart = dynamic(() => import("./SystemReportsChart").then(mod => mod.SystemReportsChart), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse" />
});

const UserActivityChart = dynamic(() => import("./UserActivityChart").then(mod => mod.UserActivityChart), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse" />
});

interface AdminChartsProps {
  systemReports: any[];
  userRoleData: any[];
}

export function AdminCharts({ systemReports, userRoleData }: AdminChartsProps) {
  return (
    <>
      <SystemReportsChart data={systemReports} />
      <UserActivityChart data={userRoleData} />
    </>
  );
}
