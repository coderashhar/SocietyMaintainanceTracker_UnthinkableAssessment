'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
const Register = noSSR(() => import('@/views/Register'), { ssr: false });
export default function Page() { return <Register />; }
