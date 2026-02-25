'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loanId = searchParams.get('loanId');
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [returnMethod, setReturnMethod] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select loan if ID is provided in URL
  useEffect(() => {
    if (loanId) {
      const loan = activeLoans.find(l => l.id === parseInt(loanId));
      if (loan) {
        setSelectedLoan(loan);
      }
    }
  }, [loanId]);

  // Mock loan data - in real app, this would come from API/props
  const activeLoans = [
    {
      id: 1,
      gameTitle: 'The Legend of Zelda',
      platform: 'Nintendo Switch',
      borrowDate: '2024-02-15',
      dueDate: '2024-02-29',
      status: 'active',
      coverImage: '/placeholder-game.jpg'
    },
    {
      id: 2,
      gameTitle: 'Elden Ring',
      platform: 'PlayStation 5',
      borrowDate: '2024-02-10',
      dueDate: '2024-02-24',
      status: 'overdue',
      coverImage: '/placeholder-game.jpg'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setIsSubmitting(true);
    
    // TODO: Implement actual return API call
    console.log('Return submission:', {
      loanId: selectedLoan.id,
      returnMethod,
      trackingNumber,
      expectedReturnDate,
      notes
    });

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/my-loans?returnSuccess=true');
    }, 1500);
  };

  return (
    <>
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Return Game</h1>
            <p className="text-gray-600">Select a game to return and provide return details</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Loan Selection */}
            <div className="order-2 lg:order-1 lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Select Loan</h2>
                <div className="space-y-4">
                  {activeLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedLoan?.id === loan.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedLoan(loan)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                          <i className="fas fa-gamepad text-gray-500 text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{loan.gameTitle}</p>
                          <p className="text-xs text-gray-500">{loan.platform}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            loan.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {loan.status === 'active' ? 'Active' : 'Overdue'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {activeLoans.length === 0 && (
                    <div className="text-center py-8">
                      <i className="fas fa-box-open text-gray-400 text-4xl mb-4"></i>
                      <p className="text-gray-600">No active loans to return</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Return Form */}
            <div className="order-1 lg:order-2 lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Return Details</h2>
                
                {selectedLoan ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Selected Game Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Selected Game</h3>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                          <i className="fas fa-gamepad text-gray-500"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedLoan.gameTitle}</p>
                          <p className="text-sm text-gray-600">{selectedLoan.platform}</p>
                          <p className="text-xs text-gray-500">
                            Borrowed: {selectedLoan.borrowDate} | Due: {selectedLoan.dueDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Return Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Return Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={returnMethod}
                        onChange={(e) => setReturnMethod(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select return method...</option>
                        <option value="in-person">In Person</option>
                        <option value="drop-box">Drop Box</option>
                        <option value="shipping">Shipping</option>
                        <option value="courier">Courier Pickup</option>
                      </select>
                    </div>

                    {/* Tracking Number */}
                    {(returnMethod === 'shipping' || returnMethod === 'courier') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tracking Number
                        </label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Enter tracking number (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {/* Expected Return Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Return Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={expectedReturnDate}
                        onChange={(e) => setExpectedReturnDate(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Any additional information about the return..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!selectedLoan || !returnMethod || !expectedReturnDate || isSubmitting}
                        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Processing...' : 'Submit Return'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <i className="fas fa-hand-pointer text-gray-400 text-4xl mb-4"></i>
                    <p className="text-gray-600">Select a loan from the left to start the return process</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
