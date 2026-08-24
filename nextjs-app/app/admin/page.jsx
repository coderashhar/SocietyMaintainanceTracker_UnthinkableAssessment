'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
const AdminDashboard = noSSR(() => import('@/views/AdminDashboard'), { ssr: false });
export default function Page() { return <AdminDashboard />; }
