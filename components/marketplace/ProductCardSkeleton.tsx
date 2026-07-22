import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="bg-card dark:bg-card-dark border border-border-soft dark:border-border-dark rounded-card overflow-hidden">
      {/* Thumbnail */}
      <Skeleton className="w-full aspect-[16/9] rounded-none" />
      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-3 border-t border-border-soft dark:border-border-dark mt-1">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </div>
  );
}
