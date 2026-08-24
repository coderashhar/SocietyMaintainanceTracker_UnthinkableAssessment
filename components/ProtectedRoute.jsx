'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SplashScreen from '@/components/SplashScreen';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, loading, role, router]);

  if (loading) return <SplashScreen />;
  if (!user) return null;
  if (role && user.role !== role) return null;

  return children;
}
