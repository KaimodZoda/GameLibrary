import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getUserId } from '@/lib/auth';
import { calculateStats } from '@/lib/stats';
import { toPublicReturnMethod } from '@/lib/return-method';
import { AdminActionType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const userId = getUserId(authResult);

    const [loans, returnRequests, returnRejections] = await Promise.all([
      prisma.loan.findMany({
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
      }),
      prisma.return.findMany({
        where: {
          loan: {
            userId
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.adminAction.findMany({
        where: {
          action: AdminActionType.return_rejected,
          loan: {
            userId
          }
        },
        select: {
          loanId: true,
          notes: true,
          actionDate: true
        },
        orderBy: {
          actionDate: 'desc'
        }
      })
    ]);

    const latestReturnRejectionByLoan = new Map<number, { notes: string; rejectedAt: string }>();
    for (const action of returnRejections) {
      if (!action.loanId || latestReturnRejectionByLoan.has(action.loanId)) continue;
      latestReturnRejectionByLoan.set(action.loanId, {
        notes: action.notes?.trim() || 'Your return request was rejected by admin.',
        rejectedAt: action.actionDate.toISOString()
      });
    }

    const stats = calculateStats(loans, returnRequests);

    return NextResponse.json({
      success: true,
      data: {
        loans: loans.map((loan) => ({
          ...loan,
          latestReturnRejection: latestReturnRejectionByLoan.get(loan.id)
        })),
        returnRequests: returnRequests.map((returnRequest) => ({
          ...returnRequest,
          requestedReturnDate: returnRequest.createdAt,
          returnMethod: toPublicReturnMethod(returnRequest.returnMethod)
        })),
        stats: {
          borrowedGames: stats.borrowedLoans,
          pendingLoans: stats.pendingLoans,
          overdueLoans: stats.overdueLoans,
          returnInProgressLoans: stats.returnInProgressLoans,
          returnedLoans: stats.returnedLoans
        }
      }
    });
  } catch (error) {
    console.error('Error fetching loan summary:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loan summary' },
      { status: 500 }
    );
  }
}
