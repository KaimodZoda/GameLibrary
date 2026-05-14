import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import type { LoanDashboardStats, LoanStatusValue, ReturnStatusValue, ReturnSummary } from '@/types/lending';

type LoanMutationResult = {
  success: boolean;
  message: string;
  data?: unknown;
};

export interface UserLoan {
  id: number;
  userId: number;
  gameId: number;
  dateBorrowed: string;
  dueDate: string;
  status: LoanStatusValue;
  approvedAt?: string;
  approvedBy?: number;
  pickupDate?: string;
  completedAt?: string;
  completedBy?: number;
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
    status: ReturnStatusValue;
    createdAt: string;
    updatedAt: string;
  };
}

interface UseLoansReturn {
  loans: UserLoan[];
  returnRequests: ReturnSummary[];
  stats: LoanDashboardStats;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  borrowGame: (gameId: number, dueDate?: string) => Promise<LoanMutationResult>;
  returnGame: (loanId: number) => Promise<{ success: boolean; message: string }>;
  cancelLoan: (loanId: number) => Promise<{ success: boolean; message: string }>;
  cancelReturnRequest: (returnId: number) => Promise<{ success: boolean; message: string }>;
}

export const useLoans = (skipFetch = false): UseLoansReturn => {
  const [loans, setLoans] = useState<UserLoan[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnSummary[]>([]);
  const [stats, setStats] = useState<LoanDashboardStats>({
    borrowedGames: 0,
    pendingLoans: 0,
    overdueLoans: 0,
    returnInProgressLoans: 0,
    returnedLoans: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const hasRequestedInitialData = useRef(false);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/loans/summary');
      const result = await response.json();

      if (result.success) {
        setLoans(result.data.loans);
        setReturnRequests(result.data.returnRequests);
        setStats(result.data.stats);
      } else {
        setError(result.message || 'Failed to fetch loans');
      }
    } catch {
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
    } catch {
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
    } catch {
      return {
        success: false,
        message: 'Network error'
      };
    }
  };

  const cancelLoan = async (loanId: number) => {
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        // Refetch loans to update the list
        await fetchLoans();
      }

      return result;
    } catch {
      return {
        success: false,
        message: 'Network error'
      };
    }
  };

  const cancelReturnRequest = async (returnId: number) => {
    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        // Refetch loans to update the list
        await fetchLoans();
      }

      return result;
    } catch {
      return {
        success: false,
        message: 'Network error'
      };
    }
  };

  useEffect(() => {
    if (skipFetch) {
      setLoading(false);
      return;
    }

    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }

    if (hasRequestedInitialData.current) {
      return;
    }

    if (status === 'loading' || session) {
      hasRequestedInitialData.current = true;
      fetchLoans();
    }
  }, [session, status, skipFetch]);

  return {
    loans,
    returnRequests,
    stats,
    loading,
    error,
    refetch: fetchLoans,
    borrowGame,
    returnGame,
    cancelLoan,
    cancelReturnRequest
  };
};
