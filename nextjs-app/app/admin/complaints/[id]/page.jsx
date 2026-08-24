'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';

const ComplaintDetail = noSSR(() => import('@/views/ComplaintDetail'), { ssr: false });

export default function Page() {
  return (
    <ProtectedRoute role="admin">
      <AppShell>
        <ComplaintDetail />
      </AppShell>
    </ProtectedRoute>
  );
}
