import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalGames = await prisma.game.count();
    const availableGames = await prisma.game.count({ where: { available: true } });
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
