'use client';
import dynamic from 'next/dynamic';

const FYPApp = dynamic(() => import('../../fyp/App'), { ssr: false });

export default function FYPPage() {
  return <FYPApp />;
}
