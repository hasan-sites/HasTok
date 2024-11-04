import { GetStaticProps, GetStaticPaths } from 'next';
import { UserPage } from '@/components/users/user-page';
import { DateFilterType } from '@/types/filters';
import { getTikTokData } from "@/lib/tiktokPapi";

export const getStaticPaths: GetStaticPaths = async () => {
  // For initial build, don't generate any paths
  return {
    paths: [],
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const uniqueId = params?.uniqueId as string;
    const filter = params?.filter as DateFilterType;

    // Fetch user data
    const baseURL = new URL('/api/users', process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000');
    
    baseURL.searchParams.set('uniqueId', uniqueId);
    baseURL.searchParams.set('preview_token', process.env.NEXT_PUBLIC_PREVIEW_TOKEN || '');

    const userRes = await fetch(baseURL.toString());
    if (!userRes.ok) throw new Error(`Failed to fetch user data: ${userRes.status}`);
    const userData = await userRes.json();

    if (!userData.user) return { notFound: true };

    // Fetch videos
    const tiktokData = await getTikTokData(24, 'created', [uniqueId]);

    return {
      props: {
        user: userData.user,
        initialVideos: tiktokData.initialVideos || [],
        totalVideos: tiktokData.totalVideos || 0,
        pageSize: 24,
        initialSortBy: 'created',
        initialDateFilter: filter,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
};

export default UserPage;