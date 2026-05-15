export type LoanStatusValue = 'pending' | 'approved' | 'picked_up' | 'returned' | 'rejected';
export type ReturnStatusValue = 'pending' | 'approved' | 'completed';
export type ReturnMethodValue = 'in-person' | 'drop-box' | 'shipping' | 'courier';

export type LendingState =
  | 'borrow_pending'
  | 'borrow_approved'
  | 'active'
  | 'overdue'
  | 'return_pending'
  | 'return_approved'
  | 'returned'
  | 'rejected'
  | 'unknown';

export interface ReturnLike {
  loanId: number;
  status: ReturnStatusValue;
}

export interface LoanLike {
  id: number;
  dueDate: string | Date;
  status: LoanStatusValue;
}

export interface LoanSummary extends LoanLike {
  id: number;
  gameId: number;
  userId: number;
  dateBorrowed: string;
  approvedAt?: string;
  approvedBy?: number;
  pickupDate?: string;
  completedAt?: string;
  completedBy?: number;
  latestReturnRejection?: {
    notes: string;
    rejectedAt: string;
  };
}

export interface ReturnSummary extends ReturnLike {
  id: number;
  requestedReturnDate: string;
  approvedAt?: string;
  approvedBy?: number;
  completedAt?: string;
  completedBy?: number;
  estimatedReturnDate?: string;
  returnMethod?: ReturnMethodValue;
  trackingNumber?: string;
  returnNotes?: string;
}

export interface LoanDashboardStats {
  borrowedGames: number;
  pendingLoans: number;
  overdueLoans: number;
  returnInProgressLoans: number;
  returnedLoans: number;
}
