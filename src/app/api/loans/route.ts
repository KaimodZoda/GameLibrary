import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// GET /api/loans - Get current user's loans
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(token.sub!);
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
    // Get token from Authorization header or cookie
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(token.sub!);
    const body = await request.json();
    console.log('Loan request body:', body); // Debug log
    
    const { gameId, dueDate } = body;

    if (!gameId || !dueDate) {
      console.log('Missing required fields:', { gameId, dueDate }); // Debug log
      return NextResponse.json(
        { success: false, message: 'Game ID and due date are required' },
        { status: 400 }
      );
    }

    // Check if game exists and is available
    const game = await prisma.game.findUnique({
      where: { id: parseInt(gameId) }
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
          in: ['pending', 'approved']
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
          in: ['pending', 'approved']
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
        gameId: parseInt(gameId),
        dateBorrowed: new Date(),
        dueDate: calculatedDueDate
      }
    });

    // Update game availability
    await prisma.game.update({
      where: { id: parseInt(gameId) },
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
    console.error('Error creating loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to borrow game' },
      { status: 500 }
    );
  }
}
