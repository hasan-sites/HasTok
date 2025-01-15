import React from 'react';
import { GetStaticProps } from 'next';
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import DailyTikTokStats from '@/components/DailyTikTokStats';
import { getTikTokStats } from '@/lib/tiktokStats';
import Head from 'next/head';
import TopLinks from "@/components/topLinks";

interface TikTokStatsPageProps {
  tiktokStats: {
    totalHearts: number;
    totalFollowers: number;
    totalVideos: number;
    totalFriends: number;
    heartsGainLast24Hours: number | null;
    followersGainLast24Hours: number | null;
    videosGainLast24Hours: number | null;
    friendsGainLast24Hours: number | null;
    daysCalculatedFor24Hours: number;
    heartsGainLast7Days: number | null;
    followersGainLast7Days: number | null;
    videosGainLast7Days: number | null;
    friendsGainLast7Days: number | null;
    daysCalculatedFor7Days: number;
    heartsGainLast30Days: number | null;
    followersGainLast30Days: number | null;
    videosGainLast30Days: number | null;
    friendsGainLast30Days: number | null;
    daysCalculatedFor30Days: number;
    dailyStats: { 
      date: string; 
      hearts: number; 
      followers: number;
      videos: number;
      friends: number;
      accountCount: number 
    }[];
  };
}

const TikTokStatsPage: React.FC<TikTokStatsPageProps> = ({ tiktokStats }) => {
  const formatGain = (gain: number | null, days: number, actualDays: number) => {
    if (gain === null) return 'Insufficient data';
    const formattedGain = gain.toLocaleString();
    return actualDays === days 
      ? `${formattedGain}`
      : `${formattedGain} (in ${actualDays} day${actualDays !== 1 ? 's' : ''})`;
  };

  function processWeeklyStats(dailyStats: typeof tiktokStats.dailyStats) {
    const weeklyStats = dailyStats.reduce((acc: typeof dailyStats, curr) => {
      const date = new Date(curr.date);
      // Get the start of the week (Sunday)
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      const existingWeek = acc.find(w => w.date === weekKey);
      if (existingWeek) {
        existingWeek.hearts = Math.max(existingWeek.hearts, curr.hearts);
        existingWeek.followers = Math.max(existingWeek.followers, curr.followers);
        existingWeek.videos = Math.max(existingWeek.videos, curr.videos);
        existingWeek.friends = Math.max(existingWeek.friends, curr.friends);
        existingWeek.accountCount = Math.max(existingWeek.accountCount, curr.accountCount);
      } else {
        acc.push({
          date: weekKey,
          hearts: curr.hearts,
          followers: curr.followers,
          videos: curr.videos,
          friends: curr.friends,
          accountCount: curr.accountCount
        });
      }
      return acc;
    }, []);

    return weeklyStats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  const weeklyStats = processWeeklyStats(tiktokStats.dailyStats);

  return (
    <>
      <Head>
        <title>HasTok Historical Stats and Growth</title>
        <meta name="description" content="View detailed TikTok statistics on HasTok" />
      </Head>
      <div className="bg-scanlines bg-custom-purple">
      <PageHeader title="HasTok Community Stats" />
      <TopLinks />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Hearts', 'Followers', 'Videos', 'Friends'].map(stat => (
              <div key={stat} className="bg-gray-800 text-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl text-blue-500 font-bold mb-2">{stat}</h2>
                <p className="text-2xl font-bold">{(tiktokStats[`total${stat}` as keyof typeof tiktokStats] ?? 0).toLocaleString()}</p>
                <p className="text-sm">Last 24h: {formatGain(tiktokStats[`${stat.toLowerCase()}GainLast24Hours` as keyof typeof tiktokStats] as number | null, 1, tiktokStats.daysCalculatedFor24Hours)}</p>
                <p className="text-sm">Last 7d: {formatGain(tiktokStats[`${stat.toLowerCase()}GainLast7Days` as keyof typeof tiktokStats] as number | null, 7, tiktokStats.daysCalculatedFor7Days)}</p>
                <p className="text-sm">Last 30d: {formatGain(tiktokStats[`${stat.toLowerCase()}GainLast30Days` as keyof typeof tiktokStats] as number | null, 30, tiktokStats.daysCalculatedFor30Days)}</p>
              </div>
            ))}
          </div>
          <div className="space-y-8">
            <DailyTikTokStats 
              dailyStats={tiktokStats.dailyStats.slice(-30)} 
              title="Last 30 Days (Daily)" 
            />
            <DailyTikTokStats 
              dailyStats={weeklyStats} 
              title="All Time (Weekly)" 
              isWeekly
            />
          </div>
          <div className="mt-8 text-center text-white">
            <p>These stats show the total number of hearts, followers, videos, and friends for TikTok accounts, as well as their growth over different time periods.</p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<TikTokStatsPageProps> = async () => {
  try {
    const tiktokStats = await getTikTokStats();

    return {
      props: {
        tiktokStats,
      },
      revalidate: 60 * 60, // 1 hour
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        tiktokStats: {
          totalHearts: 0,
          totalFollowers: 0,
          totalVideos: 0,
          totalFriends: 0,
          heartsGainLast24Hours: null,
          followersGainLast24Hours: null,
          videosGainLast24Hours: null,
          friendsGainLast24Hours: null,
          daysCalculatedFor24Hours: 0,
          heartsGainLast7Days: null,
          followersGainLast7Days: null,
          videosGainLast7Days: null,
          friendsGainLast7Days: null,
          daysCalculatedFor7Days: 0,
          heartsGainLast30Days: null,
          followersGainLast30Days: null,
          videosGainLast30Days: null,
          friendsGainLast30Days: null,
          daysCalculatedFor30Days: 0,
          dailyStats: [],
        },
      },
      revalidate: 60 * 5
    };
  }
};

export default TikTokStatsPage;