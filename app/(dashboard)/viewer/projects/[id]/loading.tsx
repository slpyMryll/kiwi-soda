export default function ViewerProjectDetailLoading() {
  return (
    <div className="flex flex-col bg-white min-h-screen animate-pulse">
      <div className="h-14 w-full border-b border-gray-100 flex items-center px-6 justify-between">
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-8 w-8 bg-gray-100 rounded-full" />
      </div>

      <div className="w-full h-48 sm:h-64 bg-gray-200" />
      <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-10">
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
          <div className="h-4 w-1/4 bg-gray-100 rounded-md" />
          <div className="h-2.5 w-full bg-gray-100 rounded-full mt-6" />
        </div>

        <div className="space-y-3">
          <div className="h-6 w-40 bg-gray-200 rounded-md" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-2/3 bg-gray-100 rounded" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded-md" />
          <div className="space-y-6 pl-4 border-l-2 border-gray-100">
            {[1, 2].map((i) => (
              <div key={i} className="relative space-y-2">
                <div className="absolute -left-5.25 top-0 w-4 h-4 rounded-full bg-gray-200 border-2 border-white" />
                <div className="h-4 w-48 bg-gray-100 rounded" />
                <div className="h-3 w-24 bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-6 w-36 bg-gray-200 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-24 bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-6 w-32 bg-gray-300 rounded" />
            </div>
            <div className="h-24 bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-6 w-32 bg-gray-300 rounded" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded-md" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-2 w-16 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded-md" />
          <div className="h-24 w-full bg-gray-50 rounded-xl border border-gray-100" />
        </div>
      </div>
    </div>
  );
}
