import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
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

    // Only allow canceling pending or approved loans (not completed ones)
    if (loan.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel a completed loan' },
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
