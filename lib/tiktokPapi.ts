/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDirectus, rest, authentication, readItems, aggregate } from '@directus/sdk';
import { TikTokPapiData, TikTokVideoType } from '../types/tiktok';

if (!process.env.DIRECTUS_URL) throw new Error('DIRECTUS_URL is not defined');
const directus = createDirectus(process.env.DIRECTUS_URL)
  .with(rest())
  .with(authentication());

export async function getTikTokData(pageSize: number, sortBy: 'created' | 'plays', usernames: string[] | null): Promise<TikTokPapiData> {
  const email = process.env.DIRECTUS_ADMIN_EMAIL;
  const password = process.env.DIRECTUS_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Directus admin credentials are not set in environment variables');
  }
  await directus.login(email, password);

  console.log('Fetching TikTok data...', usernames ? `for users: ${usernames.join(', ')}` : 'for all users');

  const filter: any = {};
  if (usernames && usernames.length > 0) {
    filter['author'] = {
      unique_id: {
        _in: usernames
      }
    };
  }

  try {
    type AggregateResult = { count: { id: number } }[];
    const [initialVideos, totalCountResult] = await Promise.all([
      directus.request(
        readItems('tiktok_videos', {
          limit: pageSize,
          fields: ['*', 'author.*'],
          sort: [`-${sortBy}`],
          filter: filter,
        })
      ) as Promise<TikTokVideoType[]>,
      directus.request<AggregateResult>(
        aggregate('tiktok_videos', {
          aggregate: { count: 'id' },
          filter: filter,
        })
      )
    ]);
    
    // why does this not need // @ts-expect-error: Property 'id' does not exist on type 'string'
    const totalVideos = totalCountResult[0]?.count?.id ?? 0;

    console.log(`Fetched ${initialVideos.length} initial TikTok videos. Total videos: ${totalVideos}`);

    return {
      initialVideos,
      totalVideos,
      pageSize,
      initialSortBy: sortBy,
      initialDateFilter: 'all',
      usernames: usernames || null,
    };
  } catch (error) {
    console.error('Error fetching TikTok data:', error);
    throw error;
  }
}