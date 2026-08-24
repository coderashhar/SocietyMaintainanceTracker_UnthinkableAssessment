'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
const NoticeBoard = noSSR(() => import('@/views/NoticeBoard'), { ssr: false });
export default function Page() { return <NoticeBoard />; }
