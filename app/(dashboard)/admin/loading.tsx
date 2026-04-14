export default function AdminDashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm animate-pulse h-28"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse h-[400px]">
          <div className="h-6 w-48 bg-gray-100 rounded-md mb-8" />
          <div className="h-[250px] w-full bg-gray-50 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse h-[400px]">
          <div className="h-6 w-32 bg-gray-100 rounded-md mb-8" />
          <div className="h-[250px] w-full bg-gray-50 rounded-full" />
        </div>
      </div>
    </div>
  );
}
