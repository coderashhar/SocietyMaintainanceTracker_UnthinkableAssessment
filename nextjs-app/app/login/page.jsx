'use client';
export const dynamic = 'force-dynamic';
import noSSR from 'next/dynamic';
const Login = noSSR(() => import('@/views/Login'), { ssr: false });
export default function Page() { return <Login />; }
