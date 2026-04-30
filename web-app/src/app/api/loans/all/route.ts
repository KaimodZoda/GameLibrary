import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';

// GET /api/loans/all - Get all loans (for global game status display)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const loans = await prisma.loan.findMany({
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
    console.error('Error fetching all loans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch all loans' },
      { status: 500 }
    );
  }
}
