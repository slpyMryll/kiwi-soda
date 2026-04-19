import { AdminStatCard } from "@/app/components/admin/AdminStatCard";
import { ActiveUsersList } from "@/app/components/admin/ActiveUsersList";
import { AdminCharts } from "@/app/components/admin/AdminCharts";
import { getAdminDashboardData } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { stats, systemReports, userRoleData, activeUsers } = await getAdminDashboardData();

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Welcome, Admin</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <AdminStatCard key={idx} title={stat.title} value={stat.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
          <AdminCharts systemReports={systemReports} userRoleData={userRoleData} />
        </div>

        <div className="lg:col-span-1">
          <ActiveUsersList initialUsers={activeUsers} />
        </div>
        
      </div>
    </div>
  );
}