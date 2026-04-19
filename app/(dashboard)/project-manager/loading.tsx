export default function PmDashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
        <div>
          <div className="h-8 w-48 sm:w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-32 sm:w-48 bg-gray-200 rounded-md animate-pulse" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto animate-pulse">
          <div className="h-10 w-full sm:w-64 bg-gray-200 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-10 w-full sm:w-32 bg-gray-200 rounded-xl" />
            <div className="h-10 w-full sm:w-32 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-5 sm:p-6 rounded-[24px] border border-gray-200 shadow-sm animate-pulse h-[130px] flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded-md" />
                <div className="h-8 w-16 bg-gray-200 rounded-lg" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 flex flex-col h-[600px] lg:h-[700px] bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 lg:p-8 border border-gray-200 shadow-sm animate-pulse">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div className="h-6 w-40 bg-gray-200 rounded-md" />
            <div className="h-4 w-24 bg-gray-200 rounded-md" />
          </div>
          
          <div className="flex-1 overflow-hidden space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 sm:h-40 w-full bg-gray-50 rounded-2xl border border-gray-100 flex p-4 gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-5 w-3/4 bg-gray-200 rounded-md" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded-md" />
                  <div className="h-2 w-full bg-gray-100 rounded-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px] lg:h-[700px] animate-pulse p-5 sm:p-6">
           <div className="h-6 w-32 bg-gray-200 rounded-md mb-6" />
           
           <div className="space-y-6 flex-1 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded-md" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}