
export default function PmTasksLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-56 bg-gray-200 rounded-md animate-pulse" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto animate-pulse">
          <div className="h-10 w-full sm:w-64 bg-gray-200 rounded-xl" />
          <div className="hidden sm:flex h-10 w-20 bg-gray-200 rounded-xl" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm animate-pulse">
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 sm:p-5">
              
              <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-5 w-1/3 min-w-[200px] bg-gray-200 rounded-md" />
                <div className="flex gap-4">
                  <div className="h-3 w-24 bg-gray-100 rounded-md" />
                  <div className="h-3 w-20 bg-gray-100 rounded-md" />
                </div>
              </div>
              
              <div className="hidden sm:block h-8 w-24 bg-gray-200 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}