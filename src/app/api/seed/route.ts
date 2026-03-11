import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const games = [
  {
    title: 'The Legend of Zelda',
    platform: 'Nintendo Switch',
    genre: 'Action-Adventure',
    available: true,
    gradient: 'from-indigo-400 to-purple-500'
  },
  {
    title: 'Elden Ring',
    platform: 'PlayStation 5',
    genre: 'RPG',
    available: false,
    gradient: 'from-green-400 to-blue-500'
  },
  {
    title: 'FIFA 24',
    platform: 'Xbox Series X',
    genre: 'Sports',
    available: true,
    gradient: 'from-red-400 to-orange-500'
  },
  {
    title: 'Stardew Valley',
    platform: 'PC',
    genre: 'Simulation',
    available: true,
    gradient: 'from-purple-400 to-pink-500'
  }
];

export async function POST() {
  try {
    // Add seed games
    for (const game of games) {
      await prisma.game.create({
        data: game
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Seeded ${games.length} games successfully`
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to seed database' 
      },
      { status: 500 }
    );
  }
}
