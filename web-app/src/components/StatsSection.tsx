'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import StatCard from './StatCard';

interface StatsData {
  totalGames: number;
  availableGames: number;
  borrowedGames: number;
  pendingLoans: number;
  returnInProgressLoans: number;
  overdueLoans: number;
}

const StatsSection = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatsData>({
    totalGames: 0,
    availableGames: 0,
    borrowedGames: 0,
    pendingLoans: 0,
    returnInProgressLoans: 0,
    overdueLoans: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const userId = session?.user?.id;
      const isUserAdmin = session?.user?.role === 'ADMIN';
      // Admins get global stats, regular users get their own stats
      const url = isUserAdmin ? '/api/stats' : (userId ? `/api/stats?userId=${userId}` : '/api/stats');
      const response = await fetch(url);
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      <StatCard type="total-games" value={stats.totalGames} />
      <StatCard type="available" value={stats.availableGames} />
      <StatCard type="pending" value={stats.pendingLoans} />
      <StatCard type="return-in-progress" value={stats.returnInProgressLoans} />
      <StatCard type="borrowed" value={stats.borrowedGames} />
      <StatCard type="overdue" value={stats.overdueLoans} />
    </div>
  );
};

export default StatsSection;
