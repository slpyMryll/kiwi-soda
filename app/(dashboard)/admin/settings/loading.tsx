export default function AdminSettingsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <div>
        <div className="h-8 w-60 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded-md animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="space-y-6 flex flex-col">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-9 w-32 bg-gray-300 rounded-xl animate-pulse" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 animate-pulse">
              <div className="h-4 w-48 bg-gray-200 rounded-md mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-32 bg-gray-200 rounded-md" />
                  <div className="h-[42px] w-full bg-gray-50 border border-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-9 w-32 bg-gray-300 rounded-xl animate-pulse" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 animate-pulse">
              <div className="h-4 w-40 bg-gray-200 rounded-md mb-4" />
              {[1, 2].map((i) => (
                <div key={i} className="h-[42px] w-full bg-gray-50 border border-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-9 w-32 bg-gray-300 rounded-xl animate-pulse" />
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 flex-1 flex flex-col animate-pulse">
            <div className="h-3 w-64 bg-gray-200 rounded-md mb-2" />
            
            <div className="space-y-6 flex-1 flex flex-col">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 flex flex-col min-h-[160px] space-y-2">
                  <div className="h-3 w-32 bg-gray-200 rounded-md" />
                  <div className="flex-1 w-full bg-gray-50 border border-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}