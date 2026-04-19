export default function PmBudgetLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto animate-pulse">
          <div className="h-10 w-full sm:w-64 bg-gray-200 rounded-xl" />
          <div className="hidden sm:flex h-10 w-20 bg-gray-200 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm animate-pulse h-56 flex flex-col">
            
            <div className="flex gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-5 w-3/4 bg-gray-200 rounded-md" />
                <div className="h-4 w-1/2 bg-gray-100 rounded-md" />
              </div>
            </div>
            
            <div className="mt-auto space-y-3">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-gray-100 rounded-md" />
                  <div className="h-4 w-24 bg-gray-200 rounded-md" />
                </div>
                <div className="h-4 w-12 bg-gray-200 rounded-md" />
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full" />
              <div className="h-6 w-24 bg-gray-200 rounded-full mt-2" />
            </div>
            
          </div>
        ))}
      </div>
      
    </div>
  );
}