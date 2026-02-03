import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-3xl mx-auto py-6 px-4 md:py-10 md:px-6">
        <Skeleton className="h-8 w-40 mb-6 md:mb-8" />

        <div className="space-y-6 md:space-y-8">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-gray-100 dark:border-gray-800 gap-4"
            >
              <div className="space-y-2 w-full md:w-2/3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full max-w-[300px]" />
              </div>

              <div className="w-full md:w-auto flex justify-start md:justify-end">
                <Skeleton
                  className={`h-9 ${i % 2 === 0 ? "w-24" : "w-12 rounded-full"}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
