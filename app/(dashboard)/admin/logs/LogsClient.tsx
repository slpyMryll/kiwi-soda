"use client";

import { useState } from "react";
import { Search, Filter, Clock } from "lucide-react";

export function LogsClient({ initialLogs }: { initialLogs: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredLogs = initialLogs.filter((log) => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || log.action_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" placeholder="Search logs by actor or description..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B4332] shadow-sm"
          />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none shadow-sm cursor-pointer"
        >
          <option value="all">All Actions</option>
          <optgroup label="System & Users">
            <option value="USER_ROLE_CHANGED">Role Changes</option>
            <option value="USER_DELETED">User Removals</option>
            <option value="TERM_ACTIVATED">Term Activation</option>
            <option value="TERM_COVER_UPDATED">Cover Changes</option>
          </optgroup>
          <optgroup label="Projects & Transparency">
            <option value="PROJECT_CREATED">Project Creation</option>
            <option value="PROJECT_STATUS_CHANGED">Status Updates</option>
            <option value="PROJECT_DELETED">Project Deletion</option>
          </optgroup>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 text-xs flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{log.profiles?.full_name || "Unknown User"}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-black uppercase border">
                      {log.action_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{log.description}</td>
                </tr>
              )) : (
                 <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No activity logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}