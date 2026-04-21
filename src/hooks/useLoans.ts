import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';

interface Loan {
  id: number;
  gameId: number;
  dateBorrowed: string;
  dueDate: string;
  returnedAt?: string;
  approvedAt?: string;
  returnApprovedAt?: string;
  game: {
    id: number;
    title: string;
    platform: string;
    genre: string;
    gradient: string;
  };
  user: {
    name: string;
    email: string;
  };
  approver?: {
    name: string;
  };
  returnApprover?: {
    name: string;
  };
  returnRequest?: {
    id: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface UseLoansReturn {
  loans: Loan[];
  returnRequests: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  borrowGame: (gameId: number, dueDate?: string) => Promise<{ success: boolean; message: string; data?: any }>;
  returnGame: (loanId: number) => Promise<{ success: boolean; message: string }>;
}

export const useLoans = (skipFetch = false): UseLoansReturn => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [loansResponse, returnsResponse] = await Promise.all([
        fetch('/api/loans'),
        fetch('/api/returns')
      ]);
      
      const loansResult = await loansResponse.json();
      const returnsResult = await returnsResponse.json();
      
      if (loansResult.success) {
        setLoans(loansResult.data);
      } else {
        setError(loansResult.message || 'Failed to fetch loans');
      }

      if (Array.isArray(returnsResult)) {
        setReturnRequests(returnsResult);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const borrowGame = async (gameId: number, dueDate?: string) => {
    // Check if user is authenticated
    if (!session?.user) {
      // Redirect to sign in
      signIn();
      return {
        success: false,
        message: 'Please sign in to borrow games'
      };
    }

    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId, dueDate }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refetch loans to update the list
        await fetchLoans();
      }
      
      return result;
    } catch (err) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  };

  const returnGame = async (loanId: number) => {
    try {
      const response = await fetch(`/api/loans/${loanId}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          returnMethod: 'in-person', // Default return method
          notes: 'Returned via My Loans page'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refetch loans to update the list
        await fetchLoans();
      }
      
      return result;
    } catch (err) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  };

  useEffect(() => {
    if (session && !skipFetch) {
      fetchLoans();
    } else if (skipFetch) {
      setLoading(false);
    }
  }, [session, skipFetch]);

  return {
    loans,
    returnRequests,
    loading,
    error,
    refetch: fetchLoans,
    borrowGame,
    returnGame
  };
};
