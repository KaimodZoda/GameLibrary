import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { LoanStatus, ReturnStatus } from '@prisma/client';
import { requireAuth, getUserId } from '@/lib/auth';
import { createLoanSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// GET /api/loans - Get current user's loans
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const userId = getUserId(authResult);
    const loans = await prisma.loan.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        gameId: true,
        dateBorrowed: true,
        dueDate: true,
        approvedBy: true,
        approvedAt: true,
        completedBy: true,
        completedAt: true,
        pickupDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        game: {
          select: {
            id: true,
            title: true,
            platform: true,
            genre: true,
            gradient: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            name: true
          }
        }
      },
      orderBy: { dateBorrowed: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: loans
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

// POST /api/loans - Create a new loan (borrow a game)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const userId = getUserId(authResult);
    const body = await request.json();
    console.log('Loan request body:', body); // Debug log

    // Validate request body
    const validatedData = createLoanSchema.parse(body);
    const { gameId, dueDate } = validatedData;

    // Check if game exists and is available
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    console.log('Game found:', game); // Debug log

    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }

    if (!game.available) {
      console.log('Game not available:', game.available); // Debug log
      return NextResponse.json(
        { success: false, message: 'Game is not available' },
        { status: 400 }
      );
    }

    // Check if user already has an active loan for this game
    const existingLoan = await prisma.loan.findFirst({
      where: {
        userId,
        gameId,
        status: {
          in: [LoanStatus.pending, LoanStatus.approved, LoanStatus.picked_up]
        }
      }
    });

    // Also check if there's a return in progress
    const userLoans = await prisma.loan.findMany({
      where: {
        userId,
        gameId
      },
      select: { id: true }
    });
    
    const userLoanIds = userLoans.map(loan => loan.id);
    
    const activeReturn = await prisma.return.findFirst({
      where: {
        loanId: {
          in: userLoanIds
        },
        status: {
          in: [ReturnStatus.pending, ReturnStatus.approved]
        }
      }
    });

    console.log('Existing loan:', existingLoan); // Debug log
    console.log('Active return:', activeReturn); // Debug log

    if (existingLoan || activeReturn) {
      return NextResponse.json(
        { success: false, message: 'You already have an active loan or return in progress for this game' },
        { status: 400 }
      );
    }

    // Calculate due date (default 14 days from borrow date)
    const calculatedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Create the loan
    const loan = await prisma.loan.create({
      data: {
        userId,
        gameId,
        dateBorrowed: new Date(),
        dueDate: calculatedDueDate
      }
    });

    // Update game availability
    await prisma.game.update({
      where: { id: gameId },
      data: { available: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Game borrowed successfully',
      data: {
        loanId: loan.id,
        dueDate: calculatedDueDate.toISOString().split('T')[0]
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
    console.error('Error creating loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to borrow game' },
      { status: 500 }
    );
  }
}
