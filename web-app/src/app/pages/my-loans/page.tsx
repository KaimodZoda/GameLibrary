'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/StatCard';
import { useLoans, type UserLoan } from '@/hooks/useLoans';
import { getDisplayStatus, getLendingState } from '@/lib/lending-state';
import type { ReturnSummary } from '@/types/lending';

// Force dynamic rendering to prevent prerendering
export const dynamic = 'force-dynamic';

export default function MyLoans() {
  const router = useRouter();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReturnConfirmModal, setShowReturnConfirmModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showCancelReturnConfirmModal, setShowCancelReturnConfirmModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<UserLoan | null>(null);
  const [selectedReturnRequest, setSelectedReturnRequest] = useState<ReturnSummary | null>(null);
  const { loans, returnRequests, stats, loading, error, cancelLoan, cancelReturnRequest } = useLoans();

  const getStatusColor = (displayStatus: string) => {
    switch (displayStatus) {
      case 'Borrow Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Borrow Approved':
        return 'bg-blue-100 text-blue-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Rejected':
        return 'bg-gray-300 text-gray-800';
      case 'Return Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Returning':
        return 'bg-purple-100 text-purple-800';
      case 'Returned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDetailsClick = (loan: UserLoan) => {
    setSelectedLoan(loan);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLoan(null);
  };

  const handleReturnClick = async (loan: UserLoan) => {
    // Show confirmation modal instead of direct return
    setSelectedLoan(loan);
    setShowReturnConfirmModal(true);
  };

  const handleConfirmReturn = () => {
    if (!selectedLoan) return;
    // Redirect to return page with loan ID
    router.push(`/pages/return?loanId=${selectedLoan.id}`);
  };

  const handleCancelReturn = () => {
    setShowReturnConfirmModal(false);
    setSelectedLoan(null);
  };

  const handleCancelClick = (loan: UserLoan) => {
    setSelectedLoan(loan);
    setShowCancelConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedLoan || !cancelLoan) return;

    const result = await cancelLoan(selectedLoan.id);
    if (result.success) {
      setShowCancelConfirmModal(false);
      setSelectedLoan(null);
    }
  };

  const handleCancelCancelModal = () => {
    setShowCancelConfirmModal(false);
    setSelectedLoan(null);
  };

  const handleCancelReturnClick = (loan: UserLoan, returnRequest: ReturnSummary) => {
    setSelectedLoan(loan);
    setSelectedReturnRequest(returnRequest);
    setShowCancelReturnConfirmModal(true);
  };

  const handleConfirmCancelReturn = async () => {
    if (!selectedReturnRequest || !cancelReturnRequest) return;

    const result = await cancelReturnRequest(selectedReturnRequest.id);
    if (result.success) {
      setShowCancelReturnConfirmModal(false);
      setSelectedLoan(null);
      setSelectedReturnRequest(null);
    }
  };

  const handleCancelCancelReturnModal = () => {
    setShowCancelReturnConfirmModal(false);
    setSelectedLoan(null);
    setSelectedReturnRequest(null);
  };

  const tableHeaderClass = "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tableCellClass = "px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900";
  const statusBadgeClass = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
  const actionButtonClass = "text-indigo-600 hover:text-indigo-900 mr-3";
  const secondaryButtonClass = "text-gray-600 hover:text-gray-900";
  const getLoanState = (loan: UserLoan) => getLendingState(loan, returnRequests);
  const getLoanDisplayStatus = (loan: UserLoan) => getDisplayStatus(loan, returnRequests);

  return (
    <>
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Loans</h1>
            <p className="text-gray-600">Manage your borrowed games and due dates</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <StatCard type="pending" value={stats.pendingLoans} />
            <StatCard type="return-in-progress" value={stats.returnInProgressLoans} />
            <StatCard type="borrowed" value={stats.borrowedGames} />
            <StatCard type="overdue" value={stats.overdueLoans} />
            <StatCard type="returned" value={stats.returnedLoans} />
          </div>

          {loading ? (
            <div className="bg-white shadow rounded-lg p-10">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                <h2 className="mt-4 text-lg font-medium text-gray-900">Loading your loans</h2>
                <p className="mt-2 text-sm text-gray-600">Fetching your current borrowing history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white shadow rounded-lg p-10">
              <div className="flex flex-col items-center justify-center text-center">
                <i className="fas fa-exclamation-circle text-4xl text-red-500"></i>
                <h2 className="mt-4 text-lg font-medium text-gray-900">Could not load your loans</h2>
                <p className="mt-2 text-sm text-gray-600">{error}</p>
              </div>
            </div>
          ) : loans.length > 0 ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Loan History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={tableHeaderClass}>
                        Game
                      </th>
                      <th className={tableHeaderClass}>
                        Platform
                      </th>
                      <th className={tableHeaderClass}>
                        Borrow Date
                      </th>
                      <th className={tableHeaderClass}>
                        Due Date
                      </th>
                      <th className={tableHeaderClass}>
                        Status
                      </th>
                      <th className={tableHeaderClass}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loans.map((loan) => (
                      <tr key={loan.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-flex-start ml-6">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <i className="fas fa-gamepad text-gray-500"></i>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{loan.game.title}</div>
                              <div className="text-xs text-gray-500">{loan.game.platform}</div>
                            </div>
                          </div>
                        </td>
                        <td className={tableCellClass}>
                          {loan.game.platform}
                        </td>
                        <td className={tableCellClass}>
                          {new Date(loan.dateBorrowed).toLocaleDateString()}
                        </td>
                        <td className={tableCellClass}>
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass} ${getStatusColor(getLoanDisplayStatus(loan))}`}>
                              {getLoanDisplayStatus(loan)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center justify-center">
                            <div>
                              {(() => {
                                const lendingState = getLoanState(loan);

                                if (lendingState === 'returned') {
                                  return (
                                    <button className={secondaryButtonClass} onClick={() => handleDetailsClick(loan)}>
                                      Details
                                    </button>
                                  );
                                }

                                if (lendingState === 'return_pending' || lendingState === 'return_approved') {
                                  const returnRequest = returnRequests.find((req) => req.loanId === loan.id);
                                  if (!returnRequest) {
                                    return (
                                      <button className={secondaryButtonClass} onClick={() => handleDetailsClick(loan)}>
                                        Details
                                      </button>
                                    );
                                  }
                                  return (
                                    <>
                                      <button className="text-red-600 hover:text-red-900 mr-3" onClick={() => handleCancelReturnClick(loan, returnRequest)}>
                                        Cancel Return
                                      </button>
                                      <button className={secondaryButtonClass} onClick={() => handleDetailsClick(loan)}>
                                        Details
                                      </button>
                                    </>
                                  );
                                }

                                if (lendingState === 'active' || lendingState === 'overdue') {
                                  return (
                                    <>
                                      {loan.game.platform && (
                                        <button className={actionButtonClass} onClick={() => handleReturnClick(loan)}>
                                          Return
                                        </button>
                                      )}
                                      <button className={secondaryButtonClass} onClick={() => handleDetailsClick(loan)}>
                                        Details
                                      </button>
                                    </>
                                  );
                                }

                                if (lendingState === 'borrow_pending' || lendingState === 'borrow_approved') {
                                  return (
                                    <>
                                      <button className="text-red-600 hover:text-red-900 mr-3" onClick={() => handleCancelClick(loan)}>
                                        Cancel
                                      </button>
                                      <button className={secondaryButtonClass} onClick={() => handleDetailsClick(loan)}>
                                        Details
                                      </button>
                                    </>
                                  );
                                }

                                return (
                                  <button className={secondaryButtonClass} onClick={() => handleDetailsClick(loan)}>
                                    Details
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-book text-gray-400 text-5xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loans yet</h3>
              <p className="text-gray-600 mb-4">You haven&apos;t borrowed any games yet.</p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Games
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Details Modal */}
      {showDetailsModal && selectedLoan && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={handleCloseDetailsModal}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Loan Details</h3>
              <button 
                onClick={handleCloseDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Game Information */}
              <div className="border-b pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <i className="fas fa-gamepad text-gray-500 text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{selectedLoan.game?.title}</h4>
                    <p className="text-sm text-gray-600">{selectedLoan.game?.platform} • {selectedLoan.game?.genre}</p>
                  </div>
                </div>
              </div>
              
              {/* Loan Timeline */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 border-b pb-2">Loan Timeline</h5>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Request Date</p>
                    <p className="text-sm text-gray-900">
                      {selectedLoan.dateBorrowed ? new Date(selectedLoan.dateBorrowed).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Due Date</p>
                    <p className="text-sm text-gray-900">
                      {selectedLoan.dueDate ? new Date(selectedLoan.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Approved By</p>
                    <p className="text-sm text-gray-900">
                      {selectedLoan.approver?.name || 'Not approved'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Approved Date</p>
                    <p className="text-sm text-gray-900">
                      {selectedLoan.approvedAt ? new Date(selectedLoan.approvedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pickup Date</p>
                    <p className="text-sm text-gray-900">
                      {selectedLoan.pickupDate ? new Date(selectedLoan.pickupDate).toLocaleDateString() : 'Not picked up'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed Date</p>
                    <p className="text-sm text-gray-900">
                      {selectedLoan.completedAt ? new Date(selectedLoan.completedAt).toLocaleDateString() : 'Not completed'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Return Information */}
              {(() => {
                const returnRequest = returnRequests.find(req => req.loanId === selectedLoan.id);
                if (returnRequest) {
                  return (
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900 border-b pb-2">Return Information</h5>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Return Request Date</p>
                          <p className="text-sm text-gray-900">
                            {new Date(returnRequest.requestedReturnDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Return Method</p>
                          <p className="text-sm text-gray-900">
                            {returnRequest.returnMethod || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      
                      {returnRequest.trackingNumber && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                          <p className="text-sm text-gray-900">{returnRequest.trackingNumber}</p>
                        </div>
                      )}
                      
                      {returnRequest.returnNotes && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Return Notes</p>
                          <p className="text-sm text-gray-900">{returnRequest.returnNotes}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Return Approved By</p>
                          <p className="text-sm text-gray-900">
                            {returnRequest.approvedBy ? 'Admin' : 'Not approved'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Return Completed Date</p>
                          <p className="text-sm text-gray-900">
                            {returnRequest.completedAt ? new Date(returnRequest.completedAt).toLocaleDateString() : 'Not completed'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Current Status */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">Current Status</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass} ${getStatusColor(getLoanDisplayStatus(selectedLoan))}`}>
                    {getLoanDisplayStatus(selectedLoan)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Return Confirmation Modal */}
      {showReturnConfirmModal && selectedLoan && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={handleCancelReturn}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Confirm Return</h3>
              <button
                onClick={handleCancelReturn}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedLoan.game.title}</h4>
                <p className="text-sm text-gray-600">{selectedLoan.game.platform}</p>
                <p className="text-xs text-gray-500">{selectedLoan.game.genre}</p>
              </div>

              <div className="bg-yellow-50 border border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  You will be redirected to the return page to complete this process
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelReturn}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReturn}
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Return Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmModal && selectedLoan && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={handleCancelCancelModal}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cancel Loan Request</h3>
              <button
                onClick={handleCancelCancelModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedLoan.game.title}</h4>
                <p className="text-sm text-gray-600">{selectedLoan.game.platform}</p>
                <p className="text-xs text-gray-500">{selectedLoan.game.genre}</p>
              </div>

              <div className="bg-red-50 border border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Are you sure you want to cancel this loan request? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelCancelModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Yes, Cancel Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Return Confirmation Modal */}
      {showCancelReturnConfirmModal && selectedLoan && selectedReturnRequest && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={handleCancelCancelReturnModal}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cancel Return Request</h3>
              <button
                onClick={handleCancelCancelReturnModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedLoan.game.title}</h4>
                <p className="text-sm text-gray-600">{selectedLoan.game.platform}</p>
                <p className="text-xs text-gray-500">{selectedLoan.game.genre}</p>
              </div>

              <div className="bg-red-50 border border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Are you sure you want to cancel this return request? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelCancelReturnModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleConfirmCancelReturn}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Yes, Cancel Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
