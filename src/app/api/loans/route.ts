import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

// GET /api/loans - Get current user's loans
export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const loans = await prisma.loan.findMany({
      where: { userId },
      include: {
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
        },
        returnApprover: {
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
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const { gameId, dueDate } = await request.json();

    if (!gameId || !dueDate) {
      return NextResponse.json(
        { success: false, message: 'Game ID and due date are required' },
        { status: 400 }
      );
    }

    // Check if game exists and is available
    const game = await prisma.game.findUnique({
      where: { id: parseInt(gameId) }
    });

    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }

    if (!game.available) {
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
        returnedAt: null
      }
    });

    if (existingLoan) {
      return NextResponse.json(
        { success: false, message: 'You already have an active loan for this game' },
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
