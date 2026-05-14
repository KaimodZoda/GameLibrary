'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoans, type UserLoan } from '@/hooks/useLoans';
import {
  getDisplayStatus,
  getLendingState
} from '@/lib/lending-state';
import type { ReturnSummary } from '@/types/lending';

// Force dynamic rendering to prevent prerendering
export const dynamic = 'force-dynamic';

function ReturnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loanId = searchParams.get('loanId');
  const [selectedLoan, setSelectedLoan] = useState<UserLoan | null>(null);
  const [returnMethod, setReturnMethod] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnRequests, setReturnRequests] = useState<ReturnSummary[]>([]);
  const { loans } = useLoans();
  const returnableLoans = loans.filter((loan) => {
    const lendingState = getLendingState(loan, returnRequests);
    return lendingState === 'active' || lendingState === 'overdue';
  });

  // Fetch return requests
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

  // Auto-select loan if ID is provided
  useEffect(() => {
    if (loanId) {
      const loan = returnableLoans.find((item) => item.id === parseInt(loanId));
      if (loan) {
        setSelectedLoan(loan);
        setReturnMethod('in-person');
      }
    }
  }, [loanId, returnableLoans]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/loans/${selectedLoan.id}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          loanId: selectedLoan.id,
          returnMethod,
          trackingNumber,
          estimatedReturnDate: expectedReturnDate,
          returnNotes: notes
        })
      });
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to return game: Server error');
        return;
      }
      
      const result = await response.json();
      
      if (result.success) {
        router.push('./my-loans?returnSuccess=true');
      } else {
        console.error('Failed to return game:', result.message);
      }
    } catch (error) {
      console.error('Error returning game:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-gray-50 py-8">
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
                  {loans.filter((loan) => {
                    const lendingState = getLendingState(loan, returnRequests);
                    return lendingState === 'active' || lendingState === 'overdue';
                  }).map((loan) => (
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
                          <p className="text-sm font-medium text-gray-900 truncate">{loan.game.title}</p>
                          <p className="text-xs text-gray-500">{loan.game.platform}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            getLendingState(loan, returnRequests) === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {getDisplayStatus(loan, returnRequests)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {returnableLoans.length === 0 && (
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
                          <p className="font-medium text-gray-900">{selectedLoan.game.title}</p>
                          <p className="text-sm text-gray-600">{selectedLoan.game.platform}</p>
                          <p className="text-xs text-gray-500">
                            Borrowed: {new Date(selectedLoan.dateBorrowed).toLocaleDateString()} | Due: {new Date(selectedLoan.dueDate).toLocaleDateString()}
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
      </div>
    </>
  );
}

export default function ReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ReturnPageContent />
    </Suspense>
  );
}
