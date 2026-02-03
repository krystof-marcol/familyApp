import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full w-full p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex-1 border rounded-lg p-4">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
