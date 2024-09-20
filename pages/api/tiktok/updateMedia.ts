/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { createDirectus, rest, authentication, readItems, updateItem, createItem } from "@directus/sdk";
import axios from "axios";

const directus = createDirectus(process.env.DIRECTUS_URL)
  .with(rest())
  .with(authentication());

  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
  let userCount = 0;
  let updateCount = 0;

  await directus.login(process.env.DIRECTUS_ADMIN_EMAIL, process.env.DIRECTUS_ADMIN_PASSWORD);

  try {
    const tiktokUsers = await directus.request(
      readItems('tiktok_users', {
        limit: -1,
      })
    );

    for (const user of tiktokUsers) {
      userCount++;
      const shouldUpdate = await checkIfShouldUpdate(user);
      if (shouldUpdate) {
        await updateUserVideos(user);
        updateCount++;
      }
    }

    console.log('Total users, updates processed:', userCount, updateCount);
    res.status(200).json({ msg: "TikTok videos updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating TikTok videos" });
  }
}

async function checkIfShouldUpdate(user: any): Promise<boolean> {
  if (user.last_media_updated === null) return true;

  const now = new Date().getTime();
  const lastUpdated = new Date(user.last_media_updated).getTime();
  const mediaInterval = user.media_interval * 60 * 1000; // Convert minutes to miliseconds

  return now - lastUpdated > mediaInterval;
}

async function updateUserVideos(user: any) {
  const isFirstUpdate = user.last_media_updated === null;
  let nextPageId = null;

  do {
    const tiktokVideoData = await fetchTikTokVideos(user.unique_id, nextPageId);
    await saveTikTokVideos(tiktokVideoData.response, user.id);
    // @TODO better logic for whether to paginate or not. Task: https://t0ggles.com/chase-saddy/dcjfvjkmcxzup42psnlu
    nextPageId = isFirstUpdate ? tiktokVideoData.next_page_id : null;
  } while (nextPageId);

  await updateLastUpdated(user.id);
}

async function fetchTikTokVideos(
  username: string,
  pageId: string | null = null
) {
  const url = new URL(process.env.TIKTOK_PAPI_URL + "/user/videos/by/username");
  url.searchParams.append("username", username);
  if (pageId) {
    url.searchParams.append("page_id", pageId);
  }

  const response = await axios.get(url.toString(), {
    headers: {
      "x-access-key": process.env.TIKTOK_PAPI_KEY,
    },
  });
  return response.data;
}

async function saveTikTokVideos(
  videoData: any,
  authorId: string
): Promise<boolean> {
  // console.log('Video data structure:', JSON.stringify(videoData, null, 2));

  const itemList = videoData.itemList || videoData.items || [];

  if (!Array.isArray(itemList)) {
    console.error('itemList is not an array:', itemList);
    return false;
  } else {
     console.log('saveTikTokVideos: itemList length', itemList.length);
  }

  for (const item of itemList) {
    const existingVideo = await directus.request(
      readItems('tiktok_videos', {
        filter: { tiktok_id: item.id },
        limit: 1,
      })
    );

    const video = {
      tiktok_id: item.id,
      author: authorId,
      created: item.createTime * 1000,
      desc: item.desc,
      collected: parseInt(item.statsV2?.collectCount || '0'),
      comments: parseInt(item.statsV2?.commentCount || '0'),
      plays: parseInt(item.statsV2?.playCount || '0'),
      shares: parseInt(item.statsV2?.shareCount || '0'),
      cover: item.video?.cover,
      duration: item.video?.duration,
      dynamic_cover: item.video?.dynamicCover,
    };

    if (existingVideo && existingVideo.length > 0) {
      console.log('saveTikTokVideos: updated video', video.tiktok_id, video.desc.slice(0, 30));
      await directus.request(
        updateItem('tiktok_videos', existingVideo[0].id, video)
      );
    } else {
      console.log('saveTikTokVideos: created video', video.tiktok_id, video.desc.slice(0, 30));
      await directus.request(
        createItem('tiktok_videos', video)
      );
    }
  }

  return true;
}

async function updateLastUpdated(userId: string) {
  await directus.request(
    updateItem('tiktok_users', userId, {
      last_media_updated: new Date().getTime(),
    })
  );
}
