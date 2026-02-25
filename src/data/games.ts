import { Game } from '@/types/game';

export const games: Game[] = [
  {
    id: 1,
    title: 'The Legend of Zelda',
    platform: 'Nintendo Switch',
    genre: 'Action-Adventure',
    available: true,
    gradient: 'from-indigo-400 to-purple-500'
  },
  {
    id: 2,
    title: 'Elden Ring',
    platform: 'PlayStation 5',
    genre: 'RPG',
    available: false,
    gradient: 'from-green-400 to-blue-500'
  },
  {
    id: 3,
    title: 'FIFA 24',
    platform: 'Xbox Series X',
    genre: 'Sports',
    available: true,
    gradient: 'from-red-400 to-orange-500'
  },
  {
    id: 4,
    title: 'Stardew Valley',
    platform: 'PC',
    genre: 'Simulation',
    available: true,
    gradient: 'from-purple-400 to-pink-500'
  }
];
