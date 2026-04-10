import { getActivityLogs } from "@/lib/actions/system";
import { LogsClient } from "./LogsClient";
import { Activity } from "lucide-react";

interface LogsPageProps {
  searchParams: Promise<{ actorId?: string }>;
}

export default async function ActivityLogsPage({ searchParams }: LogsPageProps) {
  const resolvedParams = await searchParams;
  const logs = await getActivityLogs(resolvedParams.actorId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#153B44] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#1B4332]" /> 
            {resolvedParams.actorId ? "User Activity Logs" : "Platform Activity Logs"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {resolvedParams.actorId 
              ? "Viewing a filtered audit trail for a specific user profile." 
              : "Audit trail of all administrative and organizational actions."}
          </p>
        </div>
        
        <LogsClient initialLogs={logs} />
      </div>
    </div>
  );
}