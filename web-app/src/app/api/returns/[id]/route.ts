import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { requireAuth, getUserId } from '@/lib/auth';

// DELETE /api/returns/[id] - Cancel a return request
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
    const returnId = parseInt(id);

    // Find the return request
    const returnRequest = await prisma.return.findUnique({
      where: { id: returnId }
    });

    if (!returnRequest) {
      return NextResponse.json(
        { success: false, message: 'Return request not found' },
        { status: 404 }
      );
    }

    // Fetch the loan to check ownership
    const loan = await prisma.loan.findUnique({
      where: { id: returnRequest.loanId }
    });

    if (!loan) {
      return NextResponse.json(
        { success: false, message: 'Associated loan not found' },
        { status: 404 }
      );
    }

    // Check if the return request belongs to the current user (by checking the loan)
    if (loan.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'You can only cancel your own return requests' },
        { status: 403 }
      );
    }

    // Only allow canceling pending or approved return requests (not completed ones)
    if (returnRequest.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel a completed return' },
        { status: 400 }
      );
    }

    // Delete the return request
    await prisma.return.delete({
      where: { id: returnId }
    });

    return NextResponse.json({
      success: true,
      message: 'Return request cancelled successfully'
    });
  } catch (error) {
    console.error('Error canceling return request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel return request' },
      { status: 500 }
    );
  }
}
