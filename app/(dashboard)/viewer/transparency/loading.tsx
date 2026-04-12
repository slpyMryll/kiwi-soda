export default function TransparencyLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-96 bg-gray-100 rounded-md" />
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="w-8 h-8 bg-gray-100 rounded-lg mb-4" />
                
                <div className="h-4 w-32 bg-gray-100 rounded mb-2" />
                
                <div className="h-9 w-24 bg-gray-200 rounded-lg mb-1" />
                
                <div className="h-3 w-40 bg-gray-50 rounded" />
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="h-7 w-64 bg-gray-200 rounded-lg mb-4" />
              
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-11/12 bg-gray-100 rounded" />
                <div className="h-4 w-4/5 bg-gray-100 rounded" />
              </div>
            </div>
            
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gray-50 rounded-full opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}