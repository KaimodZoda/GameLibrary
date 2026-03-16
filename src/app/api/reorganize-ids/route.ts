import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Get all games ordered by current ID
    const allGames = await prisma.game.findMany({
      orderBy: { id: 'asc' }
    });

    // Create a new table with sequential IDs
    await prisma.$executeRaw`CREATE TABLE "Game_temp" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      platform TEXT NOT NULL,
      genre TEXT NOT NULL,
      available BOOLEAN NOT NULL DEFAULT true,
      gradient TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    )`;

    // Copy data with new sequential IDs
    for (let i = 0; i < allGames.length; i++) {
      const game = allGames[i];
      await prisma.$executeRaw`
        INSERT INTO "Game_temp" (id, title, platform, genre, available, gradient, createdAt, updatedAt)
        VALUES (${i + 1}, ${game.title}, ${game.platform}, ${game.genre}, ${game.available}, ${game.gradient}, ${game.createdAt}, ${game.updatedAt})
      `;
    }

    // Replace the old table
    await prisma.$executeRaw`DROP TABLE "Game"`;
    await prisma.$executeRaw`ALTER TABLE "Game_temp" RENAME TO "Game"`;

    return NextResponse.json({
      success: true,
      message: `Reorganized ${allGames.length} games with sequential IDs`,
      data: { totalGames: allGames.length }
    });
  } catch (error) {
    console.error('Error reorganizing IDs:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to reorganize IDs' 
      },
      { status: 500 }
    );
  }
}
