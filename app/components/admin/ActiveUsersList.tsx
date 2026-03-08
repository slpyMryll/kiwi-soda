import { ActiveUser } from "@/types/admin";
import { Card } from "@/components/ui/card";

export function ActiveUsersList({ users }: { users: ActiveUser[] }) {
  return (
    <Card className="p-4 sm:p-6 border-gray-100 shadow-sm rounded-xl h-full flex flex-col">
      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6">Current Active users</h3>
      
      <div className="border-b border-dashed border-gray-300 mb-4 sm:mb-6 w-full"></div>
      
      <div className="space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
        {users.map((user) => (
          <div key={user.id} className="flex justify-between items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-900 truncate flex-1">{user.name}</span>
            <span className="text-[11px] sm:text-sm font-medium text-[#10b981] shrink-0">{user.status}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}