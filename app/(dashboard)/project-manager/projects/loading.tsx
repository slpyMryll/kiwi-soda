import { Inbox } from "lucide-react";

export default function ProjectsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-26 animate-pulse"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 animate-pulse">
        <div className="flex gap-4 mb-6">
          <div className="h-12 flex-1 bg-gray-100 rounded-xl" />
          <div className="h-12 w-12 bg-gray-100 rounded-xl shrink-0" />
        </div>
        <div className="flex gap-8 border-b border-gray-100 px-4">
          <div className="h-6 w-12 bg-gray-200 rounded mb-2" />
          <div className="h-6 w-16 bg-gray-200 rounded mb-2" />
          <div className="h-6 w-20 bg-gray-200 rounded mb-2" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-70 animate-pulse flex flex-col justify-between"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 w-full">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl shrink-0" />
                  <div className="w-full">
                    <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full shrink-0" />
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-4/5 bg-gray-200 rounded" />
              </div>
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-gray-200 rounded-full" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
