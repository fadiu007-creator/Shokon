import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'SHOKON — Find someone to spend time with', description: 'A marketplace for friends, companions and social experiences.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
