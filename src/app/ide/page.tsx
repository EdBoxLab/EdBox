'use client';
import dynamic from 'next/dynamic';

const IDEApp = dynamic(() => import('./App'), { ssr: false });
const ThemeProvider = dynamic(() => import('../../lib/contexts/ThemeContext').then(mod => ({ default: mod.ThemeProvider })), { ssr: false });

export default function IDEPage() {
  return (
    <ThemeProvider>
      <IDEApp />
    </ThemeProvider>
  );
}
