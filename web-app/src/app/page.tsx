'use client';

import { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import GameGrid from '@/components/GameGrid';
import Container from '@/components/ui/Container';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ totalGames: 0, availableGames: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to browse if already authenticated
    if (session?.user) {
      router.replace('/pages/browse');
      return;
    }

    fetchPublicStats();
  }, [session, router]);

  const fetchPublicStats = async () => {
    try {
      const response = await fetch('/api/public-stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching public stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeroSection />
      <Container className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <i className="fas fa-gamepad text-indigo-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-500">Total Games</div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalGames}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-500">Available Now</div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.availableGames}
                </div>
              </div>
            </div>
          </div>
        </div>

        <GameGrid isPublic={true} showAllLoans={true} />

        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Borrowing Games Today</h2>
          <p className="text-gray-600 mb-8">Join our community and borrow from our extensive game library</p>
          <button
            onClick={() => router.push('/pages/auth/signin')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Sign In to Browse
          </button>
        </div>
      </Container>
    </>
  );
}
