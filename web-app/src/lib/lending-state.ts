import type {
  LendingState,
  LoanLike,
  ReturnLike
} from '@/types/lending';

export type {
  LendingState,
  LoanLike,
  LoanStatusValue,
  ReturnLike,
  ReturnStatusValue
} from '@/types/lending';

const DISPLAY_STATUS_BY_STATE: Record<LendingState, string> = {
  borrow_pending: 'Borrow Pending',
  borrow_approved: 'Borrow Approved',
  active: 'Active',
  overdue: 'Overdue',
  return_pending: 'Return Pending',
  return_approved: 'Returning',
  returned: 'Returned',
  rejected: 'Rejected',
  unknown: 'Unknown'
};

export const isLoanOverdue = (dueDate: string | Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
};

export const getReturnRequestForLoan = <TReturn extends ReturnLike>(
  loanId: number,
  returnRequests?: TReturn[]
): TReturn | undefined => {
  return returnRequests?.find((request) => request.loanId === loanId);
};

export const getLendingState = <TLoan extends LoanLike, TReturn extends ReturnLike>(
  loan: TLoan,
  returnRequests?: TReturn[]
): LendingState => {
  const returnRequest = getReturnRequestForLoan(loan.id, returnRequests);

  if (loan.status === 'pending') return 'borrow_pending';
  if (loan.status === 'approved') return 'borrow_approved';
  if (loan.status === 'returned') return 'returned';
  if (loan.status === 'rejected') return 'rejected';

  if (loan.status === 'picked_up') {
    if (!returnRequest) {
      return isLoanOverdue(loan.dueDate) ? 'overdue' : 'active';
    }

    if (returnRequest.status === 'pending') return 'return_pending';
    if (returnRequest.status === 'approved') return 'return_approved';
    if (returnRequest.status === 'completed') return 'returned';
  }

  return 'unknown';
};

export const getDisplayStatus = <TLoan extends LoanLike, TReturn extends ReturnLike>(
  loan: TLoan,
  returnRequests?: TReturn[]
): string => {
  return DISPLAY_STATUS_BY_STATE[getLendingState(loan, returnRequests)];
};
