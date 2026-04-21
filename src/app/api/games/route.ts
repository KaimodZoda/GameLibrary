import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build where clause for Prisma
    const where: any = {};

    // Filter by platform
    if (platform && platform !== 'All Platforms') {
      where.platform = platform;
    }

    // Filter by genre
    if (genre && genre !== 'All Genres') {
      where.genre = genre;
    }

    // Filter by search query
    if (search) {
      where.title = {
        contains: search
      };
    }

    // Get total count for pagination
    const total = await prisma.game.count({ where });

    // Get paginated games
    const games = await prisma.game.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: games,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch games'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Support both single game and array of games
    const gamesToAdd = Array.isArray(body) ? body : [body];
    
    const results = [];
    
    for (const gameData of gamesToAdd) {
      const game = await prisma.game.create({
        data: {
          title: gameData.title,
          platform: gameData.platform,
          genre: gameData.genre,
          available: gameData.available ?? true,
          gradient: gameData.gradient || 'from-gray-400 to-gray-500'
        }
      });
      results.push(game);
    }
    
    return NextResponse.json({
      success: true,
      message: `Added ${results.length} game(s) successfully`,
      data: results.length === 1 ? results[0] : results
    });
  } catch (error) {
    console.error('Error adding games:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to add games' 
      },
      { status: 500 }
    );
  }
}
