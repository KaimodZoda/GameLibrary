import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// Force dynamic rendering to prevent prerendering
export const dynamic = 'force-dynamic';

// GET /api/admin/actions - Fetch all admin actions
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const adminActions = await prisma.adminAction.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        loan: {
          include: {
            game: {
              select: {
                title: true,
                platform: true
              }
            },
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        return: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch loan details for return actions separately
    const actionsWithLoanDetails = await Promise.all(
      adminActions.map(async (action) => {
        if (action.return && action.return.loanId) {
          const loan = await prisma.loan.findUnique({
            where: { id: action.return.loanId },
            include: {
              game: {
                select: {
                  title: true,
                  platform: true
                }
              },
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          });
          return {
            ...action,
            return: {
              ...action.return,
              loan
            }
          };
        }
        return action;
      })
    );

    return NextResponse.json({
      success: true,
      data: actionsWithLoanDetails
    });
  } catch (error) {
    console.error('Error fetching admin actions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin actions' },
      { status: 500 }
    );
  }
}
