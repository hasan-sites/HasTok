import type { NextApiRequest, NextApiResponse } from 'next';
import { createDirectus, rest, authentication, readItems, aggregate } from '@directus/sdk';

if (!process.env.DIRECTUS_URL) throw new Error('DIRECTUS_URL is not defined');
const directus = createDirectus(process.env.DIRECTUS_URL)
  .with(rest())
  .with(authentication());

interface FilterType {
  created?: {
    _gte: string;
  };
  author?: {
    unique_id: {
      _in: string | string[];
    };
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { page, pageSize, sortBy, dateFilter, usernames } = req.query;

  // Validate sortBy parameter
  const validSortBy = ['created', 'plays'].includes(sortBy as string) ? sortBy : 'created';

  // Calculate the date for filtering
  let filterDate: Date | null = null;
  const day = 24 * 60 * 60 * 1000;
  switch (dateFilter) {
    case 'day':
      filterDate = new Date(Date.now() - day);
      break;
    case 'week':
      filterDate = new Date(Date.now() - 7 * day);
      break;
    case 'month':
      filterDate = new Date(Date.now() - 30 * day);
      break;
    case 'year':
      filterDate = new Date(Date.now() - 365 * day);
      break;
  }

  try {
    const email = process.env.DIRECTUS_ADMIN_EMAIL;
    const password = process.env.DIRECTUS_ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error('Directus admin credentials are not set in environment variables');
    }
    await directus.login(email, password);

    const filter: FilterType = {};
    if (filterDate) {
      filter.created = {
        _gte: filterDate.toISOString(),
      };
    }
    if (usernames) {
      filter.author = {
        unique_id: {
          _in: Array.isArray(usernames) ? usernames : [usernames as string],
        },
      };
    }

    console.log('Request query params:', req.query);
    console.log('Constructed filter:', JSON.stringify(filter, null, 2));

    const [videos, totalCount] = await Promise.all([
      directus.request(
        readItems('tiktok_videos', {
          limit: Number(pageSize),
          page: Number(page),
          fields: ['*', 'author.*'],
          sort: [`-${validSortBy}`],
          filter: filter,
        })
      ),
      directus.request(
        aggregate('tiktok_videos', {
          aggregate: { count: '*' },
          filter: filter,
          query: {
            filter: filter
          }
        })
      )
    ]);

    console.log('Filter applied:', JSON.stringify(filter, null, 2));
    console.log(`Videos found for ${usernames}:`, videos.length);
    console.log('Total count result:', JSON.stringify(totalCount, null, 2));

    res.status(200).json({
      videos,
      totalVideos: totalCount[0].count,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos' });
  }
}
