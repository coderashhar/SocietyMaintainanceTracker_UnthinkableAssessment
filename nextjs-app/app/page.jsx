'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SplashScreen from '@/components/SplashScreen';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace(user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return <SplashScreen />;
}
