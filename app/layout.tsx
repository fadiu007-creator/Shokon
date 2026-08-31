import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'SHOKON — Find someone to spend time with',description:'Friends, companions and social experiences by the hour.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
