'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MyLoans() {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  const handleDetailsClick = (loan: any) => {
    setSelectedLoan(loan);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLoan(null);
  };
  // TODO: Replace with actual user loans data
  const loans = [
    {
      id: 1,
      gameTitle: 'The Legend of Zelda',
      platform: 'Nintendo Switch',
      borrowDate: '2024-02-15',
      dueDate: '2024-02-29',
      status: 'active', // active, returned, overdue
      coverImage: '/placeholder-game.jpg',
      approvedBy: 'John Smith',
      approvedDate: '2024-02-15',
      returnedDate: null
    },
    {
      id: 2,
      gameTitle: 'Elden Ring',
      platform: 'PlayStation 5',
      borrowDate: '2024-02-10',
      dueDate: '2024-02-24',
      status: 'overdue',
      coverImage: '/placeholder-game.jpg',
      approvedBy: 'Sarah Johnson',
      approvedDate: '2024-02-10',
      returnedDate: null
    },
    {
      id: 3,
      gameTitle: 'FIFA 24',
      platform: 'Xbox Series X',
      borrowDate: '2024-02-01',
      dueDate: '2024-02-15',
      status: 'returned',
      coverImage: '/placeholder-game.jpg',
      approvedBy: 'Mike Wilson',
      approvedDate: '2024-02-01',
      returnedDate: '2024-02-14'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'overdue':
        return 'Overdue';
      case 'returned':
        return 'Returned';
      default:
        return 'Unknown';
    }
  };

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
                  <p className={statsNumberClass}>1</p>
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
                  <p className={statsNumberClass}>1</p>
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
                  <p className={statsNumberClass}>1</p>
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
                        <div className="flex items-center justify-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <i className="fas fa-gamepad text-gray-500"></i>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{loan.gameTitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className={tableCellClass}>
                        {loan.platform}
                      </td>
                      <td className={tableCellClass}>
                        {loan.borrowDate}
                      </td>
                      <td className={tableCellClass}>
                        {loan.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center">
                          <span className={`${statusBadgeClass} ${getStatusColor(loan.status)}`}>
                            {getStatusText(loan.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-center">
                          <div>
                            {loan.status === 'active' && (
                              <button className={actionButtonClass}>
                                Return
                              </button>
                            )}
                            {loan.status === 'overdue' && (
                              <button className={dangerButtonClass}>
                                Return Now
                              </button>
                            )}
                          </div>
                          <button className={secondaryButtonClass} onClick={() => handleDetailsClick(loan)}>
                            Details
                          </button>
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
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass} ${getStatusColor(selectedLoan.status)}`}>
                  {getStatusText(selectedLoan.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
}
