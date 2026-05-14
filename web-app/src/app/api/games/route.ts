import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createGameSchema, gamesQuerySchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters (filter out null values)
    const queryParams = gamesQuerySchema.parse({
      platform: searchParams.get('platform') || undefined,
      genre: searchParams.get('genre') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12'
    });

    const { platform, genre, search, page, limit } = queryParams;

    // Build where clause for Prisma
    const where: Prisma.GameWhereInput = {};

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
        contains: search,
        mode: 'insensitive'
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
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
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
      // Validate game data
      const validatedGame = createGameSchema.parse(gameData);

      const game = await prisma.game.create({
        data: {
          title: validatedGame.title,
          platform: validatedGame.platform,
          genre: validatedGame.genre,
          available: validatedGame.available ?? true,
          gradient: validatedGame.gradient || 'from-gray-400 to-gray-500'
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.issues
        },
        { status: 400 }
      );
    }
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
