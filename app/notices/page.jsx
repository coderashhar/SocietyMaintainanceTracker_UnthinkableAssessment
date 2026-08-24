'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';

const NoticeBoard = noSSR(() => import('@/views/NoticeBoard'), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute role="">
      <AppShell>
        <NoticeBoard />
      </AppShell>
    </ProtectedRoute>
  );
}
