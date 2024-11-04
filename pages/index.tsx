import type { NextPage, GetStaticProps } from "next";
import HasTok from '@/components/hastok';
import { HasTokProps } from "@/types/tiktok";
import { getTikTokData } from "@/lib/tiktokPapi"

const Home: NextPage<HasTokProps> = (props) => {
  return <HasTok tiktok={props.tiktok} />;
};

export const getStaticProps: GetStaticProps<HasTokProps> = async () => {
  try {
    // an array, pass as one or multiple usernames
    const usernames: string[] = []; // Explicitly type as string array
    const tiktokData = await getTikTokData(24, 'created', usernames);

    return {
      props: {
        tiktok: {
          ...tiktokData,
          initialSortBy: 'created',
          initialDateFilter: 'all',
        },
      },
      revalidate: 60 * 30
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        tiktok: {
          initialVideos: [],
          totalVideos: 0,
          pageSize: 24,
          initialSortBy: 'created',
          initialDateFilter: 'all',
          usernames: null,
        },
      },
      revalidate: 60 * 5,
    };
  }
};

export default Home;
