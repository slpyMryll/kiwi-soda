export default function AdminGenericLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
        <div className="h-14 bg-gray-50 border-b border-gray-100" />
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-12 w-full bg-gray-50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}