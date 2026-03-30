import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Parallel fetch of game counts
    const [totalGames, availableGames] = await Promise.all([
      prisma.game.count(),
      prisma.game.count({ where: { available: true } })
    ]);
    
    const borrowedGames = totalGames - availableGames;

    return NextResponse.json({
      success: true,
      data: {
        totalGames,
        availableGames,
        borrowedGames
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
