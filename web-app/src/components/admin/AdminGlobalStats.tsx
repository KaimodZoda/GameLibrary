'use client';

import { useCallback, useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';

interface GlobalStatsData {
  totalGames: number;
  availableGames: number;
  borrowedGames: number;
  pendingLoans: number;
  returnInProgressLoans: number;
  overdueLoans: number;
}

const defaultStats: GlobalStatsData = {
  totalGames: 0,
  availableGames: 0,
  borrowedGames: 0,
  pendingLoans: 0,
  returnInProgressLoans: 0,
  overdueLoans: 0
};

const AdminGlobalStats = () => {
  const [stats, setStats] = useState<GlobalStatsData>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGlobalStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/stats');
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.message || 'Failed to fetch global stats');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="ml-4">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded"></div>
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <i className="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
          <div>
            <h3 className="text-lg font-medium text-red-800">Failed To Load Global Stats</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchGlobalStats}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard type="total-games" value={stats.totalGames} />
        <StatCard type="available" value={stats.availableGames} />
        <StatCard type="pending" value={stats.pendingLoans} />
        <StatCard type="return-in-progress" value={stats.returnInProgressLoans} />
        <StatCard type="borrowed" value={stats.borrowedGames} />
        <StatCard type="overdue" value={stats.overdueLoans} />
      </div>
    </div>
  );
};

export default AdminGlobalStats;
