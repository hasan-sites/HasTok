import { createDirectus, rest, authentication, readItems } from "@directus/sdk";

if (!process.env.DIRECTUS_URL) throw new Error('DIRECTUS_URL is not defined');
const directus = createDirectus(process.env.DIRECTUS_URL)
  .with(rest())
  .with(authentication());

export async function getTikTokStats() {
  try {
    const email = process.env.DIRECTUS_ADMIN_EMAIL;
    const password = process.env.DIRECTUS_ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error('Directus admin credentials are not set in environment variables');
    }
    await directus.login(email, password);

    const stats = await directus.request(
      readItems('tiktok_user_stats_history', {
        fields: ['timestamp', 'hearts', 'followers', 'videos', 'friends', 'user'],
        sort: ['timestamp'],
        limit: -1, // Fetch all results
      })
    );

    const processedStats = stats.reduce((acc, stat) => {
      const date = new Date(stat.timestamp).toISOString().split('T')[0];
      const hearts = parseInt(stat.hearts, 10) || 0;
      const followers = parseInt(stat.followers, 10) || 0;
      const videos = parseInt(stat.videos, 10) || 0;
      const friends = parseInt(stat.friends, 10) || 0;
      
      if (!acc[date]) {
        acc[date] = { 
          hearts: 0, 
          followers: 0, 
          videos: 0, 
          friends: 0, 
          users: {}, 
          accountCount: 0 
        };
      }
      
      // Sum stats for each user on this date
      if (!acc[date].users[stat.user]) {
        acc[date].users[stat.user] = { hearts, followers, videos, friends };
        acc[date].hearts += hearts;
        acc[date].followers += followers;
        acc[date].videos += videos;
        acc[date].friends += friends;
        acc[date].accountCount++;
      } else {
        // Update if we have higher counts for this user on this date
        const user = acc[date].users[stat.user];
        if (hearts > user.hearts) {
          acc[date].hearts += hearts - user.hearts;
          user.hearts = hearts;
        }
        if (followers > user.followers) {
          acc[date].followers += followers - user.followers;
          user.followers = followers;
        }
        if (videos > user.videos) {
          acc[date].videos += videos - user.videos;
          user.videos = videos;
        }
        if (friends > user.friends) {
          acc[date].friends += friends - user.friends;
          user.friends = friends;
        }
      }
      
      return acc;
    }, {} as Record<string, { 
      hearts: number, 
      followers: number, 
      videos: number, 
      friends: number, 
      users: Record<string, { hearts: number, followers: number, videos: number, friends: number }>, 
      accountCount: number 
    }>);

    const dailyStats = Object.entries(processedStats).map(([date, data]) => ({ 
      date, 
      hearts: data.hearts,
      followers: data.followers,
      videos: data.videos,
      friends: data.friends,
      accountCount: data.accountCount
    }));
    dailyStats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const latestStats = dailyStats[dailyStats.length - 1] || { hearts: 0, followers: 0, videos: 0, friends: 0 };
    
    const calculateGain = (days: number) => {
      if (dailyStats.length < days + 1) {
        return {
          hearts: null,
          followers: null,
          videos: null,
          friends: null,
          daysCalculated: dailyStats.length - 1
        };
      }
      const oldStats = dailyStats[dailyStats.length - 1 - days];
      return {
        hearts: latestStats.hearts - oldStats.hearts,
        followers: latestStats.followers - oldStats.followers,
        videos: latestStats.videos - oldStats.videos,
        friends: latestStats.friends - oldStats.friends,
        daysCalculated: days
      };
    };

    const last24HoursGain = calculateGain(1);
    const last7DaysGain = calculateGain(7);
    const last30DaysGain = calculateGain(30);

    return {
      totalHearts: latestStats.hearts,
      totalFollowers: latestStats.followers,
      totalVideos: latestStats.videos,
      totalFriends: latestStats.friends,
      heartsGainLast24Hours: last24HoursGain.hearts,
      followersGainLast24Hours: last24HoursGain.followers,
      videosGainLast24Hours: last24HoursGain.videos,
      friendsGainLast24Hours: last24HoursGain.friends,
      daysCalculatedFor24Hours: last24HoursGain.daysCalculated,
      heartsGainLast7Days: last7DaysGain.hearts,
      followersGainLast7Days: last7DaysGain.followers,
      videosGainLast7Days: last7DaysGain.videos,
      friendsGainLast7Days: last7DaysGain.friends,
      daysCalculatedFor7Days: last7DaysGain.daysCalculated,
      heartsGainLast30Days: last30DaysGain.hearts,
      followersGainLast30Days: last30DaysGain.followers,
      videosGainLast30Days: last30DaysGain.videos,
      friendsGainLast30Days: last30DaysGain.friends,
      daysCalculatedFor30Days: last30DaysGain.daysCalculated,
      dailyStats,
    };
  } catch (error) {
    console.error("Error fetching TikTok statistics:", error);
    throw error;
  }
}
