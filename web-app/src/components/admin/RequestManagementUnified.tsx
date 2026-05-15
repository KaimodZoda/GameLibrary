'use client';

import { useState, useEffect } from 'react';
import {
  getDisplayStatus,
  getLendingState
} from '@/lib/lending-state';
import StatCard from '@/components/StatCard';
import type { LoanSummary, ReturnSummary } from '@/types/lending';

type LoanRequest = LoanSummary & {
  approvedAt?: string;
  approvedBy?: number;
  pickupDate?: string;
  completedAt?: string;
  completedBy?: number;
  game: {
    id: number;
    title: string;
    platform: string;
    genre: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  approver?: {
    name: string;
  };
};

type ReturnRequest = ReturnSummary;

interface AdminQueueStats {
  borrowPending: number;
  borrowApproved: number;
  returnPending: number;
  returnApproved: number;
}

const SECTION_WRAPPER_CLASS = 'rounded-lg border border-gray-200 p-4 md:p-5 bg-gray-50/50';
const SECTION_HEADING_CLASS = 'text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3';
const MODAL_SECONDARY_BUTTON_CLASS = 'px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50';
const MODAL_DANGER_BUTTON_CLASS = 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50';
const MODAL_SUCCESS_BUTTON_CLASS = 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50';
const MODAL_PRIMARY_BUTTON_CLASS = 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50';

export default function RequestManagementUnified() {
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [queueStats, setQueueStats] = useState<AdminQueueStats>({
    borrowPending: 0,
    borrowApproved: 0,
    returnPending: 0,
    returnApproved: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch loan requests
  const fetchLoans = async () => {
    try {
      const response = await fetch('/api/admin/loans');
      const result = await response.json();
      if (result.success) {
        setLoans(result.data);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  // Fetch return requests
  const fetchReturns = async () => {
    try {
      const response = await fetch('/api/returns');
      const result = await response.json();
      setReturns(result);
    } catch (error) {
      console.error('Error fetching returns:', error);
    }
  };

  const fetchQueueStats = async () => {
    try {
      const response = await fetch('/api/stats?detail=admin');
      const result = await response.json();

      if (result.success && result.data?.adminStats) {
        setQueueStats({
          borrowPending: result.data.adminStats.borrowPending ?? 0,
          borrowApproved: result.data.adminStats.borrowApproved ?? 0,
          returnPending: result.data.adminStats.returnPending ?? 0,
          returnApproved: result.data.adminStats.returnApproved ?? 0
        });
      }
    } catch (error) {
      console.error('Error fetching queue stats:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchLoans(), fetchReturns(), fetchQueueStats()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLoanAction = async (action: 'approve' | 'pickup' | 'reject') => {
    if (!selectedLoan) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/loans/${selectedLoan.id}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: actionNotes })
      });

      if (response.ok) {
        await Promise.all([fetchLoans(), fetchQueueStats()]);
        setShowLoanModal(false);
        setSelectedLoan(null);
        setActionNotes('');
      }
    } catch (error) {
      console.error('Error processing loan action:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnAction = async (action: 'approve' | 'complete') => {
    if (!selectedReturn) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/returns/${selectedReturn.id}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: actionNotes })
      });
      
      if (response.ok) {
        await Promise.all([fetchReturns(), fetchLoans(), fetchQueueStats()]);
        setShowReturnModal(false);
        setSelectedReturn(null);
        setActionNotes('');
      }
    } catch (error) {
      console.error('Error processing return action:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (displayStatus: string) => {
    switch (displayStatus) {
      case 'Borrow Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Borrow Approved': return 'bg-blue-100 text-blue-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Rejected': return 'bg-gray-300 text-gray-800';
      case 'Return Pending': return 'bg-orange-100 text-orange-800';
      case 'Returning': return 'bg-purple-100 text-purple-800';
      case 'Returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get available actions based on status
  const getAvailableActions = (loan: LoanRequest) => {
    const lendingState = getLendingState(loan, returns);

    switch (lendingState) {
      case 'borrow_pending':
        return { type: 'loan', actions: ['approve', 'reject'] };
      case 'borrow_approved':
        return { type: 'loan', actions: ['pickup'] };
      case 'return_pending':
        return { type: 'return', actions: ['approve'] };
      case 'return_approved':
        return { type: 'return', actions: ['complete'] };
      default:
        return { type: 'none', actions: [] };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={SECTION_WRAPPER_CLASS}>
        <h3 className={SECTION_HEADING_CLASS}>Queue Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard type="borrow-pending" value={queueStats.borrowPending} />
          <StatCard type="borrow-approved" value={queueStats.borrowApproved} />
          <StatCard type="return-pending" value={queueStats.returnPending} />
          <StatCard type="return-approved" value={queueStats.returnApproved} />
        </div>
      </div>

      {/* Unified Requests Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrow Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.filter(loan => loan.status !== 'rejected').map((loan) => {
                const returnRequest = returns.find(req => req.loanId === loan.id);
                const displayStatus = getDisplayStatus(loan, returns);
                const availableActions = getAvailableActions(loan);
                
                return (
                  <tr key={loan.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{loan.game.title}</div>
                      <div className="text-xs text-gray-500">{loan.game.platform}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{loan.user.name}</div>
                      <div className="text-xs text-gray-500">{loan.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(loan.dateBorrowed).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(loan.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(displayStatus)}`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {availableActions.type === 'loan' && availableActions.actions.includes('reject') && (
                        <button
                          onClick={() => { setSelectedLoan(loan); setShowLoanModal(true); }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      )}
                      {availableActions.type === 'loan' && availableActions.actions.includes('approve') && (
                        <button
                          onClick={() => { setSelectedLoan(loan); setShowLoanModal(true); }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                      )}
                      {availableActions.type === 'loan' && availableActions.actions.includes('pickup') && (
                        <button
                          onClick={() => { setSelectedLoan(loan); setShowLoanModal(true); }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Confirm Pickup
                        </button>
                      )}
                      {availableActions.type === 'return' && availableActions.actions.includes('approve') && returnRequest && (
                        <button
                          onClick={() => { setSelectedReturn(returnRequest); setShowReturnModal(true); }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve Return
                        </button>
                      )}
                      {availableActions.type === 'return' && availableActions.actions.includes('complete') && returnRequest && (
                        <button
                          onClick={() => { setSelectedReturn(returnRequest); setShowReturnModal(true); }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Confirm Return
                        </button>
                      )}
                      {availableActions.type === 'none' && (
                        <span className="text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {loans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loan Action Modal */}
      {showLoanModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedLoan.status === 'pending' ? 'Loan Approval' : 'Confirm Pickup'}
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Game</p>
                <p className="text-gray-900">{selectedLoan.game.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User</p>
                <p className="text-gray-900">{selectedLoan.user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Due Date</p>
                <p className="text-gray-900">{new Date(selectedLoan.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Add any notes about this action..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setShowLoanModal(false); setSelectedLoan(null); setActionNotes(''); }}
                className={MODAL_SECONDARY_BUTTON_CLASS}
              >
                Cancel
              </button>
              {selectedLoan.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleLoanAction('reject')}
                    disabled={isProcessing}
                    className={MODAL_DANGER_BUTTON_CLASS}
                  >
                    {isProcessing ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleLoanAction('approve')}
                    disabled={isProcessing}
                    className={MODAL_SUCCESS_BUTTON_CLASS}
                  >
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleLoanAction('pickup')}
                  disabled={isProcessing}
                  className={MODAL_PRIMARY_BUTTON_CLASS}
                >
                  {isProcessing ? 'Processing...' : 'Confirm Pickup'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Return Action Modal */}
      {showReturnModal && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedReturn.status === 'pending' ? 'Return Approval' : 'Confirm Return'}
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Loan ID</p>
                <p className="text-gray-900">#{selectedReturn.loanId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Return Method</p>
                <p className="text-gray-900">{selectedReturn.returnMethod || 'N/A'}</p>
              </div>
              {selectedReturn.trackingNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                  <p className="text-gray-900">{selectedReturn.trackingNumber}</p>
                </div>
              )}
              {selectedReturn.returnNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">User Notes</p>
                  <p className="text-gray-900">{selectedReturn.returnNotes}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Add any notes about this action..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setShowReturnModal(false); setSelectedReturn(null); setActionNotes(''); }}
                className={MODAL_SECONDARY_BUTTON_CLASS}
              >
                Cancel
              </button>
              {selectedReturn.status === 'pending' ? (
                <button
                  onClick={() => handleReturnAction('approve')}
                  disabled={isProcessing}
                  className={MODAL_SUCCESS_BUTTON_CLASS}
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </button>
              ) : (
                <button
                  onClick={() => handleReturnAction('complete')}
                  disabled={isProcessing}
                  className={MODAL_PRIMARY_BUTTON_CLASS}
                >
                  {isProcessing ? 'Processing...' : 'Confirm Return'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
