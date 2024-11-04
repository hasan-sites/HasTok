import { GetStaticProps, GetStaticPaths } from 'next';
import HasTok from '@/components/hastok';
import { HasTokProps } from "@/types/tiktok";
import { getTikTokData } from "@/lib/tiktokPapi";
import { DATE_FILTERS, DateFilterType } from '@/types/filters';

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = DATE_FILTERS.map(filter => ({
    params: { filter }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<HasTokProps> = async ({ params }) => {
  try {
    const filter = params?.filter as DateFilterType;
    const usernames: string[] = [];
    const tiktokData = await getTikTokData(24, 'created', usernames);

    return {
      props: {
        tiktok: {
          ...tiktokData,
          initialSortBy: 'created',
          initialDateFilter: filter,
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
          initialDateFilter: params?.filter as DateFilterType || 'all',
          usernames: null,
        },
      },
      revalidate: 60 * 5,
    };
  }
};

const DateFilterPage = (props: HasTokProps) => {
  return <HasTok tiktok={props.tiktok} />;
};

export default DateFilterPage;