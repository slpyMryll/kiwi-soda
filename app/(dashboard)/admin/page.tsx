import { AdminStatCard } from "@/app/components/admin/AdminStatCard";
import { SystemReportsChart } from "@/app/components/admin/SystemReportsChart";
import { UserActivityChart } from "@/app/components/admin/UserActivityChart";
import { ActiveUsersList } from "@/app/components/admin/ActiveUsersList";

import { 
  MOCK_ADMIN_STATS, 
  MOCK_SYSTEM_REPORTS, 
  MOCK_USER_ACTIVITY, 
  MOCK_ACTIVE_USERS 
} from "@/lib/constants/admin-mock-data";

export default function AdminDashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Welcome, Juan</h1>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {MOCK_ADMIN_STATS.map((stat, idx) => (
          <AdminStatCard key={idx} title={stat.title} value={stat.value} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column (Charts) */}
        <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
          <SystemReportsChart data={MOCK_SYSTEM_REPORTS} />
          <UserActivityChart data={MOCK_USER_ACTIVITY} />
        </div>

        {/* Right Column (Active Users) */}
        <div className="lg:col-span-1">
          <ActiveUsersList users={MOCK_ACTIVE_USERS} />
        </div>
        
      </div>
    </div>
  );
}