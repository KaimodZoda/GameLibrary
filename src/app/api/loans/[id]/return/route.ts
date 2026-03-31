import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

// PUT /api/loans/[id]/return - Return a borrowed game
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const loanId = parseInt(resolvedParams.id);
    const userId = parseInt(session.user.id);

    // Get the loan
    const loan = await prisma.loan.findUnique({
      where: { 
        id: loanId,
        userId // Ensure user owns this loan
      },
      include: {
        game: true,
        user: true
      }
    });

    if (!loan) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }

    if (loan.returnedAt) {
      return NextResponse.json(
        { success: false, message: 'Game already returned' },
        { status: 400 }
      );
    }

    const { returnMethod, trackingNumber, notes } = await request.json();

    // Update the loan with return information
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        returnedAt: new Date(),
        returnApprovedAt: new Date(),
        returnApprovedBy: userId
      }
    });

    // Make the game available again
    await prisma.game.update({
      where: { id: loan.gameId },
      data: { available: true }
    });

    // TODO: Create return record for tracking purposes
    // await prisma.return.create({
    //   data: {
    //     loanId,
    //     returnMethod,
    //     trackingNumber,
    //     notes,
    //     processedBy: userId
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'Game returned successfully',
      data: {
        loan: updatedLoan,
        game: loan.game
      }
    });
  } catch (error) {
    console.error('Error returning loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to return game' },
      { status: 500 }
    );
  }
}
