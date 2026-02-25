import { NextResponse } from 'next/server';
import { games } from '@/data/games';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  const game = games.find(g => g.id === id);

  if (!game) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Game not found' 
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: game
  });
}
