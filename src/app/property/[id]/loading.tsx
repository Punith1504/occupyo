export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 animate-pulse">
      {/* Top Navigation / Breadcrumb Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>

      {/* Hero Image Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="w-full h-[400px] md:h-[500px] bg-gray-200 rounded-3xl"></div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column (Details) */}
          <div className="flex-1 space-y-8">
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>

            <div className="h-px bg-gray-200 w-full"></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="h-16 bg-gray-200 rounded-xl"></div>
              <div className="h-16 bg-gray-200 rounded-xl"></div>
              <div className="h-16 bg-gray-200 rounded-xl"></div>
              <div className="h-16 bg-gray-200 rounded-xl"></div>
            </div>

            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-4 mb-6">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-xl w-full mb-4"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
