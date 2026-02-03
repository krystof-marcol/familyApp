import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-gray-100 dark:bg-gray-900 animate-pulse rounded-md",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
