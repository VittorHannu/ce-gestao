import React from 'react';
import { Skeleton } from '@/01-shared/components/ui/skeleton';

const TotalReportsCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 h-full flex flex-col justify-between gap-2">
      <div>
        <Skeleton className="h-8 w-1/2" />
      </div>
      <Skeleton className="h-6 w-3/4" />
    </div>
  );
};

export default TotalReportsCardSkeleton;
