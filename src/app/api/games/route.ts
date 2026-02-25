import { NextResponse } from 'next/server';
import { games } from '@/data/games';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const search = searchParams.get('search');

  let filteredGames = games;

  // Filter by platform
  if (platform) {
    filteredGames = filteredGames.filter(game => 
      game.platform.toLowerCase().includes(platform.toLowerCase())
    );
  }

  // Filter by search query
  if (search) {
    filteredGames = filteredGames.filter(game => 
      game.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  return NextResponse.json({
    success: true,
    data: filteredGames,
    total: filteredGames.length
  });
}
