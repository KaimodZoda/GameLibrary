import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { requireAuth, getUserId } from '@/lib/auth';
import { createReturnSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// PUT /api/loans/[id]/return - Return a borrowed game
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const resolvedParams = await params;
    const loanId = parseInt(resolvedParams.id);
    const userId = getUserId(authResult);

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

    // Check if loan already has a return request
    const existingReturn = await prisma.return.findUnique({
      where: { loanId }
    });

    if (existingReturn && existingReturn.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Loan already returned' },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = createReturnSchema.parse(body);
    const { returnMethod, trackingNumber, returnNotes, estimatedReturnDate } = validatedData;

    // Create return record with pending status
    const returnRecord = await prisma.return.create({
      data: {
        loanId,
        returnMethod,
        trackingNumber,
        returnNotes,
        estimatedReturnDate: estimatedReturnDate ? new Date(estimatedReturnDate) : null,
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully',
      data: {
        loan,
        game: loan.game,
        returnRecord
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.issues
        },
        { status: 400 }
      );
    }
    console.error('Error returning loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to return game' },
      { status: 500 }
    );
  }
}
