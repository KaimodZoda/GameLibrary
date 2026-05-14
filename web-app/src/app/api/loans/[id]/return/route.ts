import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { LoanStatus, ReturnStatus } from '@prisma/client';
import { requireAuth, getUserId } from '@/lib/auth';
import { createReturnSchema } from '@/lib/validations';
import { toPrismaReturnMethod, toPublicReturnMethod } from '@/lib/return-method';
import { ZodError } from 'zod';
import { sanitizeInput } from '@/lib/sanitize';

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
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        userId
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

    if (loan.status !== LoanStatus.picked_up) {
      return NextResponse.json(
        { success: false, message: 'Only picked up loans can be returned' },
        { status: 400 }
      );
    }

    // Check if loan already has a return request
    const existingReturn = await prisma.return.findUnique({
      where: { loanId }
    });

    if (existingReturn && existingReturn.status === ReturnStatus.completed) {
      return NextResponse.json(
        { success: false, message: 'Loan already returned' },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = createReturnSchema.parse(body);
    const { returnMethod, trackingNumber, returnNotes, estimatedReturnDate } = validatedData;

    // Sanitize returnNotes to prevent XSS
    const sanitizedReturnNotes = returnNotes ? sanitizeInput(returnNotes) : undefined;

    // Create return record with pending status
    const returnRecord = await prisma.return.create({
      data: {
        loanId,
        returnMethod: toPrismaReturnMethod(returnMethod),
        trackingNumber,
        returnNotes: sanitizedReturnNotes,
        estimatedReturnDate: estimatedReturnDate ? new Date(estimatedReturnDate) : null,
        status: ReturnStatus.pending
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully',
      data: {
        loan,
        game: loan.game,
        returnRecord: {
          ...returnRecord,
          returnMethod: toPublicReturnMethod(returnRecord.returnMethod)
        }
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
