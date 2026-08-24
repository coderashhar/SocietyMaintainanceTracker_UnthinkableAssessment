'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';

const RaiseComplaint = noSSR(() => import('@/views/RaiseComplaint'), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute role="resident">
      <AppShell>
        <RaiseComplaint />
      </AppShell>
    </ProtectedRoute>
  );
}
