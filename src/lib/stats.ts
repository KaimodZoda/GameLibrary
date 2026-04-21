// Shared utility functions for stats calculations

export const getDisplayStatus = (loan: any, returnRequests?: any[]) => {
  const returnRequest = returnRequests?.find(req => req.loanId === loan.id);
  
  if (loan.status === 'pending') return 'Borrow Pending';
  if (loan.status === 'approved') return 'Borrow Approved';
  if (loan.status === 'completed') {
    if (!returnRequest) return 'Active';
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
    const isOverdue = new Date(loan.dueDate) < new Date();
    return (status === 'Active') && isOverdue;
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
