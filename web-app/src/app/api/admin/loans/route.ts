import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/loans - Get all loans for admin
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
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
            genre: true
          }
        },
        user: {
          select: {
            id: true,
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
    console.error('Error fetching admin loans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}
