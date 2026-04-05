import { getActivityLogs } from "@/lib/actions/system";
import { LogsClient } from "./LogsClient";

export default async function ActivityLogsPage() {
  const logs = await getActivityLogs();

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#153B44]">Activity Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Audit trail of all administrative and organizational actions.</p>
        </div>
        <LogsClient initialLogs={logs} />
      </div>
    </div>
  );
}