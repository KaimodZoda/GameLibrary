import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateStats } from '@/lib/stats';

export async function GET() {
  try {
    // Fetch all loans and return requests to calculate stats using shared utility
    const [allLoans, returnRequests] = await Promise.all([
      prisma.loan.findMany({
        include: {
          game: true,
          user: true
        }
      }),
      prisma.return.findMany()
    ]);

    const stats = calculateStats(allLoans, returnRequests);

    // Game counts
    const [totalGames, availableGames] = await Promise.all([
      prisma.game.count(),
      prisma.game.count({ where: { available: true } })
    ]);
    
    const borrowedGames = stats.activeLoans;

    return NextResponse.json({
      success: true,
      data: {
        totalGames,
        availableGames,
        borrowedGames,
        pendingLoans: stats.pendingLoans,
        overdueLoans: stats.overdueLoans,
        returnInProgressLoans: stats.returnInProgressLoans
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
