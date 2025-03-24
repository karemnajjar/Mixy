'use client';

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import ExploreGrid from '@/components/explore/ExploreGrid';
import ExploreTrending from '@/components/explore/ExploreTrending';
import ExploreCategories from '@/components/explore/ExploreCategories';
import SearchBar from '@/components/explore/SearchBar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { fetchExploreContent } from '@/lib/api';

type ExploreTab = 'foryou' | 'trending' | 'following' | 'clipz';

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<ExploreTab>('foryou');
  const [searchQuery, setSearchQuery] = useState('');
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['explore', activeTab, searchQuery],
    queryFn: ({ pageParam = 1 }) => 
      fetchExploreContent({ tab: activeTab, query: searchQuery, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search and Categories */}
      <div className="mb-6 space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
        />
        <ExploreCategories />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ExploreTab)}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="foryou">For You</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="clipz">Clipz</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'trending' ? (
          <ExploreTrending />
        ) : (
          <ExploreGrid
            data={data?.pages.flatMap((page) => page.items) || []}
            type={activeTab}
          />
        )}

        {/* Load More Trigger */}
        <div
          ref={ref}
          className="h-20 flex items-center justify-center"
        >
          {isFetchingNextPage && (
            <div className="loader">Loading...</div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 