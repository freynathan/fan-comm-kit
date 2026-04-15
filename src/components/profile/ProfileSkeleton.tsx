export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12 animate-pulse">
        {/* Header */}
        <div className="flex items-start justify-between pb-8 border-b border-gray-100">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-gray-200 rounded-lg" />
            <div className="h-9 w-20 bg-gray-200 rounded-lg" />
          </div>
        </div>

        {/* Bio */}
        <div className="py-6 space-y-2">
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
          <div className="h-4 w-1/2 bg-gray-100 rounded" />
        </div>

        {/* Social strip */}
        <div className="flex gap-4 py-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-24 h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 py-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-xl" />
          ))}
        </div>

        {/* Passion tags */}
        <div className="py-6 space-y-3">
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-24 bg-gray-100 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
