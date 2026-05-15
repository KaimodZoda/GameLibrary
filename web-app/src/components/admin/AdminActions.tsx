'use client';

import { useState, useEffect } from 'react';

interface AdminAction {
  id: number;
  action: string;
  notes: string | null;
  createdAt: string;
  admin: {
    id: number;
    name: string;
    email: string;
  };
  loan?: {
    id: number;
    game: {
      title: string;
      platform: string;
    };
    user: {
      name: string;
      email: string;
    };
  };
  return?: {
    id: number;
    loanId: number;
    loan?: {
      id: number;
      game: {
        title: string;
        platform: string;
      };
      user: {
        name: string;
        email: string;
      };
    };
  };
}

export default function AdminActions() {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = async () => {
    try {
      const response = await fetch('/api/admin/actions');
      const result = await response.json();
      if (result.success) {
        setActions(result.data);
      } else {
        setError(result.message || 'Failed to fetch admin actions');
      }
    } catch (error) {
      console.error('Error fetching admin actions:', error);
      setError('Failed to fetch admin actions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'loan_approved': return 'Loan Approved';
      case 'loan_rejected': return 'Loan Rejected';
      case 'return_approved': return 'Return Approved';
      case 'return_rejected': return 'Return Rejected';
      case 'return_completed': return 'Return Completed';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'loan_approved': return 'bg-green-100 text-green-800';
      case 'loan_rejected': return 'bg-red-100 text-red-800';
      case 'return_approved': return 'bg-blue-100 text-blue-800';
      case 'return_rejected': return 'bg-red-100 text-red-800';
      case 'return_completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Admin Actions Log</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {actions.map((action) => {
              const game = action.loan?.game || action.return?.loan?.game;
              const user = action.loan?.user || action.return?.loan?.user;
              
              return (
                <tr key={action.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(action.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{action.admin.name}</div>
                    <div className="text-xs text-gray-500">{action.admin.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(action.action)}`}>
                      {getActionLabel(action.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{game?.title || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{game?.platform || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{user?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {action.notes || '-'}
                  </td>
                </tr>
              );
            })}
            {actions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No admin actions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
