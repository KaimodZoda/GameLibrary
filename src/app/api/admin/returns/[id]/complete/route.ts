import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// PUT /api/admin/returns/:id/complete - Confirm return completion
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const adminId = parseInt(authResult.sub!);
    const resolvedParams = await params;
    const returnId = parseInt(resolvedParams.id);
    const { notes } = await request.json();

    // Check if return request exists and is approved
    const returnRequest = await prisma.return.findUnique({
      where: { id: returnId }
    });

    if (!returnRequest) {
      return NextResponse.json(
        { success: false, message: 'Return request not found' },
        { status: 404 }
      );
    }

    if (returnRequest.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: 'Return request is not in approved status' },
        { status: 400 }
      );
    }

    // Update return status to completed
    const updatedReturn = await prisma.return.update({
      where: { id: returnId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        completedBy: adminId
      }
    });

    // Update the associated loan to mark as fully completed
    await prisma.loan.update({
      where: { id: returnRequest.loanId },
      data: {
        completedAt: new Date(),
        completedBy: adminId
      }
    });

    // Update game availability to make it available again
    const loan = await prisma.loan.findUnique({
      where: { id: returnRequest.loanId }
    });

    if (loan) {
      await prisma.game.update({
        where: { id: loan.gameId },
        data: { available: true }
      });
    }

    // Create admin action record
    await prisma.adminAction.create({
      data: {
        returnId: returnId,
        adminId,
        action: 'return_completed',
        notes: notes || 'Return completed, game available again'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Return completed successfully',
      data: updatedReturn
    });
  } catch (error) {
    console.error('Error completing return:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to complete return' },
      { status: 500 }
    );
  }
}
