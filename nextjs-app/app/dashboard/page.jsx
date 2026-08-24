'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
const ResidentDashboard = noSSR(() => import('@/views/ResidentDashboard'), { ssr: false });
export default function Page() { return <ResidentDashboard />; }
