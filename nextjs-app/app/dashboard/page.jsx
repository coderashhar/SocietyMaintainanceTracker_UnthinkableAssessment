'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';

const ResidentDashboard = noSSR(() => import('@/views/ResidentDashboard'), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute role="resident">
      <AppShell>
        <ResidentDashboard />
      </AppShell>
    </ProtectedRoute>
  );
}
