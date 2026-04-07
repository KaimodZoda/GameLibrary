'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLoans } from '@/hooks/useLoans';

export default function MyLoans() {
  const router = useRouter();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReturnConfirmModal, setShowReturnConfirmModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const { loans, loading, error, refetch, returnGame } = useLoans();
  const [returnRequests, setReturnRequests] = useState<any[]>([]);

  // Fetch return requests when component mounts
  useEffect(() => {
    const fetchReturnRequests = async () => {
      try {
        const response = await fetch('/api/returns');
        if (response.ok) {
          const data = await response.json();
          setReturnRequests(data);
        }
      } catch (error) {
        console.error('Error fetching return requests:', error);
      }
    };
    
    fetchReturnRequests();
  }, []);

  // Get display status based on loan and return request
  const getDisplayStatus = (loan: any) => {
    const returnRequest = returnRequests.find(req => req.loanId === loan.id);
    
    if (loan.status === 'pending') return 'Borrow Pending';
    if (loan.status === 'approved') return 'Borrow Approved';
    if (loan.status === 'completed') {
      if (!returnRequest) return 'Active';
      if (returnRequest.status === 'pending') return 'Return Pending';
      if (returnRequest.status === 'approved') return 'Returning';
      if (returnRequest.status === 'completed') return 'Returned';
    }
    return 'Unknown';
  };

  const getStatusColor = (displayStatus: string) => {
    switch (displayStatus) {
      case 'Borrow Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Borrow Approved':
        return 'bg-blue-100 text-blue-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
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

  const handleDetailsClick = (loan: any) => {
    setSelectedLoan(loan);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLoan(null);
  };

  const handleReturnClick = async (loan: any) => {
    // Show confirmation modal instead of direct return
    setSelectedLoan(loan);
    setShowReturnConfirmModal(true);
  };

  const handleConfirmReturn = () => {
    // Redirect to return page with loan ID
    router.push(`./return?loanId=${selectedLoan.id}`);
  };

  const handleCancelReturn = () => {
    setShowReturnConfirmModal(false);
    setSelectedLoan(null);
  };

  // Calculate stats based on new status logic
  const activeLoans = loans.filter(loan => {
    const status = getDisplayStatus(loan);
    return status === 'Active' || status === 'Borrow Approved';
  });
  
  const overdueLoans = loans.filter(loan => {
    const status = getDisplayStatus(loan);
    const isOverdue = new Date(loan.dueDate) < new Date();
    return (status === 'Active' || status === 'Borrow Approved') && isOverdue;
  });
  
  const returnedLoans = loans.filter(loan => {
    const status = getDisplayStatus(loan);
    return status === 'Returned';
  });

  // Reusable Tailwind classes
  const statsCardClass = "bg-white rounded-lg shadow p-6";
  const statsIconClass = "flex-shrink-0 rounded-lg p-3";
  const statsTextClass = "text-sm font-medium text-gray-600";
  const statsNumberClass = "text-2xl font-bold text-gray-900";
  const tableHeaderClass = "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tableCellClass = "px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900";
  const statusBadgeClass = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
  const actionButtonClass = "text-indigo-600 hover:text-indigo-900 mr-3";
  const dangerButtonClass = "text-red-600 hover:text-red-900 mr-3";
  const secondaryButtonClass = "text-gray-600 hover:text-gray-900";

  return (
    <>
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Loans</h1>
            <p className="text-gray-600">Manage your borrowed games and due dates</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={statsCardClass}>
              <div className="flex items-center">
                <div className={`${statsIconClass} bg-indigo-100`}>
                  <i className="fas fa-book text-indigo-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className={statsTextClass}>Active Loans</p>
                  <p className={statsNumberClass}>{activeLoans.length}</p>
                </div>
              </div>
            </div>
            <div className={statsCardClass}>
              <div className="flex items-center">
                <div className={`${statsIconClass} bg-red-100`}>
                  <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className={statsTextClass}>Overdue</p>
                  <p className={statsNumberClass}>{overdueLoans.length}</p>
                </div>
              </div>
            </div>
            <div className={statsCardClass}>
              <div className="flex items-center">
                <div className={`${statsIconClass} bg-green-100`}>
                  <i className="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className={statsTextClass}>Returned</p>
                  <p className={statsNumberClass}>{returnedLoans.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loans Table */}
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass} ${getStatusColor(getDisplayStatus(loan))}`}>
                            {getDisplayStatus(loan)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-center">
                          <div>
                            {(() => {
                              const status = getDisplayStatus(loan);
                              if (status === 'Returned') {
                                return <span className="text-gray-400">Returned</span>;
                              }
                              if (status === 'Return Pending' || status === 'Returning') {
                                return <span className="text-gray-400">Return in Progress</span>;
                              }
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

          {loans.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-book text-gray-400 text-5xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loans yet</h3>
              <p className="text-gray-600 mb-4">You haven't borrowed any games yet.</p>
              <a 
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Games
              </a>
            </div>
          )}
        </div>
      </main>
      
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
              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedLoan.gameTitle}</h4>
                <p className="text-sm text-gray-600">{selectedLoan.platform}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Borrow Date</p>
                  <p className="text-sm text-gray-900">{selectedLoan.borrowDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="text-sm text-gray-900">{selectedLoan.dueDate}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved By</p>
                  <p className="text-sm text-gray-900">{selectedLoan.approvedBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved Date</p>
                  <p className="text-sm text-gray-900">{selectedLoan.approvedDate}</p>
                </div>
              </div>
              
              {selectedLoan.returnedDate && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Returned Date</p>
                  <p className="text-sm text-gray-900">{selectedLoan.returnedDate}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass} ${getStatusColor(getDisplayStatus(selectedLoan))}`}>
                  {getDisplayStatus(selectedLoan)}
                </span>
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
      
      <Footer />
    </>
  );
}
