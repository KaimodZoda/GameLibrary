'use client';

import { useState, useEffect } from 'react';

interface Stat {
  id: number;
  title: string;
  value: string;
  icon: string;
  bgColor: string;
  iconColor: string;
}

interface StatsData {
  totalGames: number;
  availableGames: number;
  borrowedGames: number;
}

const StatsSection = () => {
  const [stats, setStats] = useState<StatsData>({
    totalGames: 0,
    availableGames: 0,
    borrowedGames: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.message || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">Loading...</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <i className="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchStats}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statsArray: Stat[] = [
    {
      id: 1,
      title: 'Total Games',
      value: stats.totalGames.toString(),
      icon: 'fas fa-gamepad',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      id: 2,
      title: 'Available',
      value: stats.availableGames.toString(),
      icon: 'fas fa-check-circle',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 3,
      title: 'Borrowed',
      value: stats.borrowedGames.toString(),
      icon: 'fas fa-clock',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      id: 4,
      title: 'Overdue',
      value: '0', // Placeholder - can be implemented later with due dates
      icon: 'fas fa-exclamation-triangle',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsArray.map((stat) => (
        <div key={stat.id} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
              <i className={`fas ${stat.icon} ${stat.iconColor} text-xl`}></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;
