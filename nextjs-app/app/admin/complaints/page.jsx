'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
const AdminComplaints = noSSR(() => import('@/views/AdminComplaints'), { ssr: false });
export default function Page() { return <AdminComplaints />; }
