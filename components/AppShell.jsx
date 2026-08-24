'use client';

import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function AppShellLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className={user ? 'app-layout' : ''}>
      {user && <Navbar />}
      <main className={user ? 'main-content' : ''}>
        {children}
      </main>
    </div>
  );
}
