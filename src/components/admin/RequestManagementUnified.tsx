'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type LoanRequest = {
  id: number;
  userId: number;
  gameId: number;
  dateBorrowed: string;
  dueDate: string;
  status: string;
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

type ReturnRequest = {
  id: number;
  loanId: number;
  requestedReturnDate: string;
  approvedAt?: string;
  approvedBy?: number;
  completedAt?: string;
  completedBy?: number;
  estimatedReturnDate?: string;
  returnMethod?: string;
  trackingNumber?: string;
  returnNotes?: string;
  status: string;
};

export default function RequestManagementUnified() {
  const { data: session } = useSession();
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchLoans(), fetchReturns()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLoanAction = async (action: 'approve' | 'pickup') => {
    if (!selectedLoan) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/loans/${selectedLoan.id}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: actionNotes })
      });
      
      if (response.ok) {
        await fetchLoans();
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
        await fetchReturns();
        await fetchLoans(); // Refresh loans too since return completion affects loan status
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

  // Get display status similar to my-loans page
  const getDisplayStatus = (loan: LoanRequest, returnRequest?: ReturnRequest) => {
    const returnReq = returns.find(req => req.loanId === loan.id);
    
    if (loan.status === 'pending') return 'Borrow Pending';
    if (loan.status === 'approved') return 'Borrow Approved';
    if (loan.status === 'completed') {
      if (!returnReq) return 'Active';
      if (returnReq.status === 'pending') return 'Return Pending';
      if (returnReq.status === 'approved') return 'Returning';
      if (returnReq.status === 'completed') return 'Returned';
    }
    return 'Unknown';
  };

  const getStatusColor = (displayStatus: string) => {
    switch (displayStatus) {
      case 'Borrow Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Borrow Approved': return 'bg-blue-100 text-blue-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Return Pending': return 'bg-orange-100 text-orange-800';
      case 'Returning': return 'bg-purple-100 text-purple-800';
      case 'Returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get available actions based on status
  const getAvailableActions = (loan: LoanRequest, returnRequest?: ReturnRequest) => {
    const displayStatus = getDisplayStatus(loan, returnRequest);
    
    switch (displayStatus) {
      case 'Borrow Pending':
        return { type: 'loan', actions: ['approve'] };
      case 'Borrow Approved':
        return { type: 'loan', actions: ['pickup'] };
      case 'Return Pending':
        return { type: 'return', actions: ['approve'] };
      case 'Returning':
        return { type: 'return', actions: ['complete'] };
      default:
        return { type: 'none', actions: [] };
    }
  };

  const pendingLoans = loans.filter(loan => loan.status === 'pending');
  const approvedLoans = loans.filter(loan => loan.status === 'approved');
  const pendingReturns = returns.filter(ret => ret.status === 'pending');
  const approvedReturns = returns.filter(ret => ret.status === 'approved');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Borrow Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingLoans.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <i className="fas fa-check-circle text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Borrow Approved</p>
              <p className="text-2xl font-bold text-gray-900">{approvedLoans.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <i className="fas fa-undo text-orange-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Return Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingReturns.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <i className="fas fa-shipping-fast text-purple-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Returning</p>
              <p className="text-2xl font-bold text-gray-900">{approvedReturns.length}</p>
            </div>
          </div>
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
              {loans.map((loan) => {
                const returnRequest = returns.find(req => req.loanId === loan.id);
                const displayStatus = getDisplayStatus(loan, returnRequest);
                const availableActions = getAvailableActions(loan, returnRequest);
                
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
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              {selectedLoan.status === 'pending' ? (
                <button
                  onClick={() => handleLoanAction('approve')}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </button>
              ) : (
                <button
                  onClick={() => handleLoanAction('pickup')}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              {selectedReturn.status === 'pending' ? (
                <button
                  onClick={() => handleReturnAction('approve')}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </button>
              ) : (
                <button
                  onClick={() => handleReturnAction('complete')}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
