import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-16" />
      </CardHeader>
      <CardFooter className="flex-col items-start gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-32" />
      </CardFooter>
    </Card>
  );
}
