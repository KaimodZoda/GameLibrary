// Shared utility functions for stats calculations

// Helper function to check if a loan is overdue (compares dates only, not time)
export const isLoanOverdue = (dueDate: string | Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

export const getDisplayStatus = (loan: any, returnRequests?: any[]) => {
  const returnRequest = returnRequests?.find(req => req.loanId === loan.id);

  if (loan.status === 'pending') return 'Borrow Pending';
  if (loan.status === 'approved') return 'Borrow Approved';
  if (loan.status === 'completed') {
    if (!returnRequest) {
      // Check if overdue
      if (isLoanOverdue(loan.dueDate)) return 'Overdue';
      return 'Active';
    }
    if (returnRequest.status === 'pending') return 'Return Pending';
    if (returnRequest.status === 'approved') return 'Returning';
    if (returnRequest.status === 'completed') return 'Returned';
  }
  return 'Unknown';
};

export const calculateStats = (loans: any[], returnRequests?: any[]) => {
  const activeLoans = loans.filter(loan => {
    const status = getDisplayStatus(loan, returnRequests);
    return status === 'Active' || status === 'Borrow Approved';
  });

  const pendingLoans = loans.filter(loan => {
    const status = getDisplayStatus(loan, returnRequests);
    return status === 'Borrow Pending';
  });

  const overdueLoans = loans.filter(loan => {
    const status = getDisplayStatus(loan, returnRequests);
    return (status === 'Active') && isLoanOverdue(loan.dueDate);
  });

  const returnedLoans = loans.filter(loan => {
    const status = getDisplayStatus(loan, returnRequests);
    return status === 'Returned';
  });

  const returnInProgressLoans = loans.filter(loan => {
    const status = getDisplayStatus(loan, returnRequests);
    return status === 'Returning' || status === 'Return Pending';
  });

  return {
    activeLoans: activeLoans.length,
    pendingLoans: pendingLoans.length,
    overdueLoans: overdueLoans.length,
    returnedLoans: returnedLoans.length,
    returnInProgressLoans: returnInProgressLoans.length
  };
};
