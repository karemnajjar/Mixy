export function PostSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="p-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="ml-3 space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex space-x-4">
          <div className="w-6 h-6 rounded-full bg-gray-200" />
          <div className="w-6 h-6 rounded-full bg-gray-200" />
          <div className="w-6 h-6 rounded-full bg-gray-200" />
        </div>
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );
} 