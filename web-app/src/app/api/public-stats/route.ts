import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Game counts (public stats - no auth required)
    const [totalGames, availableGames] = await Promise.all([
      prisma.game.count(),
      prisma.game.count({ where: { available: true } })
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        totalGames,
        availableGames,
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' // 2 min cache
      }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch public stats' 
      },
      { status: 500 }
    );
  }
}
