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
  adminStats: {
    borrowPending: number;
    borrowApproved: number;
    active: number;
    overdue: number;
    returnPending: number;
    returnApproved: number;
    returned: number;
    rejected: number;
  } | null;
}

const defaultStats: GlobalStatsData = {
  totalGames: 0,
  availableGames: 0,
  borrowedGames: 0,
  pendingLoans: 0,
  returnInProgressLoans: 0,
  overdueLoans: 0,
  adminStats: null
};

const SECTION_TITLE_CLASS = 'text-sm font-semibold text-gray-700 uppercase tracking-wide';
const GROUP_TITLE_CLASS = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2';
const SUMMARY_WRAPPER_CLASS = 'rounded-lg border border-gray-200 p-4 md:p-5 mb-6 bg-gray-50/50';
const BREAKDOWN_WRAPPER_CLASS = 'rounded-lg border border-gray-200 p-4 md:p-5 bg-white';
const SUMMARY_GRID_CLASS = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6';
const BREAKDOWN_GRID_CLASS = 'grid grid-cols-1 lg:grid-cols-2 gap-4';
const PAIR_GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 gap-6';

const AdminGlobalStats = () => {
  const [stats, setStats] = useState<GlobalStatsData>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGlobalStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/stats?detail=admin');
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

  const borrowPending = stats.adminStats?.borrowPending ?? 0;
  const borrowApproved = stats.adminStats?.borrowApproved ?? 0;
  const onTime = stats.adminStats?.active ?? 0;
  const overdue = stats.adminStats?.overdue ?? 0;
  const returnPending = stats.adminStats?.returnPending ?? 0;
  const returnApproved = stats.adminStats?.returnApproved ?? 0;
  const returned = stats.adminStats?.returned ?? 0;
  const rejected = stats.adminStats?.rejected ?? 0;

  const borrowRequests = borrowPending + borrowApproved;
  const checkedOut = onTime + overdue;
  const returnsInProgress = returnPending + returnApproved;
  const closed = returned + rejected;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Overview</h2>
      <div className={SUMMARY_WRAPPER_CLASS}>
        <h3 className={`${SECTION_TITLE_CLASS} mb-3`}>Summary</h3>
        <div className={SUMMARY_GRID_CLASS}>
          <StatCard type="total-games" value={stats.totalGames} />
          <StatCard type="available" value={stats.availableGames} />
          <StatCard type="borrow-requests" value={borrowRequests} />
          <StatCard type="checked-out" value={checkedOut} />
          <StatCard type="returns-in-progress" value={returnsInProgress} />
          <StatCard type="closed" value={closed} />
        </div>
      </div>

      <div className={BREAKDOWN_WRAPPER_CLASS}>
        <h3 className={`${SECTION_TITLE_CLASS} mb-4`}>Breakdown</h3>
        <div className={BREAKDOWN_GRID_CLASS}>
          <div>
            <p className={GROUP_TITLE_CLASS}>Borrow Requests</p>
            <div className={PAIR_GRID_CLASS}>
              <StatCard type="borrow-pending" value={borrowPending} />
              <StatCard type="borrow-approved" value={borrowApproved} />
            </div>
          </div>
          <div>
            <p className={GROUP_TITLE_CLASS}>Checked Out</p>
            <div className={PAIR_GRID_CLASS}>
              <StatCard type="on-time" value={onTime} />
              <StatCard type="overdue" value={overdue} />
            </div>
          </div>
          <div>
            <p className={GROUP_TITLE_CLASS}>Returns In Progress</p>
            <div className={PAIR_GRID_CLASS}>
              <StatCard type="return-pending" value={returnPending} />
              <StatCard type="return-approved" value={returnApproved} />
            </div>
          </div>
          <div>
            <p className={GROUP_TITLE_CLASS}>Closed</p>
            <div className={PAIR_GRID_CLASS}>
              <StatCard type="returned" value={returned} />
              <StatCard type="rejected" value={rejected} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGlobalStats;
