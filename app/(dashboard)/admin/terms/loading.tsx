export default function AdminTermsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center animate-pulse">
          <div className="h-10 w-full sm:w-64 bg-gray-200 rounded-xl" />
          <div className="h-10 w-full sm:w-40 bg-gray-200 rounded-xl" />
          <div className="hidden sm:block h-10 w-20 bg-gray-200 rounded-xl" />
          <div className="hidden md:block h-10 w-32 bg-gray-300 rounded-xl" />
        </div>
      </div>


      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
        <div className="h-14 bg-gray-50 border-b border-gray-200" /> 
        
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 px-6">

              <div className="flex items-center gap-3 w-1/4 sm:w-1/3">
                <div className="w-8 h-8 rounded-md bg-gray-200 shrink-0" />
                <div className="h-5 w-24 sm:w-40 bg-gray-200 rounded-md" />
              </div>
              
              <div className="w-20">
                <div className="h-6 w-16 bg-gray-200 rounded-md" />
              </div>
              
              <div className="hidden md:block w-1/4">
                <div className="h-4 w-32 bg-gray-200 rounded-md" />
              </div>
              
              <div className="hidden sm:block w-16 text-center">
                <div className="h-5 w-6 bg-gray-200 rounded-md mx-auto" />
              </div>
              
              <div className="w-10 text-right">
                <div className="h-8 w-8 bg-gray-200 rounded-md ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}