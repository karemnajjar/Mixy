'use client';

import { useState, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import ClipzViewer from '@/components/clipz/ClipzViewer';
import ClipzCreate from '@/components/clipz/ClipzCreate';
import { Button } from '@/components/shared/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { fetchClipz } from '@/lib/api';

export default function ClipzPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['clipz'],
    queryFn: fetchClipz,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <div className="h-screen bg-black">
      {/* Clipz Viewer */}
      <div className="h-full snap-y snap-mandatory overflow-y-scroll">
        {data?.pages.map((page) =>
          page.clipz.map((clip) => (
            <div key={clip.id} className="snap-start h-full">
              <ClipzViewer clip={clip} />
            </div>
          ))
        )}
        <div ref={ref} className="h-20" />
      </div>

      {/* Create Clipz Button */}
      <Button
        variant="primary"
        className="fixed bottom-20 right-4 rounded-full z-10"
        onClick={() => setIsCreating(true)}
      >
        <PlusIcon className="w-6 h-6" />
      </Button>

      {/* Create Clipz Modal */}
      {isCreating && (
        <ClipzCreate onClose={() => setIsCreating(false)} />
      )}
    </div>
  );
} 