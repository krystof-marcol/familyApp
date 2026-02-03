import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col w-full max-w-[92vw] overflow-x-hidden sm:px-4 py-4 lg:h-screen overflow-hidden h-auto">
      <div className="flex-shrink-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-9 w-24 sm:w-28" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-4 flex-shrink-0" />

      <div className="flex flex-col lg:flex-row gap-4 w-full min-w-0 lg:flex-1 lg:overflow-hidden h-auto">
        <div className="flex flex-col gap-4 lg:flex-[0.6] w-full min-w-0 lg:h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-shrink-0">
            <Card className="h-[200px] lg:h-[24vh] border border-primary shadow-sm">
              <CardContent className="flex flex-row justify-between items-end gap-3 sm:gap-4 h-full p-4 sm:p-6">
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </CardContent>
            </Card>

            <Card className="h-[200px] lg:h-[24vh] border border-primary shadow-sm">
              <CardContent className="flex flex-col justify-center items-center h-full p-4 sm:p-6 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          </div>

          <Card className="flex lg:flex-1 h-[400px] lg:h-auto overflow-hidden border border-primary min-h-0">
            <CardContent className="h-full w-full p-2 sm:p-4">
              <div className="space-y-4">
                <div className="flex justify-between pb-2 border-b">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>

                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2"
                  >
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:flex-[0.4] w-full min-w-0 lg:h-full">
          <Card className="h-[300px] lg:h-[40vh] border border-primary">
            <CardContent className="flex justify-center items-center h-full p-4">
              <div className="w-full h-full flex items-end gap-2 px-2 pb-6">
                <Skeleton className="h-[40%] w-full" />
                <Skeleton className="h-[70%] w-full" />
                <Skeleton className="h-[30%] w-full" />
                <Skeleton className="h-[50%] w-full" />
                <Skeleton className="h-[90%] w-full" />
                <Skeleton className="h-[60%] w-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="h-auto lg:flex-1 border border-primary">
            <CardContent className="flex justify-center items-center h-full p-4">
              <Skeleton className="h-40 w-40 rounded-full border-[1.5rem] border-muted/30" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
