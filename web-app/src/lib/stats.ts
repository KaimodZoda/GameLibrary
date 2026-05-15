import { getDisplayStatus, getLendingState, isLoanOverdue } from '@/lib/lending-state';
import type { LoanLike, ReturnLike } from '@/types/lending';

export { getDisplayStatus, isLoanOverdue };

export const calculateStats = <TLoan extends LoanLike, TReturn extends ReturnLike>(
  loans: TLoan[],
  returnRequests?: TReturn[]
) => {
  const activeLoans = loans.filter((loan) => {
    const state = getLendingState(loan, returnRequests);
    return state === 'active' || state === 'borrow_approved';
  });

  const borrowedLoans = loans.filter((loan) => {
    const state = getLendingState(loan, returnRequests);
    return state === 'active' || state === 'borrow_approved' || state === 'overdue';
  });

  const pendingLoans = loans.filter((loan) => {
    return getLendingState(loan, returnRequests) === 'borrow_pending';
  });

  const overdueLoans = loans.filter((loan) => {
    return getLendingState(loan, returnRequests) === 'overdue';
  });

  const returnedLoans = loans.filter((loan) => {
    return getLendingState(loan, returnRequests) === 'returned';
  });

  const returnInProgressLoans = loans.filter((loan) => {
    const state = getLendingState(loan, returnRequests);
    return state === 'return_approved' || state === 'return_pending';
  });

  return {
    activeLoans: activeLoans.length,
    borrowedLoans: borrowedLoans.length,
    pendingLoans: pendingLoans.length,
    overdueLoans: overdueLoans.length,
    returnedLoans: returnedLoans.length,
    returnInProgressLoans: returnInProgressLoans.length
  };
};

export interface AdminStats {
  borrowPending: number;
  borrowApproved: number;
  active: number;
  overdue: number;
  returnPending: number;
  returnApproved: number;
  returned: number;
  rejected: number;
}

const initialAdminStats: AdminStats = {
  borrowPending: 0,
  borrowApproved: 0,
  active: 0,
  overdue: 0,
  returnPending: 0,
  returnApproved: 0,
  returned: 0,
  rejected: 0
};

export const calculateAdminStats = <TLoan extends LoanLike, TReturn extends ReturnLike>(
  loans: TLoan[],
  returnRequests?: TReturn[]
): AdminStats => {
  return loans.reduce<AdminStats>((acc, loan) => {
    const state = getLendingState(loan, returnRequests);

    if (state === 'borrow_pending') acc.borrowPending += 1;
    if (state === 'borrow_approved') acc.borrowApproved += 1;
    if (state === 'active') acc.active += 1;
    if (state === 'overdue') acc.overdue += 1;
    if (state === 'return_pending') acc.returnPending += 1;
    if (state === 'return_approved') acc.returnApproved += 1;
    if (state === 'returned') acc.returned += 1;
    if (state === 'rejected') acc.rejected += 1;

    return acc;
  }, { ...initialAdminStats });
};
