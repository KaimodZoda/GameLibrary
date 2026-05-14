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
