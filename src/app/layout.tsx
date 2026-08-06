import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Manrope } from 'next/font/google';
import './globals.css';

import BottomNavigation from '@/components/BottomNavigation';
import { LanguageProvider } from '@/context/LanguageContext';


const appName = 'Getachew fikadu jirata';


const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});


export const metadata: Metadata = {
  title: appName,
  description: 'A responsive Telegram Mini App for ekub ticket sales and live draws.',
};


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {

  return (
    <html lang="en" className="dark">

      <head>
        <script src="https://cdn.jsdelivr.net/npm/appwrite@16.0.2" async></script>
      </head>


      <body className={`${manrope.variable} bg-slate-950 text-slate-50 antialiased`}>

        <LanguageProvider>

          <div className="
            relative
            min-h-screen
            overflow-hidden
            bg-[radial-gradient(circle_at_top,_rgba(29,78,216,0.36),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,196,81,0.18),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_44%,#020617_100%)]
          ">

            <div className="
              absolute
              inset-0
              bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)]
              bg-[size:42px_42px]
              opacity-30
            " />


            <div className="
              relative
              mx-auto
              flex
              min-h-screen
              w-full
              flex-col
            ">

              {children}

            </div>


            <BottomNavigation />


          </div>

        </LanguageProvider>

      </body>

    </html>
  );
}
