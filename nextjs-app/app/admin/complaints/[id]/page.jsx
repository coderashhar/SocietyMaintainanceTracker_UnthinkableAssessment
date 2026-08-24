'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
const ComplaintDetail = noSSR(() => import('@/views/ComplaintDetail'), { ssr: false });
export default function Page() { return <ComplaintDetail />; }
