'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
const RaiseComplaint = noSSR(() => import('@/views/RaiseComplaint'), { ssr: false });
export default function Page() { return <RaiseComplaint />; }
