import Head from "next/head";
import { useState, useCallback, useEffect } from 'react';
import PageHeader from "@/components/PageHeader";
import TikTokUsers from "@/components/TikTokUsers";
import TopLinks from "@/components/topLinks";
import Footer from "@/components/Footer";
import { TikTokUser } from '@/types/tiktok';

interface UsersPageProps {
  initialUsers: TikTokUser[];
  totalUsers: number;
  pageSize: number;
  initialSortBy: 'followers' | 'hearts' | 'last_video_activity';
}

const UsersPage: React.FC<UsersPageProps> = ({ initialUsers, totalUsers: initialTotalUsers, pageSize, initialSortBy }) => {
  const [users, setUsers] = useState<TikTokUser[]>(initialUsers || []);
  const [totalUsers, setTotalUsers] = useState(initialTotalUsers);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'followers' | 'hearts' | 'last_video_activity'>(initialSortBy);

  useEffect(() => {
    console.log('Initial users:', initialUsers);
    console.log('Initial total users:', initialTotalUsers);
    setUsers(initialUsers || []);
    setHasMore((initialUsers?.length || 0) < initialTotalUsers);
  }, [initialUsers, initialTotalUsers]);

  const fetchUsers = useCallback(async (newSortBy: 'followers' | 'hearts' | 'last_video_activity') => {
    setIsLoading(true);
    try {
      console.log('Fetching users with sortBy:', newSortBy);
      const response = await fetch(`/api/users?page=1&pageSize=${pageSize}&sortBy=${newSortBy}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      console.log('Fetched data:', data);
      setUsers(data.users);
      setTotalUsers(data.totalUsers);
      setPage(1);
      setHasMore(data.users.length < data.totalUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    if (sortBy) {
      fetchUsers(sortBy);
    }
  }, [sortBy, fetchUsers]);

  const changeSortBy = async (newSortBy: 'followers' | 'hearts' | 'last_video_activity') => {
    if (newSortBy !== sortBy) {
      setIsLoading(true);
      setSortBy(newSortBy);
      try {
        const response = await fetch(`/api/users?page=1&pageSize=${pageSize}&sortBy=${newSortBy}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setUsers(data.users);
        setTotalUsers(data.totalUsers);
        setPage(1);
        setHasMore(data.users.length < data.totalUsers);
      } catch (error) {
        console.error('Error changing sort:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadMoreUsers = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    try {
      const response = await fetch(`/api/users?page=${nextPage}&pageSize=${pageSize}&sortBy=${sortBy}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();

      if (data.users && data.users.length > 0) {
        setUsers(prevUsers => [...prevUsers, ...data.users]);
        setPage(nextPage);
        setHasMore((users.length + data.users.length) < data.totalUsers);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more users:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, isLoading, hasMore, users.length, sortBy]);

  return (
    <>
      <Head>
        <title>HasTok - TikTok Users</title>
        <meta name="description" content="View TikTok users on HasTok" />
      </Head>
      <div className="bg-scanlines bg-custom-purple">
        <PageHeader title="HasTok Users" />
        <TopLinks />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4 text-center text-white">
            <button
              onClick={() => changeSortBy('followers')}
              className={`px-4 py-2 rounded mr-2 ${
                sortBy === 'followers' ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
              }`}
              disabled={isLoading}
            >
              Sort by Followers
            </button>
            <button
              onClick={() => changeSortBy('hearts')}
              className={`px-4 py-2 rounded mr-2 ${
                sortBy === 'hearts' ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
              }`}
              disabled={isLoading}
            >
              Sort by Hearts
            </button>
            <button
              onClick={() => changeSortBy('last_video_activity')}
              className={`px-4 py-2 rounded ${
                sortBy === 'last_video_activity' ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
              }`}
              disabled={isLoading}
            >
              Sort by Last Video Upload
            </button>
          </div>
          <div className="mb-4 text-center text-white">
            Showing <b className="text-lg text-red-500">{users.length}</b> of <b className="text-lg text-red-500">{totalUsers}</b> users
          </div>
          {isLoading && users.length === 0 ? (
            <div className="text-center text-white">Loading...</div>
          ) : (
            <>
              <TikTokUsers users={users} />
            </>
          )}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
                onClick={loadMoreUsers}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
          <div className="mt-3 mb-4 text-center text-white">
            Showing <b className="text-lg text-red-500">{users.length}</b> of <b className="text-lg text-red-500">{totalUsers}</b> users
          </div>
          {!hasMore && users.length < totalUsers && (
            <p className="mt-8 text-center text-white">
              You have seen all {totalUsers} users
            </p>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export const getStaticProps = async () => {
  try {
    const response = await fetch('/api/users?page=1&pageSize=20&sortBy=followers');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();

    return {
      props: {
        initialUsers: data.users,
        totalUsers: data.totalUsers,
        pageSize: 20,
        initialSortBy: 'followers',
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        initialUsers: [],
        totalUsers: 0,
        pageSize: 20,
        initialSortBy: 'followers',
      },
      revalidate: 3600, // Revalidate every hour
    };
  }
};

export default UsersPage;
