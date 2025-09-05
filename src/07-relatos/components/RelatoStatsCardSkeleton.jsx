import React from 'react';
import { Skeleton } from '@/01-shared/components/ui/skeleton';

const RelatoStatsCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 h-full flex flex-col justify-between gap-0">
      <div className="flex flex-col justify-between h-full">
        <Skeleton className="h-8 w-1/2" />
      </div>
      <div>
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-2 mt-1">
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
};

export default RelatoStatsCardSkeleton;
