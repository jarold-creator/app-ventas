export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-32" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <Skeleton className="h-6 w-64" />
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="h-64 flex items-end gap-4 px-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${30 + Math.random() * 60}%` }} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonForm() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  )
}