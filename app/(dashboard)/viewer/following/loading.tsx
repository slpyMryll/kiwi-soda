export default function ViewerFollowingLoading() {
  return (
    <main className="mx-auto px-4 lg:px-12 w-full flex-1 relative animate-pulse bg-white">
      
      
      <div className="mb-4 mt-4 space-y-2">
        <div className="h-7 w-56 bg-gray-200 rounded-md" />
        <div className="h-4 w-80 bg-gray-100 rounded-md" />
      </div>

     
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 sm:h-28 bg-gray-100 rounded-2xl border border-gray-200"
          />
        ))}
      </div>

      
      <div className="h-14 w-full bg-gray-100 rounded-2xl mb-6" />

      
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
          >
          
            <div className="h-40 w-full bg-gray-200" />

            <div className="p-5 space-y-4">
             
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/3 bg-gray-100 rounded" />
              </div>

             
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-5/6 bg-gray-100 rounded" />
                <div className="h-3 w-2/3 bg-gray-100 rounded" />
              </div>

            
              <div className="h-2 w-full bg-gray-100 rounded-full" />

            
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-3">
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                </div>

                <div className="h-9 w-28 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}