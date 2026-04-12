export default function ViewerFollowingLoading() {
  return (
    <main className="mx-auto px-4 lg:px-24 w-full flex-1 relative animate-pulse">
      <div className="relative w-full h-48 md:h-64 rounded-b-2xl bg-gray-200 mb-8 shadow-sm" />

      <div className="mb-2 mt-4 space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        <div className="h-4 w-48 bg-gray-100 rounded-md" />
      </div>

      <div className="h-16 w-full bg-gray-100 rounded-2xl mb-8" />

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-112.5 sm:h-100"
          >
            <div className="h-48 w-full bg-gray-200" />

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-7 w-3/4 bg-gray-200 rounded-lg" />
                <div className="h-4 w-1/4 bg-gray-100 rounded-md" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded" />
                <div className="h-4 w-5/6 bg-gray-100 rounded" />
              </div>

              <div className="h-14 w-full bg-gray-50 rounded-xl border border-gray-100" />

              <div className="h-2 w-full bg-gray-100 rounded-full" />

              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-4">
                  <div className="h-5 w-16 bg-gray-100 rounded" />
                  <div className="h-5 w-16 bg-gray-100 rounded" />
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        ))}

        <div className="text-center py-10 space-y-1">
          <div className="mx-auto h-3 w-32 bg-gray-100 rounded" />
          <div className="mx-auto h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    </main>
  );
}

