import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const game = await prisma.game.findUnique({
      where: { id }
    });

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
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch game' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();

    const game = await prisma.game.update({
      where: { id },
      data: {
        title: body.title,
        platform: body.platform,
        genre: body.genre,
        available: body.available,
        gradient: body.gradient
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Game updated successfully',
      data: game
    });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update game' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    const game = await prisma.game.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Game deleted successfully',
      data: game
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete game' 
      },
      { status: 500 }
    );
  }
}
