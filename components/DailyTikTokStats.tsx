/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DailyTikTokStatsProps {
  dailyStats: {
    date: string;
    hearts: number;
    followers: number;
    videos: number;
    friends: number;
    accountCount: number;
  }[];
  title: string;
  isWeekly?: boolean;
}

export default function DailyTikTokStats({ dailyStats, title, isWeekly = false }: DailyTikTokStatsProps) {
  const formatDate = (date: string) => {
    if (!isWeekly) return date;
    
    const weekStart = new Date(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return `${weekStart.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${weekEnd.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}`;
  };

  const createChartData = (label: string, data: number[], color: string) => ({
    labels: dailyStats.map(stat => formatDate(stat.date)),
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: `${color}33`,
        yAxisID: 'y',
      },
      {
        label: 'Account Count',
        data: dailyStats.map(stat => stat.accountCount),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        yAxisID: 'y1',
      },
    ],
  });

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: false, // We'll create our own title
      },
      legend: {
        labels: {
          font: {
            size: 14
          }
        },
        position: 'top' as const,
      },
      tooltip: {
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 16
        }
      },
      customLegendSpacing: {
        beforeInit(chart: any) {
          // Create a new plugin to handle legend spacing
          const originalFit = chart.legend.fit;
          chart.legend.fit = function fit() {
            originalFit.bind(chart.legend)();
            this.height += 20; // Adjust this value to increase/decrease space
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 12
          },
          color: 'white',
        },
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 16
          },
          color: 'rgb(59, 130, 246)', // bg-blue-500
          padding: {top: 10, bottom: 10},
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Count',
          font: {
            size: 16
          },
          color: 'rgb(59, 130, 246)', // bg-blue-500
          padding: {top: 10, bottom: 10},
        },
        ticks: {
          font: {
            size: 12
          },
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Account Count',
          font: {
            size: 16
          },
          color: 'rgb(59, 130, 246)', // bg-blue-500
          padding: {top: 10, bottom: 10},
        },
        ticks: {
          font: {
            size: 12
          },
          color: 'white',
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const charts = [
    { label: 'Hearts', data: dailyStats.map(stat => stat.hearts), color: 'rgba(255, 99, 132, 1)' },
    { label: 'Followers', data: dailyStats.map(stat => stat.followers), color: 'rgba(54, 162, 235, 1)' },
    { label: 'Videos', data: dailyStats.map(stat => stat.videos), color: 'rgba(255, 206, 86, 1)' },
    { label: 'Friends', data: dailyStats.map(stat => stat.friends), color: 'rgba(75, 192, 192, 1)' },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      {charts.map((chart, index) => (
        <div key={index} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <h3 className="text-2xl font-bold bg-green-500 text-white p-4 mb-4 text-center">
            {isWeekly ? 'Weekly' : 'Daily'} {chart.label} Stats
          </h3>
          <div className="p-4">
            <Line options={options} data={createChartData(chart.label, chart.data, chart.color)} />
          </div>
        </div>
      ))}
    </div>
  );
}