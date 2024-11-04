export interface TikTokVideoType {
  id?: string;
  tiktok_id: string;
  author: {
    unique_id: string;
    nickname: string;
    avatar: string;
  };
  created: string | number; // Assuming it's a timestamp or date string
  desc: string;
  hearts: number;
  collected: number;
  comments: number;
  plays: number;
  shares: number;
  cover: string;
  duration: number;
}

export interface TikTokPapiData {
  initialVideos: TikTokVideoType[];
  totalVideos: number;
  pageSize: number;
  initialSortBy: 'created' | 'plays';
  initialDateFilter: 'day' | 'week' | 'month' | 'year' | 'all';
  usernames?: string[] | null;
}

export interface SocialMediaData {
  tiktok: TikTokPapiData;
  // Add other social media platforms here as needed
  // For example:
  // instagram: { ... };
  // youtube: { ... };
}

export interface HasTokProps {
  tiktok: TikTokPapiData;
  username?: string;
}

export interface TikTokUser {
  id?: string;
  unique_id: string;
  nickname: string;
  avatar: string;
  followers: number;
  following: number;
  hearts: number;
  videos: number;
  last_video_activity?: string | null;
}