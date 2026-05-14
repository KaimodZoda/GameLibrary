import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { LoanStatus } from '@prisma/client';
import { requireAuth, getUserId } from '@/lib/auth';

// DELETE /api/loans/[id] - Cancel a pending loan request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const userId = getUserId(authResult);
    const { id } = await params;
    const loanId = parseInt(id);

    // Find the loan
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { game: true }
    });

    if (!loan) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }

    // Check if the loan belongs to the current user
    if (loan.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'You can only cancel your own loan requests' },
        { status: 403 }
      );
    }

    // Only allow canceling requests before the user has picked up the game.
    if (loan.status === LoanStatus.picked_up || loan.status === LoanStatus.returned) {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel a loan after pickup or return completion' },
        { status: 400 }
      );
    }

    // Delete the loan
    await prisma.loan.delete({
      where: { id: loanId }
    });

    // Restore game availability if it was marked as unavailable
    if (!loan.game.available) {
      await prisma.game.update({
        where: { id: loan.gameId },
        data: { available: true }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Loan request cancelled successfully'
    });
  } catch (error) {
    console.error('Error canceling loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel loan request' },
      { status: 500 }
    );
  }
}
