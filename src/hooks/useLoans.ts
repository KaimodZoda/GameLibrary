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
}

interface UseLoansReturn {
  loans: Loan[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  borrowGame: (gameId: number, dueDate?: string) => Promise<{ success: boolean; message: string; data?: any }>;
  returnGame: (loanId: number) => Promise<{ success: boolean; message: string }>;
}

export const useLoans = (): UseLoansReturn => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/loans');
      const result = await response.json();
      
      if (result.success) {
        setLoans(result.data);
      } else {
        setError(result.message || 'Failed to fetch loans');
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
    if (session) {
      fetchLoans();
    }
  }, [session]);

  return {
    loans,
    loading,
    error,
    refetch: fetchLoans,
    borrowGame,
    returnGame
  };
};
