import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateStats } from '@/lib/stats';
import { requireAuth, getUserId, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const requesterUserId = getUserId(authResult);
    const requesterIsAdmin = isAdmin(authResult);
    const { searchParams } = new URL(request.url);
    const requestedUserIdParam = searchParams.get('userId');
    const requestedUserId = requestedUserIdParam ? Number.parseInt(requestedUserIdParam, 10) : null;

    if (requestedUserIdParam && (requestedUserId === null || Number.isNaN(requestedUserId))) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid userId'
        },
        { status: 400 }
      );
    }

    // Non-admin users can only view their own stats regardless of query params.
    if (!requesterIsAdmin && requestedUserId !== null && requestedUserId !== requesterUserId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied'
        },
        { status: 403 }
      );
    }

    // Admins can request specific user stats via query param; no param means global stats.
    // Non-admins always get their own stats.
    const effectiveUserId = requesterIsAdmin ? requestedUserId : requesterUserId;

    // Fetch loans and return requests to calculate stats using shared utility
    // If effectiveUserId is provided, filter loans by user for user-specific stats
    const loansQuery = effectiveUserId !== null
      ? prisma.loan.findMany({
          where: { userId: effectiveUserId },
          include: {
            game: true,
            user: true
          }
        })
      : prisma.loan.findMany({
          include: {
            game: true,
            user: true
          }
        });

    const [allLoans, returnRequests] = await Promise.all([
      loansQuery,
      prisma.return.findMany()
    ]);

    const stats = calculateStats(allLoans, returnRequests);

    // Game counts
    const [totalGames, availableGames] = await Promise.all([
      prisma.game.count(),
      prisma.game.count({ where: { available: true } })
    ]);

    const borrowedGames = stats.borrowedLoans || stats.activeLoans;

    // Cache headers: longer for global stats, shorter for user-specific
    const isGlobalStats = effectiveUserId === null;
    const cacheControl = isGlobalStats
      ? 'public, s-maxage=60, stale-while-revalidate=120' // 1 min global stats
      : 'private, s-maxage=30, stale-while-revalidate=60'; // 30 sec user stats

    return NextResponse.json({
      success: true,
      data: {
        totalGames,
        availableGames,
        borrowedGames,
        pendingLoans: stats.pendingLoans,
        overdueLoans: stats.overdueLoans,
        returnInProgressLoans: stats.returnInProgressLoans,
        returnedLoans: stats.returnedLoans
      }
    }, {
      headers: {
        'Cache-Control': cacheControl
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch stats' 
      },
      { status: 500 }
    );
  }
}
