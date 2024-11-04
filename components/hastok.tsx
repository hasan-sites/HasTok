import Head from 'next/head';
import { useRouter } from 'next/router';

import { useState, useCallback } from 'react';

import PageHeader from '@/components/PageHeader';
import Footer from '@/components/Footer';

import TiktokVideos from "@/components/tiktok/videos";
import { HasTokProps, TikTokVideoType } from '@/types/tiktok';

import TopLinks from "@/components/topLinks";

const HasTok: React.FC<HasTokProps> = ({ tiktok }) => {
  const router = useRouter();
  const { initialVideos, totalVideos, pageSize, initialSortBy, initialDateFilter, usernames } = tiktok;

  const [videos, setVideos] = useState<TikTokVideoType[]>(initialVideos || []);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'created' | 'plays'>(initialSortBy);
  const [isSwitchingSort, setIsSwitchingSort] = useState(false);
  const [dateFilter, setDateFilter] = useState<'day' | 'week' | 'month' | 'year' | 'all'>(initialDateFilter);

  const fetchVideos = useCallback(async (newSortBy: 'created' | 'plays', newDateFilter: 'day' | 'week' | 'month' | 'year' | 'all') => {
    setIsSwitchingSort(true);
    try {
      const usernamesParam = usernames && usernames.length > 0 ? `&usernames=${usernames.join(',')}` : '';
      const response = await fetch(`/api/videos?page=1&pageSize=${pageSize}&sortBy=${newSortBy}&dateFilter=${newDateFilter}${usernamesParam}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const { videos: newVideos, totalVideos: newTotal } = await response.json();
      setVideos(newVideos);
      setPage(1);
      setHasMore((newVideos?.length || 0) < newTotal);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsSwitchingSort(false);
    }
  }, [pageSize, usernames]);

  const changeSortBy = (newSortBy: 'created' | 'plays') => {
    if (newSortBy !== sortBy) {
      const path = newSortBy === 'created' ? '/date' : '/popular';
      router.push(`${path}/${dateFilter}`);
      setSortBy(newSortBy);
      fetchVideos(newSortBy, dateFilter);
    }
  };

  const changeDateFilter = (newDateFilter: 'day' | 'week' | 'month' | 'year' | 'all') => {
    if (newDateFilter !== dateFilter) {
      const path = sortBy === 'created' ? '/date' : '/popular';
      router.push(`${path}/${newDateFilter}`);
      setDateFilter(newDateFilter);
      fetchVideos(sortBy, newDateFilter);
    }
  };

  const loadMoreVideos = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    try {
      const usernamesParam = usernames && usernames.length > 0 ? `&usernames=${usernames.join(',')}` : '';
      const response = await fetch(`/api/videos?page=${nextPage}&pageSize=${pageSize}&sortBy=${sortBy}&dateFilter=${dateFilter}${usernamesParam}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const { videos: newVideos, totalVideos: newTotal } = await response.json();

      if (newVideos && newVideos.length > 0) {
        setVideos(prevVideos => [...prevVideos, ...newVideos]);
        setPage(nextPage);
        setHasMore((videos.length + newVideos.length) < newTotal);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more videos:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, isLoading, hasMore, videos.length, sortBy, dateFilter, usernames]);

  return (
    <>
      <Head>
        <title>HasTok - HasanAbi Community TikTok Videos</title>
        <meta name="description" content="View and interact with TikTok videos on HasTok" />
      </Head>
      <div className="bg-scanlines bg-custom-purple"> {/* Base background */}
        <PageHeader title="HasTok" />
        <TopLinks />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4 text-center text-white">
            <button
              onClick={() => changeSortBy('created')}
              className={`px-4 py-2 rounded mr-2 ${
                sortBy === 'created' ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
              }`}
              disabled={isSwitchingSort}
            >
              Sort by Date
            </button>
            <button
              onClick={() => changeSortBy('plays')}
              className={`px-4 py-2 rounded ${
                sortBy === 'plays' ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
              }`}
              disabled={isSwitchingSort}
            >
              Sort by Popularity
            </button>
          </div>
          <div className="mb-4 text-center text-white">
            <button
              onClick={() => changeDateFilter('day')}
              className={`px-3 py-1 text-md rounded mr-2 ${
                dateFilter === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
              }`}
              disabled={isSwitchingSort}
            >
              Day
            </button>
            <button
              onClick={() => changeDateFilter('week')}
              className={`px-3 py-1 text-md rounded mr-2 ${
                dateFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
              }`}
              disabled={isSwitchingSort}
            >
              Week
            </button>
            <button
              onClick={() => changeDateFilter('month')}
              className={`px-3 py-1 text-md rounded mr-2 ${
                dateFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
              }`}
              disabled={isSwitchingSort}
            >
              Month
            </button>
            <button
              onClick={() => changeDateFilter('year')}
              className={`px-3 py-1 text-md rounded mr-2 ${
                dateFilter === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
              }`}
              disabled={isSwitchingSort}
            >
              Year
            </button>
            <button
              onClick={() => changeDateFilter('all')}
              className={`px-3 py-1 text-md rounded ${
                dateFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
              }`}
              disabled={isSwitchingSort}
            >
              All
            </button>
          </div>
          <div className="mb-4 text-center text-white">
            Showing <b className="text-lg text-red-500">{videos.length}</b> of <b className="text-lg text-red-500">{totalVideos}</b> videos
          </div>
          {isSwitchingSort ? (
            <div className="text-center text-white">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <p className="mt-2">Switching sort order...</p>
            </div>
          ) : isLoading && videos.length === 0 ? (
            <div className="text-center text-white">Loading...</div>
          ) : (
            <TiktokVideos feed={videos} />
          )}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
                onClick={loadMoreVideos}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
          <div className="mt-3 mb-4 text-center text-white">
            Showing <b className="text-lg text-red-500">{videos.length}</b> of <b className="text-lg text-red-500">{totalVideos}</b> videos
          </div>
          {!hasMore && videos.length < totalVideos && (
            <p className="mt-8 text-center text-white">
              You have seen all {totalVideos} videos
            </p>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default HasTok;